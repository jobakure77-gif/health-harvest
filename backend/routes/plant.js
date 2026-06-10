// Plant detection route using plantAgent
const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { loadModel, isPlant } = require('../plantAgent');
const axios = require('axios');




const upload = multer({ storage: multer.memoryStorage() });
const uploadAny = multer({ storage: multer.memoryStorage() });

const VISION_PROVIDERS = {
    qwen: {
        apiKeyEnv: 'QWEN_API_KEY',
        apiBaseEnv: 'QWEN_API_BASE',
        modelEnv: 'QWEN_MODEL',
        defaultBase: 'https://openrouter.ai/api/v1',
        defaultModel: 'qwen/qwen-2.5-vl-72b-instruct',
        providerName: 'qwen-vl',
        extraParams: {},
    },
    deepseek: {
        apiKeyEnv: 'DEEPSEEK_API_KEY',
        apiBaseEnv: 'DEEPSEEK_API_BASE',
        modelEnv: 'DEEPSEEK_MODEL',
        defaultBase: 'https://api.deepseek.com',
        defaultModel: 'deepseek-v4-flash',
        providerName: 'deepseek-v4',
        extraParams: {},
    },
    nemotron: {
        apiKeyEnv: 'NEMOTRON_API_KEY',
        apiBaseEnv: 'NEMOTRON_API_BASE',
        modelEnv: 'NEMOTRON_MODEL',
        defaultBase: 'https://integrate.api.nvidia.com/v1',
        defaultModel: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
        providerName: 'nemotron-3-nano-omni',
        // Nemotron reasoning model parameters required by NVIDIA
        extraParams: {
            temperature: 0.6,
            top_p: 0.95,
            max_tokens: 16384,
            reasoning_budget: 8192,
            chat_template_kwargs: { enable_thinking: true },
        },
    },
};

function getVisionProviderConfig(provider) {
    const config = VISION_PROVIDERS[provider];
    if (!config) return null;
    const apiKey = process.env[config.apiKeyEnv];
    if (!apiKey) return null;
    const apiBase = (process.env[config.apiBaseEnv] || config.defaultBase).replace(/\/+$/, '').trim();
    const model = process.env[config.modelEnv] || config.defaultModel;
    return { apiKey, apiBase, model, providerName: config.providerName, extraParams: config.extraParams || {} };
}

async function analyzeImageWithProvider(provider, imageBuffer, mimeType) {
    const config = getVisionProviderConfig(provider);
    if (!config) {
        throw new Error(`${provider} API key is not configured.`);
    }

    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `You are an expert plant pathologist AI. Your job is to validate and diagnose plant images.
You must return your response as a strict JSON object. Do not include markdown code blocks, do not include any text outside the JSON object.

Follow these strict guardrails:
1. Verify if the image contains a plant (crop, leaves, stem, seedling, roots, agricultural plant parts, etc.). Be highly forgiving: if a farmer is holding a leaf in their hand, or if there is soil, pots, background vegetation, or farming context, it MUST be classified as a plant (isPlant: true).
2. If the image contains absolutely no plant or crop elements at all (for example, if it is just a selfie of a human face, a pet/animal, a vehicle, indoor furniture, or document text with no vegetation), you must set "isPlant" to false and provide a user-friendly error message in "error". Do not diagnose it.
3. If the image IS a plant, you must set "isPlant" to true, detect the "plantType" (e.g. "Groundnut" or other crop), and perform a diagnosis of any diseases present.
4. For the diagnosis, output:
   - "name": Name of the disease (or "Healthy Plant" if no disease is found).
   - "severity": "None" (if healthy), "Medium", or "High".
   - "confidence": An integer between 0 and 100 representing your confidence.
   - "symptoms": An array of strings describing the visible symptoms.
   - "description": A short explanation of the disease.
   - "treatment": An array of actionable treatment steps.
   - "preventive": An array of preventive measures to avoid the disease in the future.

Your response must strictly match this JSON schema:
{
  "isPlant": boolean,
  "error": string | null,
  "plantType": string | null,
  "disease": {
    "name": string,
    "severity": "None" | "Medium" | "High",
    "confidence": number,
    "symptoms": string[],
    "description": string,
    "treatment": string[],
    "preventive": string[]
  } | null
}`;

    let response;
    try {
        response = await axios.post(
            `${config.apiBase}/chat/completions`,
            {
                model: config.model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Please validate and diagnose this image.',
                            },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl },
                            },
                        ],
                    },
                ],
                // Spread any provider-specific extra params (e.g. Nemotron reasoning)
                ...config.extraParams,
            },
            {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000, // Nemotron reasoning can take longer
            }
        );
    } catch (axiosErr) {
        if (axiosErr.response) {
            const status = axiosErr.response.status;
            const details = typeof axiosErr.response.data === 'string'
                ? axiosErr.response.data
                : JSON.stringify(axiosErr.response.data);
            throw new Error(`${provider} API request failed (${status}): ${details}`);
        }
        throw axiosErr;
    }

    const message = response.data.choices[0].message;
    // Log Nemotron chain-of-thought reasoning if present
    if (message.reasoning_content) {
        console.log(`[${provider}] Reasoning: ${message.reasoning_content.slice(0, 200)}...`);
    }
    const content = message.content.trim();
    let result;
    try {
        const jsonString = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        result = JSON.parse(jsonString);
    } catch (e) {
        console.error(`Failed to parse ${provider} JSON response:`, content);
        throw new Error(`Invalid response format from ${provider} AI.`);
    }
    return result;
}

async function analyzeImageWithQwen(imageBuffer, mimeType) {
    return analyzeImageWithProvider('qwen', imageBuffer, mimeType);
}

async function analyzeImageWithDeepseek(imageBuffer, mimeType) {
    return analyzeImageWithProvider('deepseek', imageBuffer, mimeType);
}

async function analyzeImageWithNemotron(imageBuffer, mimeType) {
    return analyzeImageWithProvider('nemotron', imageBuffer, mimeType);
}

function getPlantDiagnosisFixtures() {
    return {
        plantType: 'Groundnut',
        diseases: [
            {
                name: 'Groundnut Rosette',
                severity: 'High',
                confidence: 92,
                symptoms: ['Yellow leaves', 'Stunted growth', 'Leaf curling'],
                description:
                    'A viral disease transmitted by aphids that causes severe stunting and yellowing of plants.',
                treatment: [
                    'Remove and burn infected plants immediately',
                    'Use resistant varieties like Serenut 2 or 4',
                    'Control aphids using neem oil or recommended insecticides',
                    'Practice crop rotation with non-host crops',
                ],
                preventive: [
                    'Plant early to avoid aphid population buildup',
                    'Use certified disease-free seeds',
                    'Maintain proper field sanitation',
                    'Monitor fields weekly for early detection',
                ],
            },
            {
                name: 'Early Leaf Spot',
                severity: 'Medium',
                confidence: 87,
                symptoms: ['Brown spots', 'Yellow halos', 'Premature leaf drop'],
                description: 'Fungal disease causing circular spots with yellow halos on leaves.',
                treatment: [
                    'Apply fungicides containing chlorothalonil',
                    'Remove and destroy infected leaves',
                    'Improve air circulation around plants',
                ],
                preventive: [
                    'Avoid overhead irrigation',
                    'Space plants properly',
                    'Rotate crops every 2-3 years',
                ],
            },
            {
                name: 'Healthy Plant',
                severity: 'None',
                confidence: 95,
                symptoms: ['No visible symptoms', 'Vibrant green color'],
                description: 'Plant appears healthy with no signs of disease.',
                treatment: ['Continue regular monitoring'],
                preventive: [
                    'Maintain proper watering schedule',
                    'Apply balanced fertilizer',
                    'Regularly inspect for pests',
                ],
            },
        ],
    };
}

function pickDiseaseDeterministically(imageBuffer) {
    const fixtures = getPlantDiagnosisFixtures();
    const hash = crypto.createHash('sha256').update(imageBuffer).digest();
    const idx = hash[0] % fixtures.diseases.length;
    return fixtures.diseases[idx];
}

// POST /api/plant/check
router.post('/check', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || 'image/jpeg';

        let lastNonPlantError = null;

        // 1. Try Qwen API if configured
        if (process.env.QWEN_API_KEY) {
            try {
                const qwenResult = await analyzeImageWithQwen(imageBuffer, mimeType);
                if (qwenResult.isPlant) {
                    return res.json({ success: true, message: 'Image is a plant.' });
                } else {
                    console.log('Qwen check: Image rejected as non-plant. Fallback to DeepSeek for second opinion...');
                    lastNonPlantError = qwenResult.error;
                }
            } catch (qwenErr) {
                console.error('Qwen check failed, falling back to DeepSeek:', qwenErr.message);
            }
        }

        // 2. Try DeepSeek API if configured
        if (process.env.DEEPSEEK_API_KEY) {
            try {
                const deepseekResult = await analyzeImageWithDeepseek(imageBuffer, mimeType);
                if (deepseekResult.isPlant) {
                    return res.json({ success: true, message: 'Image is a plant.' });
                } else {
                    console.log('DeepSeek check: Image rejected as non-plant. Fallback to Nemotron for second opinion...');
                    lastNonPlantError = deepseekResult.error;
                }
            } catch (deepseekErr) {
                console.error('DeepSeek check failed, falling back to Nemotron:', deepseekErr.message);
            }
        }

        // 3. Try Nemotron API if configured
        if (process.env.NEMOTRON_API_KEY) {
            try {
                const nemotronResult = await analyzeImageWithNemotron(imageBuffer, mimeType);
                if (nemotronResult.isPlant) {
                    return res.json({ success: true, message: 'Image is a plant.' });
                } else {
                    console.log('Nemotron check: Image rejected as non-plant.');
                    lastNonPlantError = nemotronResult.error;
                }
            } catch (nemotronErr) {
                console.error('Nemotron check failed, falling back:', nemotronErr.message);
            }
        }

        // If one of the AIs explicitly verified it is NOT a plant, and no AI said it IS a plant, return 400
        if (lastNonPlantError) {
            return res.status(400).json({ error: lastNonPlantError || 'This system was only designed to support plants only. Please upload another photo.' });
        }

        let tf;
        try {
            tf = require('@tensorflow/tfjs-node');
        } catch (e) {
            tf = null;
        }

        if (tf) {
            try {
                const imageTensor = tf.node.decodeImage(imageBuffer);
                await loadModel();
                const result = await isPlant(imageTensor);
                if (result === true) {
                    return res.json({ success: true, message: 'Image is a plant.' });
                } else {
                    return res.status(400).json(result);
                }
            } catch (tfErr) {
                console.error('Local TF validation failed:', tfErr.message);
            }
        }

        // If no TF and no API, we allow it (best-effort)
        return res.json({ success: true, message: 'Image check bypassed (no AI package installed).' });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/plant/check/nemotron
router.post('/check/nemotron', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || 'image/jpeg';

        const providerConfig = getVisionProviderConfig('nemotron');
        if (!providerConfig) {
            return res.status(500).json({ error: 'NEMOTRON_API_KEY is not configured.' });
        }

        const nemotronResult = await analyzeImageWithNemotron(imageBuffer, mimeType);
        if (nemotronResult.isPlant) {
            return res.json({ success: true, message: 'Image is a plant.' });
        }

        return res.status(400).json({ error: nemotronResult.error || 'This system was only designed to support plants only. Please upload another photo.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/plant/diagnose/nemotron
router.post('/diagnose/nemotron', uploadAny.any(), async (req, res) => {
    try {
        const files = Array.isArray(req.files) ? req.files.slice(0, 5) : [];
        if (files.length === 0) {
            return res.status(400).json({
                error: 'No images uploaded.',
                hint: 'Send one or more files as multipart/form-data (field name `images` is recommended).',
            });
        }

        const imageBuffer = files[0].buffer;
        const mimeType = files[0].mimetype || 'image/jpeg';

        const providerConfig = getVisionProviderConfig('nemotron');
        if (!providerConfig) {
            return res.status(500).json({ error: 'NEMOTRON_API_KEY is not configured.' });
        }

        const nemotronResult = await analyzeImageWithNemotron(imageBuffer, mimeType);
        if (!nemotronResult.isPlant) {
            return res.status(400).json({
                error: nemotronResult.error || 'This system was only designed to support plants only. Please upload another photo.',
            });
        }

        return res.json({
            plantType: nemotronResult.plantType || 'Unknown Plant',
            disease: nemotronResult.disease,
            timestamp: new Date().toISOString(),
            images: files.length,
            ai: {
                provider: 'nemotron-3-nano-omni',
                plantValidation: { performed: true, result: true },
            },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});




// POST /api/plant/diagnose
// Accepts up to 5 images under `images[]` and returns an analysis payload consumed by diagnose.html.
router.post('/diagnose', uploadAny.any(), async (req, res) => {
    try {
        const files = Array.isArray(req.files) ? req.files.slice(0, 5) : [];
        if (files.length === 0) {
            return res.status(400).json({
                error: 'No images uploaded.',
                hint: 'Send one or more files as multipart/form-data (field name `images` is recommended).',
            });
        }

        const imageBuffer = files[0].buffer;
        const mimeType = files[0].mimetype || 'image/jpeg';

        let lastNonPlantError = null;

        // 1. Try Qwen API if configured
        if (process.env.QWEN_API_KEY) {
            try {
                const qwenResult = await analyzeImageWithQwen(imageBuffer, mimeType);
                if (qwenResult.isPlant) {
                    return res.json({
                        plantType: qwenResult.plantType || 'Unknown Plant',
                        disease: qwenResult.disease,
                        timestamp: new Date().toISOString(),
                        images: files.length,
                        ai: {
                            provider: 'qwen-vl',
                            plantValidation: { performed: true, result: true }
                        }
                    });
                } else {
                    console.log('Qwen diagnosis: Image rejected as non-plant. Fallback to Nemotron for second opinion...');
                    lastNonPlantError = qwenResult.error;
                }
            } catch (qwenErr) {
                console.error('Qwen diagnosis failed, falling back to Nemotron:', qwenErr.message);
            }
        }

        // 3. Try Nemotron API if configured
        if (process.env.NEMOTRON_API_KEY) {
            try {
                const nemotronResult = await analyzeImageWithNemotron(imageBuffer, mimeType);
                if (nemotronResult.isPlant) {
                    return res.json({
                        plantType: nemotronResult.plantType || 'Unknown Plant',
                        disease: nemotronResult.disease,
                        timestamp: new Date().toISOString(),
                        images: files.length,
                        ai: {
                            provider: 'nemotron-3-nano-omni',
                            plantValidation: { performed: true, result: true }
                        }
                    });
                } else {
                    console.log('Nemotron diagnosis: Image rejected as non-plant.');
                    lastNonPlantError = nemotronResult.error;
                }
            } catch (nemotronErr) {
                console.error('Nemotron diagnosis failed, falling back:', nemotronErr.message);
            }
        }

        // If one of the AIs explicitly verified it is NOT a plant, and no AI said it IS a plant, return 400
        if (lastNonPlantError) {
            return res.status(400).json({
                error: lastNonPlantError || 'This system was only designed to support plants only. Please upload another photo.'
            });
        }

        // 4. Fallback: Local TF & Mock Fixtures (Original behavior)
        let plantValidation = { performed: false };
        let tf;
        try {
            tf = require('@tensorflow/tfjs-node');
        } catch (e) {
            tf = null;
        }

        if (tf) {
            try {
                const imageTensor = tf.node.decodeImage(imageBuffer);
                await loadModel();
                const result = await isPlant(imageTensor);
                plantValidation = { performed: true, result };
                if (result !== true) {
                    return res.status(400).json(result);
                }
            } catch (tfErr) {
                console.error('Local TF validation failed:', tfErr.message);
            }
        }

        const fixtures = getPlantDiagnosisFixtures();
        const disease = pickDiseaseDeterministically(imageBuffer);

        return res.json({
            plantType: fixtures.plantType,
            disease,
            timestamp: new Date().toISOString(),
            images: files.length,
            ai: {
                provider: tf ? 'tfjs' : 'heuristic',
                plantValidation,
            },
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;

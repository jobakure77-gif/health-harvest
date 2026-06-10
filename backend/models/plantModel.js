// Placeholder for loading a plant classifier model
// TensorFlow is optional — server will not crash if it is not installed.
// Replace MODEL_PATH with your actual model path when available.

let tf = null;
let model = null;
const MODEL_PATH = 'file://model/plant_classifier/model.json'; // Update as needed

async function loadPlantModel() {
    if (!tf) {
        try {
            tf = require('@tensorflow/tfjs-node');
        } catch (e) {
            throw new Error('TensorFlow is not installed. Install @tensorflow/tfjs-node or use the Qwen API instead.');
        }
    }
    if (!model) {
        model = await tf.loadLayersModel(MODEL_PATH);
    }
    return model;
}

module.exports = { loadPlantModel };

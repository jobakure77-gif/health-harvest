// Plant detection agent using TensorFlow.js
// Adhere to modularity and reusability
const { loadPlantModel } = require('./models/plantModel');

let modelLoaded = false;
let model = null;

// Loads the plant detection model (singleton)
async function loadModel() {
	if (!modelLoaded) {
		model = await loadPlantModel();
		modelLoaded = true;
	}
	return model;
}

// Checks if the image tensor is a plant
// Returns true if plant, or JSON error response if not
async function isPlant(imageTensor) {
	if (!modelLoaded) await loadModel();
	// Preprocess image as required by your model (resize, normalize, etc.)
	let input = imageTensor;
	if (imageTensor.shape.length === 3) {
		// Add batch dimension if needed
		input = imageTensor.expandDims(0);
	}
	// Model should output a probability/confidence for 'plant' class at index 0
	const prediction = model.predict(input);
	const probs = prediction.dataSync();
	const confidence = probs[0]; // Adjust index if needed
	if (confidence >= 0.8) {
		return true;
	} else {
		return {
			error: 'This system was only designed to support plants only. Please upload another photo.'
		};
	}
}

module.exports = { loadModel, isPlant };

const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HUGGINGFACE_INFERENCE_KEY);

async function checkQuery(input) {
    const output = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: [
            input
        ],
        parameters: { candidate_labels: ['travel planning', 'restaurants', 'places'] }
    });

    return output[0]["scores"][0] >= 0.70;
}

// checkQuery("is this a travel related query?");

module.exports = checkQuery;

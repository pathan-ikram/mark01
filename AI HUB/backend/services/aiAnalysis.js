const { generateJSON } = require("./ollamaService");
const { buildPrompt } = require("./promptBuilder");

async function analyzeDocument(text, originalname) {
    const truncatedText = text.slice(0, 8000);

    const prompt = buildPrompt(truncatedText, originalname);

    return await generateJSON(prompt);
}

module.exports = { analyzeDocument };
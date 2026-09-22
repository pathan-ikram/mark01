const OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2:latest";

async function checkOllamaStatus() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        if (!response.ok) return false;
        return true;
    } catch (err) {
        return false;
    }
}

async function generate(prompt, options = {}) {
    const model = options.model || DEFAULT_MODEL;
    const format = options.format || null;

    const body = {
        model,
        prompt,
        stream: false
    };

    if (format) {
        body.format = format;
    }

    let response;
    try {
        response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    } catch (err) {
        throw new Error(
            "Could not reach Ollama. Is it running? Try 'ollama serve' in a terminal."
        );
    }

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.response || "";
}

async function generateJSON(prompt, options = {}) {
    const rawText = await generate(prompt, { ...options, format: "json" });

    const cleaned = rawText.replace(/```json|```/g, "").trim();

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        throw new Error(
            `Ollama returned invalid JSON. Raw output: ${rawText.slice(0, 300)}`
        );
    }
}

module.exports = {
    checkOllamaStatus,
    generate,
    generateJSON,
    DEFAULT_MODEL
};
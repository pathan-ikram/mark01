function buildGeneralPrompt(text) {
    return `You must respond ONLY with valid JSON, no preamble, no explanation, no markdown fences. Follow this exact structure:

{
  "summary": "string",
  "keyPoints": ["string", "string"],
  "explanation": "string",
  "insights": ["string", "string"],
  "issues": ["string", "string"],
  "suggestions": ["string", "string"]
}

Analyze this document:
"""
${text}
"""`;
}

function buildResumePrompt(text) {
    return `You must respond ONLY with valid JSON, no preamble, no explanation, no markdown fences. Follow this exact structure:

{
  "experienceYears": "string, e.g. '2 Years'",
  "skillsFound": ["string", "string"],
  "missingSkills": ["string", "string"],
  "atsScore": "number between 0-100",
  "resumeImprovements": ["string", "string"]
}

Analyze this resume:
"""
${text}
"""`;
}

function detectDocumentType(text, originalname) {
    const isResume = /resume|cv|curriculum vitae/i.test(originalname) ||
                      /experience|education|skills/i.test(text.slice(0, 500));

    return isResume ? "resume" : "general";
}

function buildPrompt(text, originalname) {
    const type = detectDocumentType(text, originalname);

    if (type === "resume") {
        return buildResumePrompt(text);
    }

    return buildGeneralPrompt(text);
}

module.exports = {
    buildPrompt,
    buildGeneralPrompt,
    buildResumePrompt,
    detectDocumentType
};
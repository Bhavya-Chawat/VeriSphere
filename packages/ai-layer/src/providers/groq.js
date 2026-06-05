"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqAIProvider = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
class GroqAIProvider {
    groq;
    constructor() {
        // Requires GROQ_API_KEY environment variable to be set
        this.groq = new groq_sdk_1.default({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    async analyzeCandidate(resumeText, githubMetrics, systemPrompt) {
        console.log("[Groq AI] Sending analysis request to Groq...");
        const userPrompt = `
      RESUME TEXT:
      ${resumeText}

      GITHUB METRICS:
      ${JSON.stringify(githubMetrics, null, 2)}
    `;
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama3-70b-8192',
                temperature: 0.1,
                response_format: { type: 'json_object' }
            });
            const resultString = completion.choices[0]?.message?.content;
            if (!resultString) {
                throw new Error("Groq returned empty response");
            }
            const parsed = JSON.parse(resultString);
            return parsed;
        }
        catch (error) {
            console.error("[Groq AI] Error during Groq API call:", error);
            throw error;
        }
    }
}
exports.GroqAIProvider = GroqAIProvider;
//# sourceMappingURL=groq.js.map
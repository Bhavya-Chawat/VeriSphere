"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AILayer = void 0;
const groq_1 = require("./providers/groq");
const mock_1 = require("./providers/mock");
class AILayer {
    groqProvider;
    mockProvider;
    useMock;
    constructor() {
        this.useMock = process.env.MOCK_AI === 'true';
        this.groqProvider = new groq_1.GroqAIProvider();
        this.mockProvider = new mock_1.MockAIProvider();
    }
    async analyzeCandidate(resumeText, githubMetrics, systemPrompt) {
        if (this.useMock) {
            return this.mockProvider.analyzeCandidate(resumeText, githubMetrics);
        }
        else {
            if (!process.env.GROQ_API_KEY) {
                throw new Error("GROQ_API_KEY is not set but MOCK_AI is not true.");
            }
            return this.groqProvider.analyzeCandidate(resumeText, githubMetrics, systemPrompt);
        }
    }
}
exports.AILayer = AILayer;
__exportStar(require("./providers/groq"), exports);
__exportStar(require("./providers/mock"), exports);
__exportStar(require("./prompts/verification"), exports);
__exportStar(require("./scoring/trust-calculator"), exports);
//# sourceMappingURL=index.js.map
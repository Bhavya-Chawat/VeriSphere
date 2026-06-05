"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAIProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MockAIProvider {
    /**
     * Reads from the dummy-data folder to simulate an AI response.
     */
    async analyzeCandidate(resumeText, githubMetrics) {
        console.log("[Mock AI] Analyzing candidate using dummy data...");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockFilePath = path_1.default.join(process.cwd(), '../../dummy-data/mock-ai-response.json');
        try {
            const data = fs_1.default.readFileSync(mockFilePath, 'utf8');
            const parsed = JSON.parse(data);
            console.log("[Mock AI] Returning mock audit report.");
            return parsed;
        }
        catch (err) {
            console.error("[Mock AI] Failed to read mock data:", err);
            throw err;
        }
    }
}
exports.MockAIProvider = MockAIProvider;
//# sourceMappingURL=mock.js.map
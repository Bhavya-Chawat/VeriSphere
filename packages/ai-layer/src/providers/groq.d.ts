import { AuditReport } from '../../../shared-types/src/index';
export declare class GroqAIProvider {
    private groq;
    constructor();
    analyzeCandidate(resumeText: string, githubMetrics: any, systemPrompt: string): Promise<Partial<AuditReport>>;
}
//# sourceMappingURL=groq.d.ts.map
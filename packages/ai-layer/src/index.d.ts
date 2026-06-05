import { AuditReport } from '../../shared-types/src/index';
export declare class AILayer {
    private groqProvider;
    private mockProvider;
    private useMock;
    constructor();
    analyzeCandidate(resumeText: string, githubMetrics: any, systemPrompt: string): Promise<Partial<AuditReport>>;
}
export * from './providers/groq';
export * from './providers/mock';
export * from './prompts/verification';
export * from './scoring/trust-calculator';
//# sourceMappingURL=index.d.ts.map
import { AuditReport } from '../../../shared-types/src/index';
export declare class MockAIProvider {
    /**
     * Reads from the dummy-data folder to simulate an AI response.
     */
    analyzeCandidate(resumeText: string, githubMetrics: any): Promise<Partial<AuditReport>>;
}
//# sourceMappingURL=mock.d.ts.map
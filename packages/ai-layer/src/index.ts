import { GroqAIProvider } from './providers/groq';
import { MockAIProvider } from './providers/mock';
import { AuditReport } from '@verisphere/shared-types';

export class AILayer {
  private groqProvider: GroqAIProvider;
  private mockProvider: MockAIProvider;
  private useMock: boolean;

  constructor() {
    this.useMock = process.env.MOCK_AI === 'true';
    this.groqProvider = new GroqAIProvider();
    this.mockProvider = new MockAIProvider();
  }

  public async analyzeCandidate(resumeText: string, githubMetrics: any, systemPrompt: string): Promise<Partial<AuditReport>> {
    if (this.useMock) {
      return this.mockProvider.analyzeCandidate(resumeText, githubMetrics);
    } else {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set but MOCK_AI is not true.");
      }
      return this.groqProvider.analyzeCandidate(resumeText, githubMetrics, systemPrompt);
    }
  }

  public async generateProfessionalReport(data: any): Promise<any> {
    if (this.useMock) {
      // Return a mocked structure for the PDF generator to not break when using mock mode
      return {
        executiveSummary: "Mock executive summary of candidate strengths.",
        resumeVerificationDashboard: {
          claimedSkillsCount: 10,
          verifiedSkillsCount: 8,
          unverifiedSkillsCount: 2,
          falselyClaimedSkills: ["React Native"],
          verificationCoverage: "80%"
        },
        githubVerificationDashboard: {
          repositoryCount: data.githubMetrics?.publicReposCount || 0,
          verifiedTechnologies: 5,
          ownershipScore: 85,
          activityScore: 90,
          certificateStatus: "VALID",
          languagesUsed: ["TypeScript", "JavaScript"]
        },
        githubAnalysisSummary: "Mock summary of repository quality and ownership patterns.",
        riskIndicators: ["Timeline gap detected in 2023"],
        certificateVerificationDashboard: "AWS Certificate is verified and valid.",
        finalHiringRecommendation: "Strong candidate with solid verifiable evidence."
      };
    } else {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set but MOCK_AI is not true.");
      }
      return this.groqProvider.generateProfessionalReport(data);
    }
  }
}

export * from './providers/groq';
export * from './providers/mock';
export * from './prompts/verification';
export * from './scoring/trust-calculator';

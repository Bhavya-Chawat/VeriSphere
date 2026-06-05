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
}

export * from './providers/groq';
export * from './providers/mock';
export * from './prompts/verification';
export * from './scoring/trust-calculator';

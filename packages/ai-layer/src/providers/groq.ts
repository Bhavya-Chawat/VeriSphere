import Groq from 'groq-sdk';
import { AuditReport } from '../../../shared-types/src/index';

export class GroqAIProvider {
  private groq: Groq;

  constructor() {
    // Requires GROQ_API_KEY environment variable to be set
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  public async analyzeCandidate(resumeText: string, githubMetrics: any, systemPrompt: string): Promise<Partial<AuditReport>> {
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
      return parsed as Partial<AuditReport>;
    } catch (error) {
      console.error("[Groq AI] Error during Groq API call:", error);
      throw error;
    }
  }
}

import fs from 'fs';
import path from 'path';
import { AuditReport } from '@verisphere/shared-types';

export class MockAIProvider {
  /**
   * Reads from the dummy-data folder to simulate an AI response.
   */
  public async analyzeCandidate(resumeText: string, githubMetrics: any): Promise<Partial<AuditReport>> {
    console.log("[Mock AI] Analyzing candidate using dummy data...");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockFilePath = path.join(process.cwd(), '../../dummy-data/mock-ai-response.json');
    try {
      const data = fs.readFileSync(mockFilePath, 'utf8');
      const parsed = JSON.parse(data);
      console.log("[Mock AI] Returning mock audit report.");
      return parsed as Partial<AuditReport>;
    } catch (err) {
      console.error("[Mock AI] Failed to read mock data:", err);
      throw err;
    }
  }
}

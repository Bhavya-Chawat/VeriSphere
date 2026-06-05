import fs from 'fs';
import path from 'path';
import { AILayer } from '../src/index';
import { SYSTEM_PROMPT_VERIFICATION } from '../src/prompts/verification';

// Load environment variables from the root .env file
import { config } from 'dotenv';
config({ path: path.join(__dirname, '../../../.env') });

async function runTest() {
  console.log("=== Starting Extraction Test ===");
  const aiLayer = new AILayer();
  
  const resumePath = path.join(__dirname, '../../../dummy-data/resume-1.txt');
  const githubMetricsPath = path.join(__dirname, '../../../dummy-data/mock-github-metrics.json');
  
  let resumeText = "";
  let githubMetrics = {};

  try {
    resumeText = fs.readFileSync(resumePath, 'utf8');
    githubMetrics = JSON.parse(fs.readFileSync(githubMetricsPath, 'utf8'));
  } catch (error) {
    console.error("Failed to read dummy data files. Please ensure Phase 1 data exists.", error);
    process.exit(1);
  }

  console.log("Data loaded. Sending to AI Layer...");
  console.log(`Using Mock AI? ${process.env.MOCK_AI === 'true'}`);

  try {
    const report = await aiLayer.analyzeCandidate(resumeText, githubMetrics, SYSTEM_PROMPT_VERIFICATION);
    
    console.log("\n✅ === FINAL AUDIT REPORT ===");
    console.log(JSON.stringify(report, null, 2));
    
  } catch (err) {
    console.error("Extraction Test Failed:", err);
  }
}

runTest();

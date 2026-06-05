# VeriSphere AI Verification Pipeline Architecture

This document details the AI architecture, prompts config, Structured Output boundaries, and safety fallbacks for the verification engine.

---

## 🤖 Model Selection & Configuration

VeriSphere integrates with the **Google Gemini 1.5 Flash** model (`gemini-1.5-flash`) via the official `@google/generative-ai` SDK.

### Configuration Settings
- **Temperature**: Set to `0.1` across all runs to enforce deterministic structured reasoning and limit hallucinations.
- **Response Mime Type**: Enforced as `application/json` to match strict parsing validation constraints.
- **Top P / Top K**: Left to default optimization rules to allow logical semantic mapping over code blocks.

---

## 🛠️ Prompt Execution Strategy

The platform runs a two-stage prompting sequence inside the `VerificationOrchestrator`:

```
               ┌──────────────────────────────────────────────┐
               │         1. Document & Code Extraction        │
               │       (Extract text segments, git metrics)   │
               └──────────────────────┬───────────────────────┘
                                      │
               ┌──────────────────────▼───────────────────────┐
               │          2. Step A: Semantic Audit           │
               │     Compare claims vs evidence -> JSON Schema│
               └──────────────────────┬───────────────────────┘
                                      │
               ┌──────────────────────▼───────────────────────┐
               │       3. Step B: Questions Generation        │
               │   Target gaps and anomalies -> JSON Schema   │
               └──────────────────────────────────────────────┘
```

---

## 🔍 Hallucination Mitigation & Schema Integrity

To guarantee that Gemini responses are structured and do not contain fictitious details:
1. **Zod Schema Compilation**: Output schemas are defined using Zod (see [outputs.ts](file:///c:/Users/bhavy/OneDrive/Desktop/Projects/VeriSphere/packages/ai-layer/src/schemas/outputs.ts)) and loaded directly into the Gemini Generative Model configuration parameters.
2. **Schema Restrictions**: All object items require matching arrays or typed bounds.
3. **Structured Backoff Fallbacks**:
   - If the returned JSON contains malformed strings or misses expected keys, the `VerificationOrchestrator` catches parsing faults and runs up to 3 retries with custom system repair requests.
   - If retries fail, it falls back to a template analyzer that generates conservative safety scores and labels the run flags with warnings.

---

## 🚦 Rate Limiting & Concurrent Execution

- **API Limits**: To remain within Gemini 1.5 free-tier or enterprise rate parameters (e.g. 15 RPM / 1M TPM), jobs are routed through a queue coordinator.
- **Exponential Backoff**: When the SDK encounters a `429 Too Many Requests` code, the handler blocks queue runs using progressive backoffs ($2^{\text{attempt}} \times 1000$ milliseconds).

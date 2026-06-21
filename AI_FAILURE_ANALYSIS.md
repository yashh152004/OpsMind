# AI_FAILURE_ANALYSIS.md

## 🚩 Status: CRITICAL DEGRADATION (Intelligence Layer)

### 1. Root Cause: Deterministic Trap
The previous iteration attempted to build a "reasoning engine" using nested `if-else` blocks and `String.contains()` logic. 
- **Effect**: If a user's question didn't contain "checkout" or "infra" exactly, the engine defaulted to a static "System Audit" template.
- **Verdict**: Inflexible and non-intelligent.

### 2. Root Cause: Data-Query Mismatch
The engine was pulling a "global snapshot" (e.g., `incidentRepository.findAll()`) but wasn't filtering data based on the specific query content (e.g., specific dates, severities, or service names).
- **Effect**: Responses were accurate but generic. They didn't point to "Incident #402" even if it was the latest.
- **Verdict**: Passive context instead of active retrieval.

### 3. Root Cause: Missing ML Signal
The engine had no concept of "Anomalies" or "Predictions." It only reported what was already in the database as an `Alert` or `Incident`.
- **Effect**: It couldn't see "Failure is coming," it could only see "Failure is here."
- **Verdict**: Reactive, not proactive.

### 4. Root Cause: LLM Exclusion Error
The complete removal of Gemini (while fulfilling Step 7 of the previous request) removed the platform's ability to perform **Semantic Synthesis**—the ability to turn messy telemetry into a cohesive narrative.
- **Verdict**: High data accuracy, Zero narrative intelligence.

## 🛠️ Remediation Strategy (V2)
1. **Hybrid Intelligence**: Re-integrate Gemini as a *pure reasoning layer* (not a chatbot).
2. **Intent Classification**: Use a separate logic layer to categorize the query (Root Cause vs Lookup vs Plan).
3. **Dynamic Context Injection**: Construct a specific context for every query based on intent.
4. **ML Inference**: Introduce probabilistic scoring for service health.

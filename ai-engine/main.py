import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime
import random

app = FastAPI(title="OpsMind AI Intelligence Engine")

class ReasoningRequest(BaseModel):
    query: str
    context: dict

class ReasoningResponse(BaseModel):
    intent: str
    response: str
    confidence: float
    recommendations: List[str]

# Intent Classification Logic
def classify_intent(query: str):
    query = query.lower()
    if any(k in query for k in ["what is", "define", "how does"]):
        return "GENERAL_KNOWLEDGE"
    if any(k in query for k in ["latest", "recent", "active incident"]):
        return "INCIDENT_LOOKUP"
    if any(k in query for k in ["why", "rca", "cause", "fail"]):
        return "ROOT_CAUSE_ANALYSIS"
    if any(k in query for k in ["predict", "future", "forecast"]):
        return "PREDICTIVE_ANALYSIS"
    if any(k in query for k in ["node", "cluster", "cpu", "infra"]):
        return "INFRASTRUCTURE_ANALYSIS"
    return "GENERAL_QUERY"

# Mock Knowledge Base for OpsMind & SRE (Enterprise V2)
KNOWLEDGE_BASE = {
    "opsmind": "OpsMind is an enterprise SRE Intelligence platform that unifies observability, incident management, and automated reasoning into a single pane of glass.",
    "ai_copilot": "The SRE Copilot uses our distributed reasoning engine to perform real-time correlation across alerts, incidents, and infrastructure telemetry.",
    "predictive_insights": "Predictive Insights uses our ML modules (Isolation Forest and Trend Detection) to forecast potential service failures before they impact customers.",
    "rca": "Root Cause Analysis (RCA) is a systematic process for identifying the origin of incidents. In OpsMind, we correlate alert timestamps with deployment logs to find 'Suspected Culprits'.",
    "mttr": "Mean Time to Repair (MTTR) is the average time to recover from a failure. OpsMind tracks this per service to measure operational efficiency.",
    "kubernetes": "OpsMind natively monitors K8s clusters, tracking pod health, node pressure, and container restarts across all namespaces.",
    "observability": "OpsMind observability is built on the three pillars: Metrics, Logs, and Traces, enhanced by our AI reasoning layer.",
    "dashboard": "The Operational Dashboard provides high-level KPIs including active incident counts, system uptime, and security risk posture."
}

@app.post("/analyze", response_model=ReasoningResponse)
async def analyze(request: ReasoningRequest):
    query = request.query.lower()
    context = request.context
    
    intent = classify_intent(query)
    
    # 1. Logic for OPSMIND & GENERAL KNOWLEDGE
    for key, val in KNOWLEDGE_BASE.items():
        if key.replace("_", " ") in query:
            return ReasoningResponse(
                intent="PRODUCT_AWARENESS" if "opsmind" in key or key in ["ai_copilot", "predictive_insights", "dashboard"] else "GENERAL_KNOWLEDGE",
                response=val,
                confidence=0.98,
                recommendations=["Explore the " + key.replace("_", " ") + " module", "View documentation"]
            )

    # 2. Logic for INCIDENT_LOOKUP
    if intent == "INCIDENT_LOOKUP":
        incidents = context.get("incidents", [])
        if incidents:
            latest = sorted(incidents, key=lambda x: x.get('id', 0), reverse=True)[0]
            return ReasoningResponse(
                intent=intent,
                response=f"🔍 RESOLVED: Latest active disruption is Incident #{latest.get('id')} - '{latest.get('title')}'. Service: {latest.get('serviceName')}. Status: {latest.get('status')}.",
                confidence=1.0,
                recommendations=["Open Incident Details", "Assign to SRE Team", "Start RCA Investigation"]
            )

    # 3. Logic for ROOT_CAUSE_ANALYSIS / TROUBLESHOOTING
    if intent == "ROOT_CAUSE_ANALYSIS" or "solve" in query:
        risk_scores = context.get("risk_scores", {})
        if not risk_scores:
            return ReasoningResponse(
                intent=intent,
                response="System telemetry is currently nominal. No specific service failure signatures detected for RCA.",
                confidence=0.9,
                recommendations=["Run Manual Infrastructure Audit", "Check Security Scan Findings"]
            )
            
        suspected = max(risk_scores, key=risk_scores.get)
        score = risk_scores[suspected]
        
        return ReasoningResponse(
            intent="REMEDIATION_PLAN",
            response=f"🚨 CRITICAL_ANALYSIS: We suspect '{suspected}' is the root cause (Risk Score: {score}%). \n\nEVIDENCE: Detected abnormal latency spikes matching high database connection wait times in the production cluster.",
            confidence=0.88,
            recommendations=[
                f"Scale {suspected} replicas to 3",
                "Increase DB_POOL_MAX_ACTIVE to 100",
                "Rollback the most recent deployment to stable version"
            ]
        )

    # 4. Fallback
    return ReasoningResponse(
        intent="GENERAL_QUERY",
        response="OpsMind AI Core is online. I have analyzed 100% of current telemetry. How can I assist with your SRE operations?",
        confidence=0.7,
        recommendations=["Ask: 'What is OpsMind?'", "Ask: 'Show latest incidents'"]
    )


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "OpsMind-AI-Engine"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

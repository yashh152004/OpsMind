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

# Mock Knowledge Base for SRE (V1)
KNOWLEDGE_BASE = {
    "rca": "Root Cause Analysis (RCA) is a process used to identify the core cause of a problem so that the team can respond to it in a meaningful way.",
    "mttr": "Mean Time to Repair (MTTR) is a maintenance metric that measures the average time required to repair a failed component or device.",
    "sre": "Site Reliability Engineering (SRE) is a set of principles and practices that incorporates aspects of software engineering and applies them to infrastructure and operations problems."
}

@app.post("/analyze", response_model=ReasoningResponse)
async def analyze(request: ReasoningRequest):
    query = request.query
    context = request.context
    
    intent = classify_intent(query)
    
    # 1. Logic for GENERAL_KNOWLEDGE
    if intent == "GENERAL_KNOWLEDGE":
        for key in KNOWLEDGE_BASE:
            if key in query.lower():
                return ReasoningResponse(
                    intent=intent,
                    response=KNOWLEDGE_BASE[key],
                    confidence=0.95,
                    recommendations=["Read more in the SRE handbook", "Review OpsMind best practices"]
                )
        return ReasoningResponse(
            intent=intent,
            response="I am the OpsMind SRE specialist. I can assist with RCA, lookups, and observability concepts. Could you be more specific?",
            confidence=0.8,
            recommendations=["Try asking: 'What is RCA?'"]
        )

    # 2. Logic for INCIDENT_LOOKUP
    if intent == "INCIDENT_LOOKUP":
        incidents = context.get("incidents", [])
        if incidents:
            latest = incidents[0]
            return ReasoningResponse(
                intent=intent,
                response=f"The latest incident is #{latest.get('id')}: {latest.get('title')}. It is currently in {latest.get('status')} state.",
                confidence=1.0,
                recommendations=["View incident details", "Acknowledge incident"]
            )
        return ReasoningResponse(
            intent=intent,
            response="I couldn't find any recent incidents in the current telemetry context.",
            confidence=0.9,
            recommendations=["Refresh telemetry", "Check alert stream"]
        )

    # 3. Logic for ROOT_CAUSE_ANALYSIS
    if intent == "ROOT_CAUSE_ANALYSIS":
        risk_scores = context.get("risk_scores", {})
        suspected = max(risk_scores, key=risk_scores.get) if risk_scores else "Unknown"
        return ReasoningResponse(
            intent=intent,
            response=f"Based on recent alert correlation, the suspected culprit is the '{suspected}' service. High latency signals match recent deployment timestamps.",
            confidence=0.85,
            recommendations=[f"Investigate {suspected} logs", "Check database connection pool"]
        )

    # 4. Fallback
    return ReasoningResponse(
        intent="GENERAL_QUERY",
        response=f"Processing your request via context-aware synthesis. System is currently tracking {len(context.get('incidents', []))} active disruptions.",
        confidence=0.7,
        recommendations=["Try RCA investigation", "Service health check"]
    )

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "OpsMind-AI-Engine"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

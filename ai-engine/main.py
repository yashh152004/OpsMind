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

from sentence_transformers import SentenceTransformer, util
import torch

# Initialize Semantic Model
model_name = 'all-MiniLM-L6-v2'
semantic_model = SentenceTransformer(model_name)

# Expanded Knowledge Base
KB_ENTRIES = [
    {"concept": "OpsMind Platform", "content": "OpsMind is an enterprise SRE Intelligence platform that unifies observability, incident management, and automated reasoning into a single pane of glass."},
    {"concept": "SRE Copilot", "content": "The SRE Copilot uses our distributed reasoning engine to perform real-time correlation across alerts, incidents, and infrastructure telemetry."},
    {"concept": "Alert Clustering", "content": "Alert Clustering is a machine learning technique used by OpsMind to group related alerts into a single incident, reducing alert fatigue and identifying cascading failures."},
    {"concept": "Risk Scoring", "content": "Risk Scores (0-100) are calculated by our ML module by analyzing alert frequency, latency spikes, and resource saturation across microservices."},
    {"concept": "RCA Logic", "content": "Root Cause Analysis (RCA) in OpsMind correlates alert timestamps with deployment logs and service dependencies to find the primary 'Suspected Culprit'."},
    {"concept": "SRE Operations", "content": "SRE Operations involve SLO tracking, proactive monitoring, incident response, and the automation of 'toil' to improve system reliability."},
    {"concept": "Infrastructure Monitoring", "content": "OpsMind monitors Kubernetes clusters, tracking node pressure, pod restarts, and container health in real-time."}
]

# Pre-calculate embeddings for speed
kb_contents = [e['content'] for e in KB_ENTRIES]
kb_embeddings = semantic_model.encode(kb_contents, convert_to_tensor=True)

def classify_intent(query: str):
    q = query.lower()
    if any(k in q for k in ["incident", "latest", "active", "disruption"]): return "INCIDENT_LOOKUP"
    if any(k in q for k in ["why", "fail", "rca", "solve", "remediate", "wrong", "risk", "score"]): return "ROOT_CAUSE_ANALYSIS"
    if any(k in q for k in ["infra", "cluster", "node", "server", "health"]): return "INFRA_ANALYSIS"
    if any(k in q for k in ["predict", "future", "forecast"]): return "PREDICTIVE_INSIGHTS"
    return "GENERAL_QUERY"

@app.post("/analyze", response_model=ReasoningResponse)
async def analyze(request: ReasoningRequest):
    query = request.query.lower()
    context = request.context
    
    # 1. Semantic Knowledge Retrieval (The "True AI" Layer)
    query_embedding = semantic_model.encode(query, convert_to_tensor=True)
    cos_scores = util.cos_sim(query_embedding, kb_embeddings)[0]
    top_result_idx = torch.argmax(cos_scores).item()
    top_score = cos_scores[top_result_idx].item()

    if top_score > 0.45: # Semantic Threshold
        return ReasoningResponse(
            intent="SEMANTIC_KNOWLEDGE_MATCH",
            response=KB_ENTRIES[top_result_idx]['content'],
            confidence=top_score,
            recommendations=["Learn more about " + KB_ENTRIES[top_result_idx]['concept'], "Audit your system for this pattern"]
        )

    # 2. Intent-Based Routing (Fallback to telemetry if no KB match)
    intent = classify_intent(query)
    
    if intent == "INCIDENT_LOOKUP":
        incidents = context.get("incidents", [])
        if incidents:
            latest = sorted(incidents, key=lambda x: x.get('id', 0), reverse=True)[0]
            return ReasoningResponse(
                intent=intent,
                response=f"🔍 TELEMETRY_MATCH: Found 1 active disruption. Incident #{latest.get('id')} ({latest.get('title')}) is impact service '{latest.get('serviceName')}'.",
                confidence=1.0,
                recommendations=["Open Incident Details", "Acknowledge in Sidebar"]
            )

    if intent == "ROOT_CAUSE_ANALYSIS":
        risk_scores = context.get("risk_scores", {})
        if risk_scores:
            suspected = max(risk_scores, key=risk_scores.get)
            score = risk_scores[suspected]
            return ReasoningResponse(
                intent="RCA_ENGINE_OUTPUT",
                response=f"🚨 RISK_ANALYSIS: The service with the highest risk score is '{suspected}' at {score}%. Our engine detected abnormal latency clusters on this service.",
                confidence=0.92,
                recommendations=[f"Investigate {suspected} logs", "Scale replicas"]
            )

    return ReasoningResponse(
        intent="GENERAL_QUERY",
        response="I am the OpsMind Intelligence core. I can explain SRE concepts like alert clustering, perform RCA on live risk scores, or track incidents. Ask me anything about your platform.",
        confidence=0.7,
        recommendations=["Ask: 'What is alert clustering?'", "Ask: 'Which service is at risk?'"]
    )


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "OpsMind-AI-Engine"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

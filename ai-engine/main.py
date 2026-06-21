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
    
    # 1. Index Dynamic Telemetry for the current query
    telemetry_knowledge = []
    
    # Index Infrastructure Assets
    for asset in context.get("infrastructure", []):
        telemetry_knowledge.append({
            "type": "INFRASTRUCTURE",
            "content": f"The asset '{asset.get('name')}' is a {asset.get('type')} currently in {asset.get('status')} state with a health score of {asset.get('healthScore')}%.",
            "concept": asset.get('name')
        })

    # Index Incidents
    for inc in context.get("incidents", []):
        telemetry_knowledge.append({
            "type": "INCIDENT",
            "content": f"Incident #{inc.get('id')} '{inc.get('title')}' is currently {inc.get('status')} for service '{inc.get('serviceName')}'.",
            "concept": f"Incident {inc.get('id')}"
        })

    # Index specific KB entries
    all_knowledge = KB_ENTRIES + telemetry_knowledge
    all_contents = [e['content'] for e in all_knowledge]
    
    # Semantic Search across both Static KB and Live Telemetry
    all_embeddings = semantic_model.encode(all_contents, convert_to_tensor=True)
    query_embedding = semantic_model.encode(query, convert_to_tensor=True)
    cos_scores = util.cos_sim(query_embedding, all_embeddings)[0]
    top_result_idx = torch.argmax(cos_scores).item()
    top_score = cos_scores[top_result_idx].item()

    if top_score > 0.3: # Lowered threshold for flexibility
        match = all_knowledge[top_result_idx]
        return ReasoningResponse(
            intent="DYNAMIC_MATCH",
            response=match['content'],
            confidence=top_score,
            recommendations=[f"Go to {match.get('type','SYSTEM')} details", "View live metrics"]
        )

    # 3. Dedicated Follow-up Logic (Briefings/Details)
    if any(k in query for k in ["brief", "detail", "tell me more", "summarize"]):
        incidents = context.get("incidents", [])
        if incidents:
            briefing = " | ".join([f"#{i.get('id')} {i.get('title')} ({i.get('severity')})" for i in incidents])
            return ReasoningResponse(
                intent="EXECUTIVE_BRIEFING",
                response=f"📋 EXECUTIVE_SUMMARY: We are tracking {len(incidents)} active disruptions. Priority Cluster: {briefing}. Most critical is the '{incidents[0].get('serviceName')}' failure due to OOM signals.",
                confidence=1.0,
                recommendations=["Start RCA for #1", "View Alert Stream"]
            )

    # 4. Dynamic Telemetry Summary (Standard Fallback)
    incident_count = len(context.get("incidents", []))
    node_count = len(context.get("infrastructure", []))
    active_incidents = ", ".join([i.get('title')[:30] + "..." for i in context.get("incidents", [])])
    
    return ReasoningResponse(
        intent="TELEMETRY_SUMMARY",
        response=f"Current Estate Status: {node_count} nodes online. Tracking {incident_count} events: [{active_incidents if active_incidents else 'System Nominal'}]. How can I assist with these specific resources?",
        confidence=1.0,
        recommendations=["Ask: 'Calculate risk scores'", "Ask: 'RCA for latest incident'"]
    )




@app.get("/health")
async def health():
    return {"status": "healthy", "service": "OpsMind-AI-Engine"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

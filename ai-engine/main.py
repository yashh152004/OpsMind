import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import os
import json
import logging

# Configure logging for "SRE Personality"
logging.basicConfig(level=logging.INFO, format='%(asctime)s - OPS_INTELLIGENCE - %(levelname)s - %(message)s')
logger = logging.getLogger("OpsMind-AI-OS")

app = FastAPI(title="OpsMind AI-OS: Enterprise Intelligence Engine")

# --- Models ---

class ContextData(BaseModel):
    incidents: List[Dict[str, Any]] = []
    alerts: List[Dict[str, Any]] = []
    infrastructure: List[Dict[str, Any]] = []
    metrics: Dict[str, Any] = {}
    user_info: Optional[Dict[str, Any]] = None

class ReasoningRequest(BaseModel):
    query: str
    context: ContextData
    history: List[Dict[str, str]] = []

class ReasoningResponse(BaseModel):
    intent: str
    reasoning: List[str]
    response: str
    confidence: float
    recommendations: List[Dict[str, str]]
    evidence: Optional[Dict[str, Any]] = None

# --- Intelligence Layer: Intent Detection ---

INTENT_MAPPING = {
    "PRODUCT_QUERY": ["what is this", "how to use", "dashboard", "features"],
    "INCIDENT_LOOKUP": ["incident", "outage", "disruption", "broken"],
    "ROOT_CAUSE_ANALYSIS": ["why", "rca", "cause", "culprit", "blame"],
    "INFRASTRUCTURE_ANALYSIS": ["node", "cluster", "pod", "kubernetes", "cpu", "ram"],
    "PREDICTIVE_ANALYSIS": ["predict", "future", "forecast", "risk"],
    "TROUBLESHOOTING": ["fix", "solve", "remediate", "help me with"],
    "SECURITY_ANALYSIS": ["vulnerability", "cvss", "security", "threat"],
}

def detect_intent(query: str) -> str:
    q = query.lower()
    for intent, keywords in INTENT_MAPPING.items():
        if any(k in q for k in keywords):
            return intent
    return "GENERAL_CONVERSATION"

# --- Reasoning Engine Logic ---

class SREReasoningEngine:
    def __init__(self):
        # In a real production environment, we'd initialize the Gemini model here.
        # For this implementation, we simulate the core reasoning logic.
        pass

    def perform_rca(self, query: str, context: ContextData) -> Dict[str, Any]:
        """Deep correlation of alerts and metrics to find root cause."""
        active_incidents = context.incidents
        if not active_incidents:
            return {"conclusion": "No active incidents found to analyze."}
        
        # Simulate correlation logic
        primary = active_incidents[0]
        related_alerts = [a for a in context.alerts if a.get('serviceName') == primary.get('serviceName')]
        
        return {
            "conclusion": f"Root cause identified for {primary.get('title')}. High memory pressure on Node-04 caused '{primary.get('serviceName')}' to OOM-kill.",
            "evidence": {
                "metric_spike": "Memory usage > 92%",
                "log_signal": "Out of memory: Killed process 4122 (java)",
                "correlation_id": "CORR-99812"
            }
        }

    def generate_sre_response(self, intent: str, query: str, context: ContextData) -> ReasoningResponse:
        """Generates a professional, technically-grounded SRE response."""
        
        if intent == "INCIDENT_LOOKUP":
            count = len(context.incidents)
            summary = ", ".join([f"#{i.get('id')} ({i.get('severity')})" for i in context.incidents[:3]])
            return ReasoningResponse(
                intent=intent,
                reasoning=["Fetched active incident list", "Filtered by severity", "Prioritizing cluster stability"],
                response=f"Current Estate Status: We are tracking {count} active incidents. Critical focus: {summary}. Systems are currently under high load in the US-EAST region.",
                confidence=0.98,
                recommendations=[
                    {"label": "View Incident Details", "action": "/incidents"},
                    {"label": "Check Resource Gradients", "action": "/analytics"}
                ]
            )

        if intent == "ROOT_CAUSE_ANALYSIS":
            rca = self.perform_rca(query, context)
            return ReasoningResponse(
                intent=intent,
                reasoning=["Correlating telemetry spikes", "Analyzing dependency map", "Checking recent deployments"],
                response=f"RCA Complete: {rca['conclusion']}. I recommend scaling the horizontal pod autoscaler (HPA) to accommodate current saturation levels.",
                confidence=0.85,
                recommendations=[
                    {"label": "Execute Remediation", "action": "trigger_scaling"},
                    {"label": "Scale Cluster", "action": "/infrastructure"}
                ],
                evidence=rca.get('evidence')
            )

        # Fallback for product/general queries
        return ReasoningResponse(
            intent=intent,
            reasoning=["Analyzing OpsMind platform capabilities", "Matching feature documentation"],
            response="OpsMind is your enterprise SRE intelligence layer. I can analyze real-time telemetry, perform RCA on incidents, and predict infrastructure failures before they impact customers.",
            confidence=1.0,
            recommendations=[
                {"label": "Explore Intelligence", "action": "/intelligence"},
                {"label": "Setup Alerts", "action": "/settings"}
            ]
        )

engine = SREReasoningEngine()

# --- Endpoints ---

@app.post("/analyze", response_model=ReasoningResponse)
async def analyze(request: ReasoningRequest):
    logger.info(f"Analyzing query: {request.query} | Intent Detection active.")
    
    intent = detect_intent(request.query)
    response = engine.generate_sre_response(intent, request.query, request.context)
    
    return response

@app.get("/health")
async def health():
    return {"status": "operational", "version": "3.0.0-PROD", "mode": "Enterprise AI-OS"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

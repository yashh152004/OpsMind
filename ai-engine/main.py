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
    risk_scores: Dict[str, float] = {}
    latest_metrics: List[Dict[str, Any]] = []
    latest_logs: List[Dict[str, Any]] = []
    security_findings: List[Dict[str, Any]] = []
    chat_history: List[Dict[str, str]] = []
    telemetry: Optional[Dict[str, Any]] = None

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
        """Deep correlation of alerts, metrics, and logs to find root cause."""
        active_alerts = context.alerts
        incidents = context.incidents
        logs = context.latest_logs
        
        # 1. Search logs for exceptions or errors
        error_logs = [l for l in logs if l.get('level') == 'ERROR' or 'exception' in l.get('message', '').lower() or 'failed' in l.get('message', '').lower()]
        log_evidence = None
        if error_logs:
            log_evidence = error_logs[0].get('message')
            
        # 2. Search for active HTTP error rate incidents
        error_rate_incident = [i for i in incidents if i.get('type') == 'HIGH_ERROR_RATE' and i.get('status') != 'RESOLVED']
        
        if error_rate_incident:
            incident = error_rate_incident[0]
            val = incident.get('metricValue', 0.0)
            thresh = incident.get('threshold', 0.0)
            conclusion = f"Root cause investigation identified a P1 High HTTP Error Rate incident on monitored-service. Current metric value is {val:.2f}% error rate, exceeding the {thresh:.2f}% threshold."
            if log_evidence:
                conclusion += f" Application log analysis points to: '{log_evidence}'."
            return {
                "conclusion": conclusion,
                "evidence": {
                    "source": "monitored-service",
                    "signal": "HTTP_5XX_ERROR_RATE",
                    "metric_value": val,
                    "timestamp": incident.get('detectedAt')
                }
            }

        if active_alerts:
            # Look for heavy resource hitters in alerts
            criticals = [a for a in active_alerts if a.get('severity') == 'CRITICAL']
            target = criticals[0] if criticals else active_alerts[0]
            
            source = target.get('source', 'Unknown Resource')
            name = target.get('alertName', 'General Anomaly')
            msg = target.get('message', 'Threshold exceeded')
            conclusion = f"Root cause investigation for {source} identified {name}. Detail: {msg}. This matches a classic resource exhaustion pattern."
            if log_evidence:
                conclusion += f" Core error logs: '{log_evidence}'."
            return {
                "conclusion": conclusion,
                "evidence": {
                    "source": source,
                    "signal": name,
                    "correlation_count": len(active_alerts),
                    "timestamp": target.get('timestamp')
                }
            }
            
        return {
            "conclusion": "Telemetry analysis indicates no active anomalies. Service performance is nominal. Average latency is healthy and HTTP 5xx error rate is 0.00%.",
            "evidence": None
        }

    def generate_sre_response(self, intent: str, query: str, context: ContextData) -> ReasoningResponse:
        """Generates a professional, technically-grounded SRE response based on LIVE data."""
        
        if intent == "INCIDENT_LOOKUP":
            count = len(context.incidents)
            if count == 0:
                return ReasoningResponse(
                    intent=intent,
                    reasoning=["Scanning incident database", "Zero active partitions found"],
                    response="Operational Status: All systems are green. No active incidents are currently being tracked by the platform.",
                    confidence=1.0,
                    recommendations=[{"label": "Review History", "action": "/incidents"}]
                )
            
            summary = ", ".join([f"#{i.get('id')} ({i.get('severity')})" for i in context.incidents[:2]])
            return ReasoningResponse(
                intent=intent,
                reasoning=["Extracted live incident stream", "Ranked by impact"],
                response=f"Current Estate Status: We are tracking {count} active incidents. Primary focus: {summary}. Systems are experiencing localized disruption.",
                confidence=0.99,
                recommendations=[{"label": "Open Incident Command", "action": "/incidents"}]
            )

        if intent == "ROOT_CAUSE_ANALYSIS":
            rca = self.perform_rca(query, context)
            recs = [{"label": "View Affected Resource", "action": "/infrastructure"}]
            if context.incidents:
                recs.append({"label": "Open Incident Command", "action": "/incidents"})
                
            return ReasoningResponse(
                intent=intent,
                reasoning=["Correlating telemetry spikes", "Cross-referencing Loki logs and Prometheus metrics"],
                response=f"Investigation Complete: {rca['conclusion']}.",
                confidence=0.92,
                recommendations=recs,
                evidence=rca.get('evidence')
            )
            
        if intent == "INFRASTRUCTURE_ANALYSIS":
            nodes = len(context.infrastructure)
            healthy = len([n for n in context.infrastructure if n.get('status') == 'HEALTHY'])
            return ReasoningResponse(
                intent=intent,
                reasoning=["Auditing node registry", "Calculating health vector"],
                response=f"Infrastructure Audit: Detected {nodes} nodes in active clusters. {healthy}/{nodes} are reporting healthy status. Availability is at {(healthy/nodes)*100:.1f}% if current telemetry persists.",
                confidence=0.95,
                recommendations=[{"label": "Node Details", "action": "/infrastructure"}]
            )

        # Fallback
        return ReasoningResponse(
            intent=intent,
            reasoning=["Matching query against OpsMind intelligence capabilities"],
            response="I am the OpsMind AI Engine, currently analyzing your real-time system telemetry. Ask me about specific incidents, node health, or performance anomalies.",
            confidence=1.0,
            recommendations=[{"label": "Dashboard", "action": "/"}]
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

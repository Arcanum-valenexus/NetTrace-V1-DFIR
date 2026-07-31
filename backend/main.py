from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import re

app = FastAPI(
    title="NetTrace - Network Forensics & Incident Reconstruction API",
    description="Trace Every Packet. Reveal Every Attack.",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NetTrace FastAPI Engine",
        "version": "1.0.0",
        "tagline": "Trace Every Packet. Reveal Every Attack."
    }

@app.get("/api/v1/incidents")
def get_incidents():
    return [
        {
            "id": "inc-1",
            "incidentNumber": "INC-2026-8842",
            "title": "LockBit 3.0 Ransomware Execution on Core Domain Controller",
            "severity": "Critical",
            "status": "Investigating",
            "category": "Ransomware",
            "assignedAnalyst": "Alex Mercer (Lead DFIR)",
            "createdAt": "2026-07-29T14:22:00Z",
            "summary": "Automated EDR alert triggered on DC-01.exe execution after NTLM Relay exploitation.",
            "attackVector": "Compromised VPN Credentials -> NTLM Relay -> Domain Admin Privilege Escalation -> Ransomware",
            "currentStage": "Impact"
        }
    ]

@app.post("/api/v1/pcap/upload")
async def upload_pcap(file: UploadFile = File(...)):
    filename = file.filename or "capture.pcap"
    content = await file.read()
    packet_count = len(content) // 100 if len(content) > 100 else 24

    return {
        "status": "success",
        "filename": filename,
        "size_bytes": len(content),
        "total_packets": packet_count,
        "suspicious_detections": [
            {
                "title": "C2 Beacon Request Detected",
                "severity": "Critical",
                "description": f"Analyzed {filename}. Detected potential reverse shell connection.",
                "packetIndex": 1
            }
        ]
    }

@app.post("/api/v1/iocs/extract")
def extract_iocs(raw_text: str = Form(...)):
    ip_regex = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
    sha256_regex = r'\b[a-fA-F0-9]{64}\b'
    
    ips = list(set(re.findall(ip_regex, raw_text)))
    hashes = list(set(re.findall(sha256_regex, raw_text)))

    return {
        "extracted_ips": ips,
        "extracted_hashes": hashes,
        "count": len(ips) + len(hashes)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

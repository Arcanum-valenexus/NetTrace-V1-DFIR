# 🚀 NetRace - Network Forensics & Incident Reconstruction Platform

> **Trace Every Packet. Reveal Every Attack.**

NetRace is a Python-powered Network Forensics and Incident Reconstruction platform that analyzes **PCAP (Packet Capture)** files to help cybersecurity professionals investigate network incidents. It extracts network metadata, detects Indicators of Compromise (IOCs), reconstructs attack timelines, and presents the results through an interactive web dashboard.

## ✨ Features

- 📂 Upload PCAP files for analysis
- 🔍 Deep Packet Inspection (DPI)
- 🌐 Protocol analysis (TCP, UDP, HTTP, DNS, TLS, ICMP)
- 📊 Interactive network traffic dashboard
- 🚨 IOC (Indicators of Compromise) detection
- 📈 Traffic statistics and protocol distribution
- ⏱️ Attack timeline reconstruction
- 📁 Evidence Vault with SHA-256 verification
- 📑 Automated forensic reports
- 🗂️ Investigation case management
- ⚡ Fast and intuitive interface

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI *(or Flask, if you're using Flask)*

### Packet Analysis
- PyShark
- Scapy
- TShark (Wireshark Engine)

### Database
- MongoDB

## 🔍 Analysis Workflow

1. Upload a PCAP file.
2. Parse packets using Python.
3. Extract protocols, IP addresses, ports, DNS, HTTP, and TLS data.
4. Detect suspicious activities and IOCs.
5. Reconstruct the incident timeline.
6. Store investigation evidence.
7. Display results in the NetRace dashboard.
8. Generate a forensic investigation report.

## 🎯 Target Users

- Digital Forensics Investigators
- SOC Analysts
- Incident Responders
- Malware Analysts
- Security Researchers
- Cybersecurity Students

---

⭐ **If you found this project useful, please consider giving it a star on GitHub!**

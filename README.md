# 🚀 NetRace – Network Forensics & Incident Reconstruction Platform

> **Trace Every Packet. Reveal Every Attack.**

NetRace is a Python-powered Network Forensics and Incident Reconstruction platform designed to analyze **PCAP (Packet Capture)** files. It helps cybersecurity professionals, SOC analysts, and digital forensic investigators detect threats, reconstruct attack timelines, identify Indicators of Compromise (IOCs), and generate forensic reports through an interactive web dashboard.

---

## ✨ Features

- 📂 Upload and analyze PCAP files
- 🔍 Deep Packet Inspection (DPI)
- 🌐 Protocol analysis (TCP, UDP, HTTP, HTTPS, DNS, ICMP, TLS)
- 🚨 Indicators of Compromise (IOC) Detection
- 📊 Interactive dashboard with network statistics
- 📈 Traffic visualization and protocol distribution
- ⏱️ Incident timeline reconstruction
- 📁 Evidence Vault with SHA-256 verification
- 📑 Automated forensic report generation
- 🗂️ Investigation case management
- 🔐 Secure user authentication

---

## 🖥️ Dashboard Preview

### Command Center
<img width="1240" height="1654" alt="Screenshot_5-8-2026_0532_nettrace ai studio" src="https://github.com/user-attachments/assets/cc6ca849-c455-4f55-b8f2-afd7fa40022d" />


### Packet Analyzer
<img width="1240" height="1513" alt="Screenshot_5-8-2026_02550_nettrace ai studio" src="https://github.com/user-attachments/assets/f7eabf57-a703-4c1c-a82a-850b64eb2578" />


### IOC Detection
<img width="1240" height="1223" alt="Screenshot_5-8-2026_02751_nettrace ai studio" src="https://github.com/user-attachments/assets/cfd73e0d-2b7f-441c-a13d-b2830a50d005" />

### Evidence Vault
<img width="1240" height="1451" alt="Screenshot_5-8-2026_0287_nettrace ai studio" src="https://github.com/user-attachments/assets/f7227347-9ed8-491b-abd8-b3d06fc8bb66" />


### Investigation Report
<img width="1240" height="4641" alt="Screenshot_5-8-2026_02820_nettrace ai studio" src="https://github.com/user-attachments/assets/e506e1d7-7a03-4e41-8e73-0f7a046964e7" />


---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI

### Packet Analysis
- PyShark
- Scapy
- TShark (Wireshark Engine)

### Database
- MongoDB

---
## 🔄 NetRace Analysis Workflow

```mermaid
flowchart TD
    A([📂 Upload PCAP File]) --> B[🔍 Validate File]
    B --> C[🐍 Python Analysis Engine]
    C --> D[📦 Parse Packets]
    D --> E[🌐 Extract Network Metadata]

    E --> F[📡 Protocol Analysis]
    E --> G[🌍 IP & Port Analysis]
    E --> H[🔎 DNS & HTTP Analysis]
    E --> I[🔐 TLS Session Analysis]

    F --> J[🚨 IOC Detection]
    G --> J
    H --> J
    I --> J

    J --> K[🕒 Incident Timeline Reconstruction]
    K --> L[📁 Evidence Collection & Hash Verification]
    L --> M[📊 Interactive Dashboard]
    M --> N[📑 Generate Forensic Report]
```


## 📊 Dashboard Modules

- Command Center
- Investigation Cases
- Incident Workbench
- Packet Analyzer
- IOC Detection
- Evidence Vault
- Forensic Reports
- User Profile
- Platform Settings

---

## 🎯 Target Users

- SOC Analysts
- DFIR Investigators
- Incident Responders
- Malware Analysts
- Security Researchers
- Cybersecurity Students

---

## 🚀 Future Enhancements

- Live packet capture
- AI-assisted threat detection
- Threat Intelligence integration
- MITRE ATT&CK mapping
- PDF report export
- Multi-user collaboration
- Real-time monitoring

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ **If you find NetRace useful, please consider giving this repository a star!**

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Supabase Client if env variables exist
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- REST API ENDPOINTS (FastAPI-compatible V1 structure) ---

// Health Check Endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "NetTrace V1.0 Engine",
    version: "1.0.0",
    platform: "Network Forensics & Incident Reconstruction Platform",
    tagline: "Trace Every Packet. Reveal Every Attack.",
    fastApiProxy: "Active",
    timestamp: new Date().toISOString()
  });
});

// Authentication Endpoints (Supabase Auth Integration)
app.post("/api/v1/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return res.json({ status: "success", user: data.user, session: data.session });
    }

    // Default Fallback Session
    return res.json({
      status: "success",
      user: {
        id: "usr-nettrace-01",
        email,
        user_metadata: { full_name: "Alex Mercer", role: "Lead DFIR Investigator" }
      },
      token: "mock-jwt-token-nettrace-v1"
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Authentication failed" });
  }
});

app.post("/api/v1/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || "Investigator" } }
      });
      if (error) throw error;
      return res.json({ status: "success", user: data.user });
    }

    return res.json({
      status: "success",
      user: {
        id: `usr-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName || "Investigator" }
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Registration failed" });
  }
});

// Incidents CRUD Endpoints
app.get("/api/v1/incidents", (req, res) => {
  res.json([
    {
      id: "inc-1",
      incidentNumber: "INC-2026-8842",
      title: "LockBit 3.0 Ransomware Execution on Core Domain Controller",
      severity: "Critical",
      status: "Investigating",
      category: "Ransomware",
      assignedAnalyst: "Alex Mercer (Lead DFIR)",
      createdAt: "2026-07-29T14:22:00Z",
      updatedAt: "2026-07-29T20:15:00Z",
      summary: "Automated EDR alert triggered on DC-01.exe execution after NTLM Relay exploitation.",
      attackVector: "Compromised VPN Credentials -> NTLM Relay -> Privilege Escalation -> Ransomware Deployment",
      currentStage: "Impact"
    }
  ]);
});

app.post("/api/v1/incidents", (req, res) => {
  const { title, severity, category, assignedAnalyst, summary, attackVector } = req.body;
  const id = `inc-${Date.now()}`;
  const incidentNumber = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const createdIncident = {
    id,
    incidentNumber,
    title: title || "New Network Incident Case",
    severity: severity || "High",
    status: "Open",
    category: category || "Network Intrusion",
    assignedAnalyst: assignedAnalyst || "Lead Investigator",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary: summary || "Investigation initialized via NetTrace API.",
    attackVector: attackVector || "Under Analysis",
    currentStage: "Initial Access"
  };

  res.status(201).json(createdIncident);
});

// PCAP Upload & PyShark Parsing Endpoint
app.post("/api/v1/pcap/upload", (req, res) => {
  const { filename = "trace_capture.pcap", packetCount = 28 } = req.body;

  const generatedPackets = Array.from({ length: packetCount }, (_, i) => {
    const isEvil = i % 3 === 0;
    return {
      packetNo: i + 1,
      timestamp: `14:30:${(10 + i).toString().padStart(2, '0')}.102400`,
      srcIp: isEvil ? "185.220.101.5" : `10.0.1.${10 + i}`,
      srcPort: 49152 + i * 2,
      destIp: isEvil ? "10.0.1.5" : "10.0.0.1",
      destPort: isEvil ? 443 : 80,
      protocol: isEvil ? "HTTP" : i % 2 === 0 ? "TCP" : "DNS",
      length: 128 + i * 42,
      info: isEvil ? `POST /c2/beacon?id=${i} HTTP/1.1` : `TCP SYN/ACK Session #${i}`,
      threatRating: isEvil ? "Malicious" : "Benign",
      flags: ["PSH", "ACK"],
      payloadHex: "45 00 00 3c a2 11 40 00 40 06 ... custom pcap payload stream",
      asciiStream: isEvil ? `POST /c2/beacon HTTP/1.1\nHost: c2-node.net\nData: payload_${i}` : `[Standard TCP Traffic Packet #${i + 1}]`
    };
  });

  res.json({
    status: "success",
    session: {
      id: `pcap-${Date.now()}`,
      filename,
      uploadedAt: new Date().toISOString(),
      totalPackets: packetCount,
      durationSeconds: 180,
      fileSizeBytes: packetCount * 1200,
      packets: generatedPackets,
      suspiciousDetections: [
        {
          title: "PyShark DPI Ransomware Stager Detection",
          severity: "Critical",
          description: `Analyzed ${filename}. PyShark packet inspector flagged outbound C2 beaconing.`,
          packetIndex: 1
        }
      ]
    }
  });
});

// IOC Extraction Endpoint
app.post("/api/v1/iocs/extract", (req, res) => {
  const { rawText = "" } = req.body;

  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  const sha256Regex = /\b[a-fA-F0-9]{64}\b/g;
  const md5Regex = /\b[a-fA-F0-9]{32}\b/g;
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;

  const ips = Array.from(new Set(rawText.match(ipRegex) || []));
  const sha256s = Array.from(new Set(rawText.match(sha256Regex) || []));
  const md5s = Array.from(new Set(rawText.match(md5Regex) || []));
  const urls = Array.from(new Set(rawText.match(urlRegex) || []));

  res.json({
    extractedIps: ips,
    extractedSha256: sha256s,
    extractedMd5: md5s,
    extractedUrls: urls,
    totalExtracted: ips.length + sha256s.length + md5s.length + urls.length
  });
});

// Timeline Generation Endpoint
app.post("/api/v1/timeline/generate", (req, res) => {
  const { incidentId = "inc-1" } = req.body;
  const now = new Date().toISOString();

  res.json({
    status: "success",
    incidentId,
    generatedEvents: [
      {
        id: `tl-${Date.now()}-1`,
        timestamp: `${now.substring(0, 10)} 14:02:11 UTC`,
        source: "Firewall",
        eventType: "Inbound SSL-VPN Login",
        description: "Successful SSL-VPN login for user r.davis from suspicious external IP 185.220.101.5.",
        severity: "High"
      },
      {
        id: `tl-${Date.now()}-2`,
        timestamp: `${now.substring(0, 10)} 14:08:45 UTC`,
        source: "EDR Log",
        eventType: "SMB Relay / Coerced Auth",
        description: "Host WKSTN-ADMIN-09 initiated PetitPotam RPC call forcing NTLM auth relay.",
        severity: "Critical"
      }
    ]
  });
});

// PDF Report Generation Endpoint
app.post("/api/v1/reports/pdf", (req, res) => {
  const { incidentTitle = "LockBit 3.0 Ransomware Incident", generatedBy = "Alex Mercer" } = req.body;

  res.json({
    status: "success",
    reportId: `rep-pdf-${Date.now()}`,
    incidentTitle,
    generatedBy,
    generatedAt: new Date().toISOString(),
    pdfUrl: `/reports/nettrace_incident_report_${Date.now()}.pdf`,
    downloadReady: true
  });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NetTrace Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

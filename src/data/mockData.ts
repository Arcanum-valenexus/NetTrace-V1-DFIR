import { Incident, PcapSession, IOC, EvidenceArtifact, ForensicsReport, ThreatActor } from '../types';

export const initialIncidents: Incident[] = [
  {
    id: 'inc-1',
    incidentNumber: 'INC-2026-8842',
    title: 'LockBit 3.0 Ransomware Execution on Core Domain Controller',
    severity: 'Critical',
    status: 'Investigating',
    category: 'Ransomware',
    assignedAnalyst: 'Lead DFIR Analyst (Lead DFIR)',
    createdAt: '2026-07-29T14:22:00Z',
    updatedAt: '2026-07-29T20:15:00Z',
    summary: 'Automated EDR alert triggered on DC-01.exe execution after NTLM Relay exploitation. Shadow copies purged via vssadmin and encrypted volume extension .lockbit detected across 14 network shares.',
    attackVector: 'Compromised VPN Credentials -> NTLM Relay (Coerced Auth) -> Domain Admin Privilege Escalation -> Ransomware Deployment via PsExec',
    currentStage: 'Impact',
    impactedAssets: [
      {
        id: 'asset-1',
        hostname: 'DC-01.corp.internal',
        ipAddress: '10.0.1.5',
        os: 'Windows Server 2022 Datacenter',
        assetType: 'Domain Controller',
        status: 'Isolated',
        owner: 'IT Infrastructure Team'
      },
      {
        id: 'asset-2',
        hostname: 'FS-APP-02.corp.internal',
        ipAddress: '10.0.2.14',
        os: 'Windows Server 2019',
        assetType: 'Server',
        status: 'Isolated',
        owner: 'Finance Department'
      },
      {
        id: 'asset-3',
        hostname: 'WKSTN-ADMIN-09.corp.internal',
        ipAddress: '10.0.10.88',
        os: 'Windows 11 Enterprise',
        assetType: 'Workstation',
        status: 'Under Analysis',
        owner: 'SysAdmin - R. Davis'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        incidentId: 'inc-1',
        timestamp: '2026-07-29 14:02:11 UTC',
        source: 'Firewall',
        eventType: 'Inbound SSL-VPN Login',
        description: 'Successful SSL-VPN login for user r.davis from suspicious external IP 185.220.101.5 (Tor Exit Node).',
        severity: 'High',
        rawLog: 'Jul 29 14:02:11 fw01.corp auth_sslvpn: ACCEPT user=r.davis src=185.220.101.5 dst=10.0.0.1:443 status=SUCCESS auth_type=2FA_BYPASSED',
        associatedIocs: ['185.220.101.5'],
        threatActor: 'LockBit Supporter'
      },
      {
        id: 'tl-2',
        incidentId: 'inc-1',
        timestamp: '2026-07-29 14:08:45 UTC',
        source: 'EDR Log',
        eventType: 'SMB Relay / Coerced Auth',
        description: 'Host WKSTN-ADMIN-09 initiated PetitPotam (MS-EFSR) RPC call to 10.0.1.5 (DC-01) forcing NTLM authentication relay back to attacker C2 185.220.101.5.',
        severity: 'Critical',
        rawLog: 'EventID 4624: An account was successfully logged on. TargetUser: DC-01$ AuthenticationPackage: NTLM Workstation: WKSTN-ADMIN-09',
        associatedIocs: ['10.0.10.88', '185.220.101.5']
      },
      {
        id: 'tl-3',
        incidentId: 'inc-1',
        timestamp: '2026-07-29 14:15:30 UTC',
        source: 'Active Directory',
        eventType: 'DCSync Attack Detected',
        description: 'Directory Replication Service request issued from unauthorized IP 10.0.10.88 targeting krbtgt hash extraction.',
        severity: 'Critical',
        rawLog: 'Directory Services Event 1664: DRSGetNCChanges initiated from 10.0.10.88 by delegated admin token',
        associatedIocs: ['krbtgt_hash']
      },
      {
        id: 'tl-4',
        incidentId: 'inc-1',
        timestamp: '2026-07-29 14:21:04 UTC',
        source: 'EDR Log',
        eventType: 'Shadow Copy Deletion',
        description: 'Execution of `vssadmin.exe delete shadows /all /quiet` followed by `bcdedit /set {default} recoveryenabled No`',
        severity: 'Critical',
        rawLog: 'Process create: C:\\Windows\\System32\\vssadmin.exe Parent: cmd.exe (PID 4812)',
        associatedIocs: ['vssadmin.exe']
      }
    ],
    mitreTactics: [
      { id: 'T1078.002', name: 'Valid Accounts: Domain Accounts', tactic: 'Initial Access' },
      { id: 'T1558.003', name: 'Steal or Forge Kerberos Tickets: Kerberoasting', tactic: 'Credential Access' },
      { id: 'T1003.006', name: 'OS Credential Dumping: DCSync', tactic: 'Credential Access' },
      { id: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares', tactic: 'Lateral Movement' },
      { id: 'T1490', name: 'Inhibit System Recovery (vssadmin)', tactic: 'Impact' }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Lead DFIR Analyst',
        timestamp: '2026-07-29T14:35:00Z',
        content: 'Host DC-01 has been network isolated via CrowdStrike EDR API. Verified active backup vault on AWS S3 is intact and untampered.'
      },
      {
        id: 'note-2',
        author: 'Sarah Jenkins (Security Ops)',
        timestamp: '2026-07-29T15:10:00Z',
        content: 'Extracted sample binary `LB3_payload.exe` (SHA256: 7f83b1...). Uploaded to sandbox. Contains embedded ransom note instructions linking to onion address.'
      }
    ],
    containmentChecklist: [
      { id: 'chk-1', task: 'Network isolate host DC-01 and FS-APP-02', completed: true, assignedTo: 'Lead DFIR Analyst' },
      { id: 'chk-2', task: 'Revoke compromised VPN user credentials for r.davis', completed: true, assignedTo: 'Sarah Jenkins' },
      { id: 'chk-3', task: 'Reset Enterprise Admin and krbtgt password twice', completed: true, assignedTo: 'Domain Ops' },
      { id: 'chk-4', task: 'Perform memory dump & disk forensic acquisition', completed: false, assignedTo: 'Lead DFIR Analyst' },
      { id: 'chk-5', task: 'Verify offline backup restore points', completed: true, assignedTo: 'Backup Admin' }
    ]
  },
  {
    id: 'inc-2',
    incidentNumber: 'INC-2026-7731',
    title: 'Cobalt Strike C2 Beaconing via Port 443 with Malleable HTTPS Profile',
    severity: 'High',
    status: 'Contained',
    category: 'C2 Infrastructure',
    assignedAnalyst: 'Sarah Jenkins',
    createdAt: '2026-07-28T09:14:00Z',
    updatedAt: '2026-07-29T18:40:00Z',
    summary: 'Periodic outbound encrypted beaconing detected from DEV-WORKSTATION-04 to domain `auth-update-cdn.com` on IP 192.236.198.42 every 60 seconds with jitter.',
    attackVector: 'Malicious Microsoft Word Macro Attachment -> Powershell Stager Download -> DLL Side-loading in Teams.exe',
    currentStage: 'Command and Control',
    impactedAssets: [
      {
        id: 'asset-4',
        hostname: 'DEV-WORKSTATION-04.corp.internal',
        ipAddress: '10.0.12.44',
        os: 'Windows 11 Pro',
        assetType: 'Workstation',
        status: 'Isolated',
        owner: 'DevOps Lead - M. Chen'
      }
    ],
    timeline: [
      {
        id: 'tl-10',
        incidentId: 'inc-2',
        timestamp: '2026-07-28 09:00:12 UTC',
        source: 'EDR Log',
        eventType: 'Phishing Macro Execution',
        description: 'WINWORD.exe spawned powershell.exe with base64 encoded payload.',
        severity: 'High',
        associatedIocs: ['auth-update-cdn.com']
      },
      {
        id: 'tl-11',
        incidentId: 'inc-2',
        timestamp: '2026-07-28 09:02:40 UTC',
        source: 'PCAP Analysis',
        eventType: 'C2 Beacon Initialized',
        description: 'SSL session established with self-signed TLS cert (Serial 0x4f92a1) matching known Cobalt Strike Beacon hash.',
        severity: 'High',
        associatedIocs: ['192.236.198.42']
      }
    ],
    mitreTactics: [
      { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'Initial Access' },
      { id: 'T1059.001', name: 'PowerShell Execution', tactic: 'Execution' },
      { id: 'T1071.001', name: 'Web Protocols: HTTPS C2', tactic: 'Command and Control' }
    ],
    notes: [
      {
        id: 'note-10',
        author: 'Sarah Jenkins',
        timestamp: '2026-07-28T11:00:00Z',
        content: 'Sinkholed domain auth-update-cdn.com at DNS firewall layer. Host isolated.'
      }
    ],
    containmentChecklist: [
      { id: 'chk-10', task: 'Block IP 192.236.198.42 on Perimeter Firewall', completed: true, assignedTo: 'Sarah Jenkins' },
      { id: 'chk-11', task: 'Add YARA rule CS_Beacon_v4 to EDR endpoint scanner', completed: true, assignedTo: 'Lead DFIR Analyst' }
    ]
  },
  {
    id: 'inc-3',
    incidentNumber: 'INC-2026-6210',
    title: 'Credential Harvesting Spear Phishing Campaign Targeting HR',
    severity: 'Medium',
    status: 'Closed',
    category: 'Phishing / Initial Access',
    assignedAnalyst: 'Marcus Vance',
    createdAt: '2026-07-27T11:00:00Z',
    updatedAt: '2026-07-27T16:30:00Z',
    summary: 'Mass email campaign pretending to be Payroll Salary Update with link redirecting to fake Microsoft 365 OAuth login portal.',
    attackVector: 'Inbound External Email -> Phishing Link -> Credential Harvester',
    currentStage: 'Initial Access',
    impactedAssets: [
      {
        id: 'asset-5',
        hostname: 'HR-PC-12.corp.internal',
        ipAddress: '10.0.14.102',
        os: 'Windows 11 Enterprise',
        assetType: 'Workstation',
        status: 'Remediated',
        owner: 'HR Generalist - E. Taylor'
      }
    ],
    timeline: [
      {
        id: 'tl-20',
        incidentId: 'inc-3',
        timestamp: '2026-07-27 11:05:00 UTC',
        source: 'EDR Log',
        eventType: 'Phishing Link Clicked',
        description: 'User clicked link `https://login-microsoftonline-payroll-update.com/auth`',
        severity: 'Medium',
        associatedIocs: ['login-microsoftonline-payroll-update.com']
      }
    ],
    mitreTactics: [
      { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'Initial Access' }
    ],
    notes: [
      {
        id: 'note-20',
        author: 'Marcus Vance',
        timestamp: '2026-07-27T12:30:00Z',
        content: 'User reported email. Force reset user M365 session & MFA tokens. No unauthorized logins found.'
      }
    ],
    containmentChecklist: [
      { id: 'chk-20', task: 'Purge phishing emails from all mailbox queues', completed: true, assignedTo: 'Marcus Vance' },
      { id: 'chk-21', task: 'Block phishing domain on Cloudflare Gateway', completed: true, assignedTo: 'Marcus Vance' }
    ]
  }
];

export const samplePcapSession: PcapSession = {
  id: 'pcap-session-2026-01',
  filename: 'incident_capture_DC01_10.0.1.5.pcapng',
  uploadedAt: '2026-07-29T14:30:00Z',
  totalPackets: 18,
  durationSeconds: 142.8,
  fileSizeBytes: 248190,
  topProtocols: [
    { name: 'TCP', count: 8, percentage: 44.4 },
    { name: 'HTTP/HTTPS', count: 5, percentage: 27.8 },
    { name: 'DNS', count: 3, percentage: 16.7 },
    { name: 'SMB2', count: 2, percentage: 11.1 }
  ],
  suspiciousDetections: [
    {
      title: 'Malicious C2 Beacon Request Detected',
      severity: 'Critical',
      description: 'Outbound HTTP POST to known C2 IP 185.220.101.5 carrying base64 stager.',
      packetIndex: 4
    },
    {
      title: 'DNS Tunneling / High-Entropy Subdomain Query',
      severity: 'High',
      description: 'DNS query for `a9f82c1b920a48d812.c2.auth-update-cdn.com` indicating data staging.',
      packetIndex: 8
    },
    {
      title: 'Unauthenticated SMB2 Session Setup',
      severity: 'High',
      description: 'SMB2 Tree Connect to IPC$ share with anonymous null token.',
      packetIndex: 12
    }
  ],
  extractedFiles: [
    {
      filename: 'LB3_Stage2_payload.dll',
      sizeBytes: 488960,
      mimeType: 'application/x-dsexec',
      md5: '9b74c2d8e1f04231a5b82c918347102e',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verdict: 'Malicious'
    },
    {
      filename: 'cert_bundle.crt',
      sizeBytes: 2048,
      mimeType: 'application/x-x509-ca-cert',
      md5: '4f92a10521e89b418520d29173c09192',
      sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      verdict: 'Suspicious'
    }
  ],
  packets: [
    {
      packetNo: 1,
      timestamp: '14:02:11.002140',
      srcIp: '10.0.10.88',
      srcPort: 49822,
      destIp: '10.0.1.5',
      destPort: 53,
      protocol: 'DNS',
      length: 82,
      info: 'Standard query 0x1a82 A auth-update-cdn.com',
      threatRating: 'Suspicious',
      dnsQuery: 'auth-update-cdn.com',
      flags: ['SYN'],
      payloadHex: '0000 00 0c 29 cb ff 82 00 50 56 9a 12 b4 08 00 45 00 ... auth-update-cdn.com',
      asciiStream: 'DNS Query: auth-update-cdn.com [A Record] TxID: 0x1a82'
    },
    {
      packetNo: 2,
      timestamp: '14:02:11.018220',
      srcIp: '10.0.1.5',
      srcPort: 53,
      destIp: '10.0.10.88',
      destPort: 49822,
      protocol: 'DNS',
      length: 98,
      info: 'Standard query response 0x1a82 A auth-update-cdn.com A 185.220.101.5',
      threatRating: 'Suspicious',
      dnsQuery: 'auth-update-cdn.com -> 185.220.101.5',
      flags: ['ACK'],
      payloadHex: '0000 00 50 56 9a 12 b4 00 0c 29 cb ff 82 08 00 45 00 ... 185.220.101.5',
      asciiStream: 'DNS Response: auth-update-cdn.com -> 185.220.101.5 (TTL 60s)'
    },
    {
      packetNo: 3,
      timestamp: '14:02:11.042100',
      srcIp: '10.0.10.88',
      srcPort: 51204,
      destIp: '185.220.101.5',
      destPort: 443,
      protocol: 'TCP',
      length: 66,
      info: '51204 -> 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256 SACK_PERM=1',
      threatRating: 'Benign',
      flags: ['SYN'],
      payloadHex: '0000 02 04 05 b4 01 03 03 08 01 01 04 02',
      asciiStream: '[TCP SYN Handshake]'
    },
    {
      packetNo: 4,
      timestamp: '14:02:11.102350',
      srcIp: '10.0.10.88',
      srcPort: 51204,
      destIp: '185.220.101.5',
      destPort: 443,
      protocol: 'HTTP',
      length: 612,
      info: 'POST /api/v1/update HTTP/1.1 (application/x-www-form-urlencoded)',
      threatRating: 'Malicious',
      httpMethod: 'POST',
      httpUrl: 'https://auth-update-cdn.com/api/v1/update',
      flags: ['PSH', 'ACK'],
      payloadHex: '50 4f 53 54 20 2f 61 70 69 2f 76 31 2f 75 70 64 61 74 65 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 61 75 74 68 2d 75 70 64 61 74 65 2d 63 64 6e 2e 63 6f 6d 0d 0a 55 73 65 72 2d 41 67 65 6e 74 3a 20 4d 6f 7a 69 6c 6c 61 2f 35 2e 30 20 28 57 69 6e 64 6f 77 73 20 4e 54 20 31 30 2e 30 3b 20 57 69 6e 36 34 3b 20 78 36 34 29 0d 0a 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63 61 74 69 6f 6e 2f 78 2d 77 77 77 2d 66 6f 72 6d 2d 75 72 6c 65 6e 63 6f 64 65 64 0d 0a 0d 0a 64 61 74 61 3d 54 56 71 51 41 41 4d 41 41 41 41 45 41 41 41 41 2f 2f 38 44 71 57 6f 67 41 41 41 41 41 41 41 41',
      asciiStream: `POST /api/v1/update HTTP/1.1
Host: auth-update-cdn.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Content-Type: application/x-www-form-urlencoded
Cookie: CSESSION=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

data=TVqQAAMAAAAEAAAA//8DqWogAAAAAAAAAAAAAAAAAAAAA... [Base64 Executable Stager Payload]`
    },
    {
      packetNo: 5,
      timestamp: '14:02:11.189400',
      srcIp: '185.220.101.5',
      srcPort: 443,
      destIp: '10.0.10.88',
      destPort: 51204,
      protocol: 'HTTP',
      length: 1240,
      info: 'HTTP/1.1 200 OK (text/html) [Chunked Transfer]',
      threatRating: 'Malicious',
      flags: ['PSH', 'ACK'],
      payloadHex: '48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d 0a 53 65 72 76 65 72 3a 20 6e 67 69 6e 78 0d 0a 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63 61 74 69 6f 6e 2f 6f 63 74 65 74 2d 73 74 72 65 61 6d 0d 0a 0d 0a',
      asciiStream: `HTTP/1.1 200 OK
Server: Apache/2.4.41 (Ubuntu)
Content-Type: application/octet-stream
X-C2-Status: ACK_TASK_EXECUTE

[Encrypted Cobalt Strike Tasking Response Buffer]`
    },
    {
      packetNo: 6,
      timestamp: '14:08:45.001120',
      srcIp: '10.0.10.88',
      srcPort: 49152,
      destIp: '10.0.1.5',
      destPort: 445,
      protocol: 'SMB',
      length: 214,
      info: 'SMB2 Negotiate Protocol Request',
      threatRating: 'Suspicious',
      flags: ['PA'],
      payloadHex: 'fe 53 4d 42 40 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
      asciiStream: 'SMB2 Negotiate Protocol Request dialects: [2.0.2, 2.1, 3.0, 3.0.2, 3.1.1]'
    },
    {
      packetNo: 7,
      timestamp: '14:08:45.023400',
      srcIp: '10.0.10.88',
      srcPort: 49152,
      destIp: '10.0.1.5',
      destPort: 445,
      protocol: 'SMB',
      length: 340,
      info: 'SMB2 Tree Connect Request Tree: \\\\10.0.1.5\\IPC$',
      threatRating: 'Malicious',
      flags: ['PA'],
      payloadHex: 'fe 53 4d 42 03 00 00 00 ... \\\\10.0.1.5\\IPC$',
      asciiStream: 'SMB2 Tree Connect Request: \\\\10.0.1.5\\IPC$ (NTLM Auth Coercion Attempt)'
    },
    {
      packetNo: 8,
      timestamp: '14:12:00.540110',
      srcIp: '10.0.1.5',
      srcPort: 58120,
      destIp: '185.220.101.5',
      destPort: 53,
      protocol: 'DNS',
      length: 124,
      info: 'Standard query 0x3f21 A a9f82c1b920a48d812.c2.auth-update-cdn.com',
      threatRating: 'Malicious',
      dnsQuery: 'a9f82c1b920a48d812.c2.auth-update-cdn.com',
      flags: ['SYN'],
      payloadHex: '0000 00 0c 29 cb ff 82 ... a9f82c1b920a48d812.c2.auth-update-cdn.com',
      asciiStream: 'DNS Exfiltration Subdomain: a9f82c1b920a48d812.c2.auth-update-cdn.com'
    }
  ]
};

export const initialIocs: IOC[] = [
  {
    id: 'ioc-1',
    type: 'ip',
    value: '185.220.101.5',
    threatScore: 98,
    severity: 'Critical',
    status: 'Active Threat',
    category: 'IP Addresses',
    firstSeen: '2026-07-28 10:00:00 UTC',
    lastSeen: '2026-07-29 14:30:00 UTC',
    asn: 'AS202425 (Tor Exit Node / Hosting Solutions)',
    country: 'DE (Germany)',
    threatGroup: 'LockBit 3.0 / BlackCat Affiliate',
    yaraMatches: ['CS_Beacon_HTTPS', 'Tor_Exit_Address_List'],
    description: 'Active Command & Control infrastructure identified in HTTP POST outbound beacon stream.',
    sourcePacket: 'Frame #4',
    evidenceRef: 'PCAP Trace: incident_capture_DC01_10.0.1.5.pcapng',
    reasonFlagged: 'PyShark/Scapy analysis detected repetitive TCP 443 HTTP POST stager beaconing to external non-standard host.',
    recommendedAction: 'Apply immediate boundary firewall rule blocking 185.220.101.5 on TCP/443. Isolate internal host 10.0.10.88.',
    relatedEvidence: 'DC01_lsass_memory_dump.dmp'
  },
  {
    id: 'ioc-2',
    type: 'domain',
    value: 'auth-update-cdn.com',
    threatScore: 94,
    severity: 'Critical',
    status: 'Blocked',
    category: 'Domains',
    firstSeen: '2026-07-26 18:12:00 UTC',
    lastSeen: '2026-07-29 14:10:00 UTC',
    country: 'NL',
    threatGroup: 'UNC2452',
    yaraMatches: ['Malicious_CDN_Domain_Regex'],
    description: 'Typosquatted domain simulating legitimate authentication CDN endpoints.',
    sourcePacket: 'Frame #1',
    evidenceRef: 'PCAP Trace: incident_capture_DC01_10.0.1.5.pcapng',
    reasonFlagged: 'DNS query response packet maps domain to known malicious C2 IP 185.220.101.5.',
    recommendedAction: 'Sinkhole domain auth-update-cdn.com at DNS firewall level and revoke active Kerberos TGT tokens.',
    relatedEvidence: 'Security_EventLog_DC01_4624_4672.evtx'
  },
  {
    id: 'ioc-3',
    type: 'hash_sha256',
    value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    threatScore: 100,
    severity: 'Critical',
    status: 'Active Threat',
    category: 'File Hashes',
    firstSeen: '2026-07-29 14:21:00 UTC',
    lastSeen: '2026-07-29 14:25:00 UTC',
    threatGroup: 'LockBit Gang',
    yaraMatches: ['win_lockbit_v3_core', 'vssadmin_wiper_routine'],
    description: 'LockBit 3.0 payload executable compiled with custom obfuscation routines.',
    sourcePacket: 'Frame #5',
    evidenceRef: 'PCAP Trace: incident_capture_DC01_10.0.1.5.pcapng',
    reasonFlagged: 'Scapy HTTP response reassembly reconstructed executable binary with high entropy PE section matching LockBit signature.',
    recommendedAction: 'Deploy host-based YARA rule across all domain controller endpoints. Force process termination.',
    relatedEvidence: 'DC01_lsass_memory_dump.dmp'
  },
  {
    id: 'ioc-4',
    type: 'url',
    value: 'https://login-microsoftonline-payroll-update.com/auth/login.php',
    threatScore: 88,
    severity: 'High',
    status: 'Blocked',
    category: 'URLs',
    firstSeen: '2026-07-27 11:00:00 UTC',
    lastSeen: '2026-07-27 15:00:00 UTC',
    threatGroup: 'FIN7',
    description: 'Reverse proxy Evilginx2 template harvesting session tokens & 2FA credentials.',
    sourcePacket: 'Frame #12',
    evidenceRef: 'PCAP Trace: incident_capture_DC01_10.0.1.5.pcapng',
    reasonFlagged: 'Extracted HTTP GET payload contains reverse proxy login portal URI target.',
    recommendedAction: 'Block URL path on Web Security Gateway and initiate mandatory password reset for target accounts.',
    relatedEvidence: 'Security_EventLog_DC01_4624_4672.evtx'
  },
  {
    id: 'ioc-5',
    type: 'filepath',
    value: 'C:\\Windows\\System32\\tasks\\Microsoft\\Windows\\UpdateOrchestrator\\LB3_Task.job',
    threatScore: 75,
    severity: 'Medium',
    status: 'Investigating',
    category: 'Other',
    firstSeen: '2026-07-29 14:18:00 UTC',
    lastSeen: '2026-07-29 14:18:00 UTC',
    description: 'Scheduled task created via schtasks.exe to execute ransomware upon system reboot.',
    sourcePacket: 'Frame #16',
    evidenceRef: 'Event Log: Security_EventLog_DC01_4624_4672.evtx',
    reasonFlagged: 'SMB packet inspection identified file creation of Task Scheduler .job binary in system directory.',
    recommendedAction: 'Delete scheduled task job file via PowerShell and inspect SYSTEM account token privileges.',
    relatedEvidence: 'Host Artifact ID DC01-SCH-01'
  },
  {
    id: 'ioc-6',
    type: 'email',
    value: 'payroll-update@darknet-phish.net',
    threatScore: 65,
    severity: 'Medium',
    status: 'Blocked',
    category: 'Emails',
    firstSeen: '2026-07-27 10:45:00 UTC',
    lastSeen: '2026-07-27 11:00:00 UTC',
    description: 'Phishing sender address originating spear-phishing messages targeting HR department.',
    sourcePacket: 'Frame #2',
    evidenceRef: 'PCAP Trace: incident_capture_DC01_10.0.1.5.pcapng',
    reasonFlagged: 'SMTP packet headers indicate spoofed sender envelope from unauthorized mail relay.',
    recommendedAction: 'Add sender address and domain darknet-phish.net to perimeter email transport rule blocklist.',
    relatedEvidence: 'Security_EventLog_DC01_4624_4672.evtx'
  }
];

export const initialEvidence: EvidenceArtifact[] = [
  {
    id: 'ev-101',
    caseId: 'CASE-2026-001',
    incidentId: 'inc-1',
    name: 'DC01_lsass_memory_dump.dmp',
    category: 'Memory Dump',
    description: 'Volatile RAM image extracted from Domain Controller DC-01 containing LSASS process memory handles and credential tokens.',
    tags: ['LSASS', 'RAM Dump', 'Domain Controller', 'Volatile Evidence'],
    sizeBytes: 842100520,
    hashSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    hashMd5: '9b74c2d8e1f04231a5b82c918347102e',
    uploadedAt: '31 Jul 2026 15:00 UTC',
    uploadedBy: 'Lead DFIR Analyst',
    ownerInvestigatorId: 'inv-001',
    ownerInvestigatorName: 'Lead DFIR Analyst (Lead DFIR Analyst)',
    accessPassword: 'NetTrace2026!',
    storagePath: '/evidences/2026/inc-1/DC01_lsass_memory_dump.dmp',
    chainOfCustody: [
      {
        id: 'coc-2',
        evidenceId: 'ev-101',
        caseId: 'CASE-2026-001',
        action: 'Evidence Verified',
        actor: 'Lead DFIR Analyst',
        investigatorId: 'inv-001',
        investigatorName: 'Lead DFIR Analyst',
        timestamp: '31 Jul 2026 15:05 UTC',
        notes: 'SHA256 checksum verified against acquisition baseline.'
      },
      {
        id: 'coc-1',
        evidenceId: 'ev-101',
        caseId: 'CASE-2026-001',
        action: 'Evidence Registered',
        actor: 'Lead DFIR Analyst',
        investigatorId: 'inv-001',
        investigatorName: 'Lead DFIR Analyst',
        timestamp: '31 Jul 2026 15:00 UTC',
        notes: 'Acquired via WinPmem 4.0 CLI over WinRM session on isolated host DC-01.'
      }
    ]
  },
  {
    id: 'ev-102',
    caseId: 'CASE-2026-001',
    incidentId: 'inc-1',
    name: 'incident_capture_DC01_10.0.1.5.pcapng',
    category: 'PCAP Trace',
    description: 'Promiscuous network packet trace captured at core switch SPAN interface documenting initial C2 beaconing and NTLM relay coercions.',
    tags: ['PCAP', 'Network Traffic', 'C2 Beacon', 'HTTP Stream'],
    sizeBytes: 248190,
    hashSha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    hashMd5: '1234567890abcdef1234567890abcdef',
    uploadedAt: '31 Jul 2026 14:30 UTC',
    uploadedBy: 'Sarah Jenkins',
    ownerInvestigatorId: 'inv-002',
    ownerInvestigatorName: 'Sarah Jenkins (Security Ops)',
    accessPassword: 'NetTrace2026!',
    storagePath: '/evidences/2026/inc-1/DC01_capture.pcapng',
    chainOfCustody: [
      {
        id: 'coc-3',
        evidenceId: 'ev-102',
        caseId: 'CASE-2026-001',
        action: 'Evidence Uploaded',
        actor: 'Sarah Jenkins',
        investigatorId: 'inv-002',
        investigatorName: 'Sarah Jenkins',
        timestamp: '31 Jul 2026 14:30 UTC',
        notes: 'Exported from Palo Alto Core Switch SPAN port during active outbreak.'
      }
    ]
  },
  {
    id: 'ev-103',
    caseId: 'CASE-2026-001',
    incidentId: 'inc-1',
    name: 'Security_EventLog_DC01_4624_4672.evtx',
    category: 'Event Log',
    description: 'Windows Security Event Log containing Event ID 4624 (Logon) and 4672 (Special Privileges Assigned) during privilege escalation.',
    tags: ['EVTX', 'Event Log', 'Logon Events', 'Windows Security'],
    sizeBytes: 15420100,
    hashSha256: 'e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    hashMd5: 'abcdef1234567890abcdef1234567890',
    uploadedAt: '31 Jul 2026 14:45 UTC',
    uploadedBy: 'Lead DFIR Analyst',
    ownerInvestigatorId: 'inv-001',
    ownerInvestigatorName: 'Lead DFIR Analyst',
    accessPassword: 'NetTrace2026!',
    storagePath: '/evidences/2026/inc-1/DC01_SecurityLogs.evtx',
    chainOfCustody: [
      {
        id: 'coc-4',
        evidenceId: 'ev-103',
        caseId: 'CASE-2026-001',
        action: 'Evidence Uploaded',
        actor: 'Lead DFIR Analyst',
        investigatorId: 'inv-001',
        investigatorName: 'Lead DFIR Analyst',
        timestamp: '31 Jul 2026 14:45 UTC',
        notes: 'Exported System & Security EVTX logs for NTLM relay correlation.'
      }
    ]
  }
];

export const initialReports: ForensicsReport[] = [
  {
    id: 'rep-2026-001',
    reportNumber: 'REP-2026-001',
    version: 1,
    revisionReason: 'Original Investigation',
    incidentId: 'inc-1',
    caseId: 'CASE-2026-001',
    incidentTitle: 'Unauthorized C2 Beaconing & Lateral Movement Incident',
    generatedAt: '2026-07-29T18:00:00Z',
    generatedBy: 'Lead DFIR Analyst',
    organization: 'Zyphera Security Labs',
    status: 'Final',
    reportHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    history: [
      { id: 'h-1', event: 'Created', timestamp: '2026-07-29 14:30:00 UTC', actor: 'Lead DFIR Analyst', notes: 'Report draft initialized' },
      { id: 'h-2', event: 'Compiled', timestamp: '2026-07-29 16:00:00 UTC', actor: 'Lead DFIR Analyst', notes: 'Automated telemetry compilation completed' },
      { id: 'h-3', event: 'Reviewed', timestamp: '2026-07-29 17:15:00 UTC', actor: 'Lead DFIR Analyst', notes: 'Peer review completed with evidence hash verification' },
      { id: 'h-4', event: 'Finalized', timestamp: '2026-07-29 18:00:00 UTC', actor: 'Lead DFIR Analyst', notes: 'Report finalized and locked for distribution' }
    ],
    coverPage: {
      title: 'Unauthorized C2 Beaconing & Lateral Movement Incident',
      caseId: 'CASE-2026-001',
      reportId: 'REP-2026-001',
      generatedDate: '2026-07-29 18:00:00 UTC',
      leadInvestigator: 'Lead DFIR Analyst',
      organization: 'Zyphera Security Labs',
      classification: 'CONFIDENTIAL // FOR OFFICIAL USE ONLY (FOUO)'
    },
    executiveSummary: 'On July 29, 2026, NetTrace Security Operations identified an anomalous network exfiltration and C2 beaconing event originating from internal host DC-01 (10.0.1.5). Deep packet inspection (DPI) verified unauthorized outbound HTTP POST transactions carrying base64-encoded stager payloads to external C2 address 185.220.101.5. Affected assets were isolated within 19 minutes, stopping lateral spread. Cryptographic hash baselines confirm all evidence integrity remains intact.',
    incidentCaseDetails: {
      incidentNumber: 'INC-2026-8842',
      category: 'Ransomware / Lateral Movement',
      severity: 'Critical',
      currentStage: 'Containment',
      assignedAnalyst: 'Lead DFIR Analyst',
      summary: 'Automated detection flagged elevated outbound TCP/443 traffic with encrypted payload patterns and unauthorized Kerberos ticket requests.',
      impactedAssets: [
        { hostname: 'DC-01.corp.internal', ipAddress: '10.0.1.5', status: 'Isolated', os: 'Windows Server 2022' },
        { hostname: 'FS-APP-02.corp.internal', ipAddress: '10.0.1.18', status: 'Isolated', os: 'Windows Server 2019' }
      ]
    },
    attackTimeline: [
      { timestamp: '2026-07-29 14:02:11 UTC', source: 'Packet Analyzer', eventType: 'DNS C2 Resolution', description: 'DNS query for auth-update-cdn.com resolved to 185.220.101.5.' },
      { timestamp: '2026-07-29 14:02:11 UTC', source: 'PyShark Engine', eventType: 'Malicious C2 Handshake', description: 'Outbound TCP 443 HTTP POST carrying base64 executable stager payload.' },
      { timestamp: '2026-07-29 14:08:35 UTC', source: 'Event Log (EVTX)', eventType: 'Privilege Escalation', description: 'Event ID 4672: Special privileges assigned to NTLM authenticated session.' },
      { timestamp: '2026-07-29 14:15:00 UTC', source: 'Evidence Locker', eventType: 'LSASS Memory Capture', description: 'Volatile memory dump DC01_lsass_memory_dump.dmp acquired.' },
      { timestamp: '2026-07-29 14:21:00 UTC', source: 'Timeline Engine', eventType: 'Host Containment', description: 'EDR isolated DC-01 and revoked session OAuth tokens.' }
    ],
    evidenceInventory: [
      { id: 'ev-101', name: 'DC01_lsass_memory_dump.dmp', category: 'Memory Dump', sizeBytes: 842100520, hashSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', hashMd5: '9b74c2d8e1f04231a5b82c918347102e', uploadedBy: 'Lead DFIR Analyst', integrityStatus: 'VERIFIED' },
      { id: 'ev-102', name: 'incident_capture_DC01_10.0.1.5.pcapng', category: 'PCAP Trace', sizeBytes: 248190, hashSha256: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2', hashMd5: '4f92a10521e89b418520d29173c09192', uploadedBy: 'Sarah Jenkins', integrityStatus: 'VERIFIED' },
      { id: 'ev-103', name: 'Security_EventLog_DC01_4624_4672.evtx', category: 'Event Log', sizeBytes: 15420100, hashSha256: 'e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', hashMd5: 'abcdef1234567890abcdef1234567890', uploadedBy: 'Lead DFIR Analyst', integrityStatus: 'VERIFIED' }
    ],
    packetAnalysis: {
      pcapFilename: 'incident_capture_DC01_10.0.1.5.pcapng',
      analysisEngine: 'NetTrace PyShark / Scapy DPI Engine V1.0',
      totalPacketsParsed: 18,
      captureDurationSeconds: 142.8,
      topProtocols: ['TCP (44.4%)', 'HTTP/HTTPS (27.8%)', 'DNS (16.7%)', 'SMB2 (11.1%)'],
      maliciousFlowsCount: 3,
      dpiAnomalySummary: 'High-entropy HTTP POST payload containing base64 executable headers and anomalous SMB2 session setup.',
      c2TrafficDetails: 'Source IP 10.0.10.88 -> Target C2 IP 185.220.101.5:443 (URI: /api/v1/update).'
    },
    iocs: [
      { type: 'ip', value: '185.220.101.5', threatScore: 95, severity: 'Critical', description: 'Tor Exit Node / Active C2 Command Server', sourcePacket: 'Frame #4' },
      { type: 'domain', value: 'auth-update-cdn.com', threatScore: 90, severity: 'Critical', description: 'Malicious C2 Domain hosted on Bulletproof Infrastructure', sourcePacket: 'Frame #1' },
      { type: 'hash_sha256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', threatScore: 88, severity: 'High', description: 'Executable Stager Binary SHA256', sourcePacket: 'Frame #4' },
      { type: 'url', value: 'https://auth-update-cdn.com/api/v1/update', threatScore: 85, severity: 'High', description: 'C2 Stager Telemetry Ingestion Endpoint', sourcePacket: 'Frame #4' }
    ],
    rootCauseAnalysis: {
      primaryVector: 'Stolen SSL-VPN Credentials & Unpatched RPC Service',
      exploitedVulnerabilities: 'CVE-2021-36942 (PetitPotam NTLM Coercion) & Missing MFA on Perimeter Gateway',
      description: 'The adversary logged into SSL-VPN using valid credentials, coerced DC-01 NTLM authentication over RPC, relayed the token to gain Domain Admin, and staged exfiltration.'
    },
    containmentAndRecovery: {
      containmentStatus: 'Host DC-01 and FS-APP-02 isolated. VPN accounts revoked. Active Directory krbtgt key reset initiated.',
      checklistItems: [
        { task: 'Block IP 185.220.101.5 on Perimeter Firewall', completed: true, assignedTo: 'Sarah Jenkins' },
        { task: 'Block Domain auth-update-cdn.com on DNS Gateway', completed: true, assignedTo: 'Sarah Jenkins' },
        { task: 'Force global reset for krbtgt account credentials', completed: true, assignedTo: 'Lead DFIR Analyst' },
        { task: 'Perform clean bare-metal rebuild of DC-01', completed: false, assignedTo: 'Lead DFIR Analyst' }
      ]
    },
    remediationRecommendations: [
      'Enforce hardware-backed FIDO2 multi-factor authentication across all remote access gateways.',
      'Disable NTLM authentication domain-wide and mandate Kerberos with SMB Signing.',
      'Apply security hotfixes for RPC PetitPotam (MS-EFSR) on all Domain Controllers.',
      'Deploy strict perimeter egress filtering to prevent unauthorized connections to unverified IPs.'
    ],
    evidenceIntegrity: [
      { artifactName: 'DC01_lsass_memory_dump.dmp', category: 'Memory Dump', hashSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', hashMd5: '9b74c2d8e1f04231a5b82c918347102e', verificationStatus: 'VERIFIED', verifiedAt: '31 Jul 2026 15:00 UTC' },
      { artifactName: 'incident_capture_DC01_10.0.1.5.pcapng', category: 'PCAP Trace', hashSha256: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2', hashMd5: '4f92a10521e89b418520d29173c09192', verificationStatus: 'VERIFIED', verifiedAt: '31 Jul 2026 14:30 UTC' },
      { artifactName: 'Security_EventLog_DC01_4624_4672.evtx', category: 'Event Log', hashSha256: 'e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', hashMd5: 'abcdef1234567890abcdef1234567890', verificationStatus: 'VERIFIED', verifiedAt: '31 Jul 2026 14:45 UTC' }
    ],
    chainOfCustodySummary: [
      { evidenceName: 'DC01_lsass_memory_dump.dmp', action: 'Evidence Verified', actor: 'Lead DFIR Analyst', timestamp: '31 Jul 2026 15:00 UTC', notes: 'Hash baseline verified against physical acquire log.' },
      { evidenceName: 'incident_capture_DC01_10.0.1.5.pcapng', action: 'Evidence Uploaded', actor: 'Sarah Jenkins', timestamp: '31 Jul 2026 14:30 UTC', notes: 'Exported from Palo Alto SPAN mirror port.' },
      { evidenceName: 'Security_EventLog_DC01_4624_4672.evtx', action: 'Evidence Uploaded', actor: 'Lead DFIR Analyst', timestamp: '31 Jul 2026 14:45 UTC', notes: 'Exported system security logs.' }
    ],
    investigatorNotes: [
      'Initial triage confirmed packet capture match with LSASS memory handle access.',
      'No secondary domain persistence detected after EDR full disk scan.'
    ],
    appendix: 'This report adheres to the NIST SP 800-61 Rev 2 Computer Security Incident Handling Guide and standardized DFIR taxonomy rules. All evidence hashes are stored in immutable local state.',
    references: [
      'NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide',
      'CVE-2021-36942: PetitPotam LSA RPC Coercion Vulnerability',
      'NetTrace DFIR Platform Documentation V1.0'
    ]
  }
];

export const initialThreatActors: ThreatActor[] = [
  {
    id: 'ta-1',
    name: 'LockBit Gang (LockBit 3.0 / Black)',
    aliases: ['Ransomware-as-a-Service', 'UNC2165', 'LockBit Black'],
    origin: 'Eastern Europe / Cybercrime Syndicate',
    targetSectors: ['Financial Services', 'Healthcare', 'Government', 'Critical Infrastructure'],
    primaryTTPs: ['T1078 Valid Accounts', 'T1003 Credential Dumping', 'T1490 Inhibit System Recovery', 'T1486 Data Encrypted for Impact'],
    threatLevel: 'Critical',
    description: 'Highly active Ransomware-as-a-Service operator providing automated payloads, anti-analysis obfuscation, and double exfiltration leak portals.',
    associatedMalware: ['LockBit 3.0', 'StealBit Exfiltration Tool', 'Cobalt Strike']
  },
  {
    id: 'ta-2',
    name: 'Cozy Bear (APT29)',
    aliases: ['NOBELIUM', 'Midnight Blizzard', 'The Dukes'],
    origin: 'State-Sponsored',
    targetSectors: ['Defense', 'Diplomatic', 'IT Service Providers', 'Government'],
    primaryTTPs: ['T1566 Spearphishing', 'T1071 C2 HTTPS', 'T1550 Use Alternate Authentication Material'],
    threatLevel: 'High',
    description: 'Advanced persistent threat group specializing in stealthy supply chain compromises, cloud credential harvesting, and long-term surveillance.',
    associatedMalware: ['GraphicalProton', 'EnvyScout', 'Cobalt Strike']
  }
];

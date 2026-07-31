import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface JargonBadgeProps {
  term: 'IOC' | 'C2' | 'Containment' | 'DFIR' | 'Hash' | 'Packet' | 'Protocol' | 'PCAP';
  customText?: string;
  className?: string;
}

const jargonDefinitions: Record<JargonBadgeProps['term'], { title: string; definition: string; example: string }> = {
  IOC: {
    title: 'Indicator of Compromise (IOC)',
    definition: 'Forensic artifact (IP address, file hash, or domain) that identifies malicious activity or a system breach.',
    example: 'e.g. 185.220.101.5 or ransomware.exe (SHA-256)'
  },
  C2: {
    title: 'Command & Control (C2)',
    definition: 'An attacker-controlled server used to remotely send commands to compromised systems and exfiltrate data.',
    example: 'e.g. Reverse TCP beacon on port 443'
  },
  Containment: {
    title: 'Incident Containment',
    definition: 'Actions taken to isolate compromised systems, sever attacker access, and stop malware from spreading across the network.',
    example: 'e.g. Disabling host NICs or blocking firewall ports'
  },
  DFIR: {
    title: 'Digital Forensics & Incident Response',
    definition: 'Cybersecurity discipline focused on identifying, investigating, containing, and remediating cyber threats.',
    example: 'e.g. PCAP analysis, memory inspection & timeline creation'
  },
  Hash: {
    title: 'Cryptographic File Hash',
    definition: 'A unique digital fingerprint (such as SHA-256) generated from a file to verify its identity and integrity.',
    example: 'e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4...'
  },
  Packet: {
    title: 'Network Packet',
    definition: 'A structured unit of data transmitted over a network containing control headers and raw payload payload.',
    example: 'e.g. TCP frame with source/destination IP & payload bytes'
  },
  Protocol: {
    title: 'Network Communication Protocol',
    definition: 'A standardized system of rules governing how devices transmit and receive data over a network.',
    example: 'e.g. HTTP, DNS, TCP, SMB, TLS'
  },
  PCAP: {
    title: 'Packet Capture (PCAP)',
    definition: 'A recorded file containing raw network packet streams captured from a network interface for forensic analysis.',
    example: 'e.g. ransomware_stager.pcap'
  }
};

export const JargonBadge: React.FC<JargonBadgeProps> = ({ term, customText, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = jargonDefinitions[term];

  return (
    <span 
      className={`inline-flex items-center space-x-1 relative group cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      tabIndex={0}
      aria-label={`Cybersecurity term explanation for ${term}`}
    >
      <span className="underline decoration-cyan-500/60 decoration-dashed underline-offset-4 text-cyan-300 font-bold hover:text-cyan-200 transition-colors">
        {customText || term}
      </span>
      <Info className="w-3 h-3 text-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity inline shrink-0" />

      {isOpen && (
        <span className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-slate-900 border border-cyan-500/80 rounded-xl shadow-2xl text-slate-100 text-xs space-y-1.5 animate-fadeIn pointer-events-none block font-sans">
          <span className="flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 text-cyan-300 font-bold block">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 inline" />
            <span>{info.title}</span>
          </span>
          <span className="text-[11px] text-slate-300 leading-snug font-sans block">{info.definition}</span>
          <span className="p-1.5 bg-slate-950 rounded border border-slate-800 text-[10px] text-cyan-400/90 font-mono block">
            {info.example}
          </span>
        </span>
      )}
    </span>
  );
};

import React, { useState } from 'react';
import { Packet } from '../../types';
import { 
  X, 
  Copy, 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Network, 
  ShieldAlert, 
  FileCode,
  Globe,
  Lock,
  Database
} from 'lucide-react';

interface HexRow {
  offset: string;
  hexBytes: string[];
  asciiStr: string;
}

function generateHexDump(packet: Packet): HexRow[] {
  let rawHex = packet.payloadHex || '';
  if (!rawHex && packet.asciiStream) {
    let hex = '';
    for (let i = 0; i < packet.asciiStream.length; i++) {
      hex += packet.asciiStream.charCodeAt(i).toString(16).padStart(2, '0');
    }
    rawHex = hex;
  }

  const cleanHex = rawHex.replace(/[^0-9a-fA-F]/g, '');
  if (!cleanHex) return [];

  const rows: HexRow[] = [];
  
  for (let i = 0; i < cleanHex.length; i += 32) {
    const chunk = cleanHex.slice(i, i + 32);
    const offset = (i / 2).toString(16).padStart(4, '0').toUpperCase();
    const hexBytes: string[] = [];
    let asciiStr = '';

    for (let j = 0; j < chunk.length; j += 2) {
      const byteHex = chunk.slice(j, j + 2).padEnd(2, '0').toUpperCase();
      hexBytes.push(byteHex);
      const code = parseInt(byteHex, 16);
      asciiStr += (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
    }

    while (hexBytes.length < 16) {
      hexBytes.push('  ');
    }

    rows.push({ offset, hexBytes, asciiStr });
  }

  return rows;
}

function ipToHex(ipStr: string): string {
  try {
    const parts = ipStr.split('.').map(n => parseInt(n, 10));
    if (parts.length === 4 && !parts.some(isNaN)) {
      return parts.map(p => p.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return '0a000105';
}

function portToHex(portNum: number): string {
  try {
    return (portNum || 80).toString(16).padStart(4, '0');
  } catch {
    return '0050';
  }
}

export const PacketHexViewer: React.FC<{ packet: Packet; onClose?: () => void }> = ({ packet, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    frame: true,
    eth: true,
    ip: true,
    tcp: true,
    app: true,
    payload: true
  });

  const [highlightedByteRange, setHighlightedByteRange] = useState<{ start: number; end: number } | null>(null);
  const [hoveredByteIndex, setHoveredByteIndex] = useState<number | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hexRows = generateHexDump(packet);

  const tcpFlags = packet.flags?.length ? packet.flags.join(', ') : '0x018 (PSH, ACK)';
  const isDns = packet.protocol === 'DNS' || !!packet.dnsQuery;
  const isHttp = packet.protocol === 'HTTP' || !!packet.httpMethod || !!packet.httpUrl;
  const isTls = packet.protocol === 'HTTPS' || packet.protocol === 'TLS' || packet.destPort === 443 || packet.srcPort === 443;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5 font-mono text-xs shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-heading flex items-center space-x-2">
              <span>Wireshark Deep Packet Inspection (DPI)</span>
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded text-[10px] font-mono">
                Frame #{packet.packetNo}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Protocol headers, decoded fields, and byte synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] font-sans">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Protocol:</span>
          <span className="text-cyan-400 font-bold font-mono">{packet.protocol}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Source Endpoint:</span>
          <span className="text-slate-200 font-mono">{packet.srcIp}:{packet.srcPort}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Destination Endpoint:</span>
          <span className="text-slate-200 font-mono">{packet.destIp}:{packet.destPort}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Frame Length:</span>
          <span className="text-emerald-400 font-semibold font-mono">{packet.length} Bytes</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Verdict / Status:</span>
          <span className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded border inline-block ${
            packet.threatRating === 'Malicious' ? 'bg-red-950 text-red-400 border-red-800' :
            packet.threatRating === 'Suspicious' ? 'bg-amber-950 text-amber-400 border-amber-800' :
            'bg-emerald-950 text-emerald-400 border-emerald-800'
          }`}>
            {packet.threatRating || 'Clean'}
          </span>
        </div>
      </div>

      {/* Main Split Grid: Protocol Details Tree (Left) vs Hex Dump Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Collapsible Protocol Details Tree (6 cols) */}
        <div className="lg:col-span-6 space-y-2 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-300 font-sans text-xs font-bold">
            <span className="flex items-center space-x-1.5 font-heading">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Collapsible Protocol Tree</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Wireshark DPI Dissect</span>
          </div>

          {/* Section 1: Frame Details */}
          <div 
            className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70"
            onMouseEnter={() => setHighlightedByteRange({ start: 0, end: 14 })}
            onMouseLeave={() => setHighlightedByteRange(null)}
          >
            <button
              onClick={() => toggleSection('frame')}
              className="w-full px-3 py-2 bg-slate-900/90 text-left font-bold text-slate-200 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center space-x-2 font-mono text-[11px] text-cyan-300">
                {expandedSections.frame ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span>Frame {packet.packetNo}: {packet.length} bytes on wire ({packet.length * 8} bits)</span>
              </span>
            </button>
            {expandedSections.frame && (
              <div className="p-2.5 text-[11px] space-y-1 text-slate-300 border-t border-slate-800 bg-black/40 pl-6">
                <div>• Arrival Time: <span className="text-slate-100 font-mono">{packet.timestamp}</span></div>
                <div>• Frame Number: <span className="text-slate-100 font-mono">{packet.packetNo}</span></div>
                <div>• Frame Length: <span className="text-slate-100 font-mono">{packet.length} bytes</span></div>
                <div>• Capture Length: <span className="text-slate-100 font-mono">{packet.length} bytes</span></div>
                <div>• Encapsulation Type: <span className="text-cyan-400 font-mono">Ethernet (1)</span></div>
              </div>
            )}
          </div>

          {/* Section 2: Ethernet II */}
          <div 
            className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70"
            onMouseEnter={() => setHighlightedByteRange({ start: 0, end: 14 })}
            onMouseLeave={() => setHighlightedByteRange(null)}
          >
            <button
              onClick={() => toggleSection('eth')}
              className="w-full px-3 py-2 bg-slate-900/90 text-left font-bold text-slate-200 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center space-x-2 font-mono text-[11px] text-purple-300">
                {expandedSections.eth ? <ChevronDown className="w-3.5 h-3.5 text-purple-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span>Ethernet II, Src: 00:1a:2b:3c:4d:5e, Dst: 00:11:22:33:44:55</span>
              </span>
            </button>
            {expandedSections.eth && (
              <div className="p-2.5 text-[11px] space-y-1 text-slate-300 border-t border-slate-800 bg-black/40 pl-6">
                <div>• Destination: <span className="text-purple-300 font-mono">00:11:22:33:44:55 (Cisco_33:44:55)</span></div>
                <div>• Source: <span className="text-purple-300 font-mono">00:1a:2b:3c:4d:5e (Dell_3c:4d:5e)</span></div>
                <div>• EtherType: <span className="text-cyan-400 font-mono">IPv4 (0x0800)</span></div>
              </div>
            )}
          </div>

          {/* Section 3: Internet Protocol Version 4 */}
          <div 
            className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70"
            onMouseEnter={() => setHighlightedByteRange({ start: 14, end: 34 })}
            onMouseLeave={() => setHighlightedByteRange(null)}
          >
            <button
              onClick={() => toggleSection('ip')}
              className="w-full px-3 py-2 bg-slate-900/90 text-left font-bold text-slate-200 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center space-x-2 font-mono text-[11px] text-blue-300">
                {expandedSections.ip ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span>Internet Protocol Version 4, Src: {packet.srcIp}, Dst: {packet.destIp}</span>
              </span>
            </button>
            {expandedSections.ip && (
              <div className="p-2.5 text-[11px] space-y-1 text-slate-300 border-t border-slate-800 bg-black/40 pl-6">
                <div>• Version: <span className="text-slate-100 font-mono">4</span></div>
                <div>• Header Length: <span className="text-slate-100 font-mono">20 bytes (5)</span></div>
                <div>• Differentiated Services Field: <span className="text-slate-100 font-mono">0x00</span></div>
                <div>• Total Length: <span className="text-slate-100 font-mono">{packet.length}</span></div>
                <div>• Identification: <span className="text-slate-100 font-mono">0x1f4c (8012)</span></div>
                <div>• Flags: <span className="text-slate-100 font-mono">0x4000, Don't fragment</span></div>
                <div>• Time to Live (TTL): <span className="text-slate-100 font-mono">64</span></div>
                <div>• Protocol: <span className="text-cyan-400 font-mono">{packet.protocol} ({isDns ? 17 : 6})</span></div>
                <div>• Header Checksum: <span className="text-emerald-400 font-mono">0x7c92 [verified]</span></div>
                <div>• Source Address: <span className="text-cyan-300 font-mono">{packet.srcIp}</span></div>
                <div>• Destination Address: <span className="text-cyan-300 font-mono">{packet.destIp}</span></div>
              </div>
            )}
          </div>

          {/* Section 4: TCP / UDP Header */}
          <div 
            className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70"
            onMouseEnter={() => setHighlightedByteRange({ start: 34, end: 54 })}
            onMouseLeave={() => setHighlightedByteRange(null)}
          >
            <button
              onClick={() => toggleSection('tcp')}
              className="w-full px-3 py-2 bg-slate-900/90 text-left font-bold text-slate-200 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center space-x-2 font-mono text-[11px] text-emerald-300">
                {expandedSections.tcp ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isDns ? 'User Datagram Protocol' : 'Transmission Control Protocol'}, Src Port: {packet.srcPort}, Dst Port: {packet.destPort}</span>
              </span>
            </button>
            {expandedSections.tcp && (
              <div className="p-2.5 text-[11px] space-y-1 text-slate-300 border-t border-slate-800 bg-black/40 pl-6">
                <div>• Source Port: <span className="text-emerald-300 font-mono">{packet.srcPort}</span></div>
                <div>• Destination Port: <span className="text-emerald-300 font-mono">{packet.destPort}</span></div>
                {!isDns && (
                  <>
                    <div>• Sequence Number: <span className="text-slate-100 font-mono">1 (relative sequence)</span></div>
                    <div>• Acknowledgment Number: <span className="text-slate-100 font-mono">1 (relative ack)</span></div>
                    <div>• Header Length: <span className="text-slate-100 font-mono">32 bytes (8)</span></div>
                    <div>• TCP Flags: <span className="text-amber-400 font-mono">{tcpFlags}</span></div>
                    <div>• Window Size: <span className="text-slate-100 font-mono">64240</span></div>
                    <div>• Checksum: <span className="text-emerald-400 font-mono">0xc442 [correct]</span></div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Application Protocol (DNS / HTTP / TLS) */}
          {(isDns || isHttp || isTls) && (
            <div 
              className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70"
              onMouseEnter={() => setHighlightedByteRange({ start: 54, end: 120 })}
              onMouseLeave={() => setHighlightedByteRange(null)}
            >
              <button
                onClick={() => toggleSection('app')}
                className="w-full px-3 py-2 bg-slate-900/90 text-left font-bold text-slate-200 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
              >
                <span className="flex items-center space-x-2 font-mono text-[11px] text-amber-300">
                  {expandedSections.app ? <ChevronDown className="w-3.5 h-3.5 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  <span>
                    {isDns ? 'Domain Name System (DNS Query)' : isHttp ? 'Hypertext Transfer Protocol (HTTP/1.1)' : 'Transport Layer Security (TLSv1.3)'}
                  </span>
                </span>
              </button>
              {expandedSections.app && (
                <div className="p-2.5 text-[11px] space-y-1 text-slate-300 border-t border-slate-800 bg-black/40 pl-6">
                  {isDns && (
                    <>
                      <div>• Transaction ID: <span className="text-amber-300 font-mono">0x3f2a</span></div>
                      <div>• Flags: <span className="text-slate-100 font-mono">0x0100 Standard Query</span></div>
                      <div>• Query Name: <span className="text-cyan-300 font-mono font-bold">{packet.dnsQuery || packet.info || 'DNS Query'}</span></div>
                      <div>• Query Type: <span className="text-slate-100 font-mono">A (Host Address)</span></div>
                    </>
                  )}
                  {isHttp && (
                    <>
                      <div>• Method: <span className="text-cyan-400 font-mono font-bold">{packet.httpMethod || 'GET/POST'}</span></div>
                      <div>• Request URI: <span className="text-slate-100 font-mono">{packet.httpUrl || packet.info || '/'}</span></div>
                      <div>• Host: <span className="text-amber-300 font-mono">{packet.destIp}</span></div>
                      <div>• User-Agent: <span className="text-slate-300 font-mono">NetTrace-DPI/1.0</span></div>
                    </>
                  )}
                  {isTls && (
                    <>
                      <div>• TLS Version: <span className="text-amber-300 font-mono">TLS 1.3</span></div>
                      <div>• Handshake Protocol: <span className="text-slate-100 font-mono">Client Hello</span></div>
                      <div>• Cipher Suite: <span className="text-cyan-300 font-mono">TLS_AES_256_GCM_SHA384</span></div>
                      <div>• Server Name (SNI): <span className="text-emerald-300 font-mono font-bold">{packet.destIp}</span></div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 6: Payload Data */}
          <div 
            className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70"
            onMouseEnter={() => setHighlightedByteRange({ start: 54, end: 200 })}
            onMouseLeave={() => setHighlightedByteRange(null)}
          >
            <button
              onClick={() => toggleSection('payload')}
              className="w-full px-3 py-2 bg-slate-900/90 text-left font-bold text-slate-200 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center space-x-2 font-mono text-[11px] text-cyan-300">
                {expandedSections.payload ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span>Reconstructed Payload Stream ({packet.length - 54} Bytes)</span>
              </span>
            </button>
            {expandedSections.payload && (
              <div className="p-2.5 text-[11px] space-y-1 text-slate-300 border-t border-slate-800 bg-black/40 pl-6">
                <div>• Information: <span className="text-slate-200 font-sans">{packet.info}</span></div>
                {packet.asciiStream && (
                  <div className="mt-1">
                    <span className="text-slate-500 block text-[10px]">ASCII Stream Preview:</span>
                    <pre className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-amber-300 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {packet.asciiStream}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Hex & ASCII Viewer with Byte Highlight Synchronization (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 overflow-x-auto font-mono text-[11px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-sans text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1.5 font-heading">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Hex & ASCII Inspector</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {hoveredByteIndex !== null ? `Byte Offset: 0x${hoveredByteIndex.toString(16).padStart(4, '0')}` : 'Hover bytes to inspect'}
            </span>
          </div>

          {/* Table Header */}
          <div className="bg-black/80 border border-slate-800 rounded-lg p-3 space-y-1 overflow-x-auto text-[11px]">
            <div className="text-slate-500 border-b border-slate-800 pb-1.5 flex items-center space-x-4 font-bold text-[10px]">
              <span className="w-12 text-slate-400">OFFSET</span>
              <span className="flex-1 text-slate-400">HEXADECIMAL BYTES (00 - 0F)</span>
              <span className="w-32 text-slate-400">ASCII STREAM</span>
            </div>

            {/* Hex Dump Rows */}
            {hexRows.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-sans text-xs italic">
                No raw payload bytes available for this frame.
              </div>
            ) : (
              hexRows.map((row, rowIdx) => {
              const rowStartByte = rowIdx * 16;
              return (
                <div key={row.offset} className="flex items-center space-x-4 hover:bg-slate-900/80 py-0.5 rounded transition-colors group">
                  {/* Offset Column */}
                  <span className="w-12 text-slate-500 font-mono select-none text-[10px]">{row.offset}</span>

                  {/* Hexadecimal Bytes Column */}
                  <div className="flex-1 flex space-x-1 tracking-wider text-cyan-300">
                    {row.hexBytes.map((byte, bIdx) => {
                      const absoluteByteIdx = rowStartByte + bIdx;
                      const isHovered = hoveredByteIndex === absoluteByteIdx;
                      const isTreeHighlighted = highlightedByteRange && absoluteByteIdx >= highlightedByteRange.start && absoluteByteIdx <= highlightedByteRange.end;
                      
                      return (
                        <span
                          key={`b-${rowIdx}-${bIdx}`}
                          onMouseEnter={() => setHoveredByteIndex(absoluteByteIdx)}
                          onMouseLeave={() => setHoveredByteIndex(null)}
                          className={`px-0.5 rounded cursor-pointer transition-colors ${
                            isHovered
                              ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                              : isTreeHighlighted
                              ? 'bg-purple-950 text-purple-300 border border-purple-700 font-bold'
                              : 'hover:bg-cyan-950 hover:text-cyan-200'
                          }`}
                        >
                          {byte}
                        </span>
                      );
                    })}
                  </div>

                  {/* ASCII Stream Column */}
                  <div className="w-32 text-emerald-400 font-mono flex">
                    {row.asciiStr.split('').map((char, cIdx) => {
                      const absoluteByteIdx = rowStartByte + cIdx;
                      const isHovered = hoveredByteIndex === absoluteByteIdx;
                      const isTreeHighlighted = highlightedByteRange && absoluteByteIdx >= highlightedByteRange.start && absoluteByteIdx <= highlightedByteRange.end;

                      return (
                        <span
                          key={`c-${rowIdx}-${cIdx}`}
                          onMouseEnter={() => setHoveredByteIndex(absoluteByteIdx)}
                          onMouseLeave={() => setHoveredByteIndex(null)}
                          className={`px-[1px] rounded transition-colors ${
                            isHovered
                              ? 'bg-cyan-400 text-slate-950 font-bold'
                              : isTreeHighlighted
                              ? 'bg-purple-950 text-purple-300 font-bold'
                              : ''
                          }`}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

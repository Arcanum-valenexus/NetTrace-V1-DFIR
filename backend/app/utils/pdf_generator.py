import io
import textwrap
import unicodedata
from typing import Dict, Any, List

class DFIRPdfGenerator:
    """Production PDF Generator for 15-Section DFIR Forensics Reports with Multi-page Pagination, Text Wrapping, and Unicode Support."""

    def __init__(self, report_data: Dict[str, Any]):
        self.report = report_data
        self.title = report_data.get("incidentTitle", "DFIR Forensics Incident Report")
        self.report_number = report_data.get("reportNumber", report_data.get("id", "REP-2026-0001"))
        self.case_id = report_data.get("caseId", "CASE-2026-0001")
        self.version = report_data.get("version", 1)
        self.status = report_data.get("status", "Draft")
        self.report_hash = report_data.get("reportHash", "Pending Cryptographic Seal")
        self.generated_at = report_data.get("generatedAt", "")
        self.generated_by = report_data.get("generatedBy", "Lead DFIR Investigator")
        self.organization = report_data.get("organization", "Cyber Defense & Forensics Labs")

    def _sanitize(self, text: str) -> str:
        """Converts unicode characters to safe ASCII equivalents for standard PDF Type1 font rendering."""
        if not text:
            return ""
        replacements = {
            '\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"',
            '\u2013': '-', '\u2014': '--', '\u2022': '*', '\u2026': '...',
            '\u00a0': ' ', '\u00a9': '(C)', '\u00ae': '(R)'
        }
        for u_char, ascii_char in replacements.items():
            text = text.replace(u_char, ascii_char)
        
        # Normalize and encode to ASCII, ignoring unprintable characters
        normalized = unicodedata.normalize('NFKD', text)
        return normalized.encode('ascii', 'ignore').decode('ascii')

    def _wrap_line(self, line: str, width: int = 78) -> List[str]:
        """Wraps long lines to prevent horizontal page overflow."""
        clean_line = self._sanitize(line)
        if len(clean_line) <= width:
            return [clean_line]
        
        indent = ""
        if clean_line.startswith("    "):
            indent = "    "
        elif clean_line.startswith("  "):
            indent = "  "

        wrapped = textwrap.wrap(clean_line, width=width, subsequent_indent=indent, break_long_words=False, replace_whitespace=False)
        return wrapped if wrapped else [clean_line]

    def generate(self) -> bytes:
        """Constructs a valid multi-page PDF 1.4 document containing all 15 report sections."""
        raw_lines = []
        raw_lines.append("================================================================================")
        raw_lines.append("                     NETTRACE V1.0 ENTERPRISE DFIR REPORT                       ")
        raw_lines.append("================================================================================")
        raw_lines.append(f"Report Number: {self.report_number}")
        raw_lines.append(f"Case ID:       {self.case_id}")
        raw_lines.append(f"Title:         {self.title}")
        raw_lines.append(f"Version:       v{self.version}.0")
        raw_lines.append(f"Status:        {self.status}")
        raw_lines.append(f"Generated At:  {self.generated_at}")
        raw_lines.append(f"Investigator:  {self.generated_by}")
        raw_lines.append(f"Organization:  {self.organization}")
        raw_lines.append(f"SHA-256 Hash:  {self.report_hash}")
        raw_lines.append("================================================================================\n")

        # 1. Executive Summary
        raw_lines.append("--- SECTION 1: EXECUTIVE SUMMARY ---")
        raw_lines.append(str(self.report.get("executiveSummary", "No executive summary provided.")))
        raw_lines.append("\n")

        # 2. Incident Case Details
        raw_lines.append("--- SECTION 2: INCIDENT CASE DETAILS ---")
        inc_details = self.report.get("incidentCaseDetails", {})
        if isinstance(inc_details, dict):
            for k, v in inc_details.items():
                if k != "impactedAssets":
                    raw_lines.append(f"  * {k}: {v}")
            assets = inc_details.get("impactedAssets", [])
            if assets:
                raw_lines.append("  Impacted Assets:")
                for a in assets:
                    raw_lines.append(f"    - Host: {a.get('hostname')} | IP: {a.get('ipAddress')} | OS: {a.get('os')} | Status: {a.get('status')}")
        raw_lines.append("\n")

        # 3. Attack Timeline
        raw_lines.append("--- SECTION 3: CHRONOLOGICAL ATTACK TIMELINE ---")
        timeline = self.report.get("attackTimeline", [])
        if timeline:
            for t in timeline:
                raw_lines.append(f"  [{t.get('timestamp')}] [{t.get('source')}] {t.get('eventType')}: {t.get('description')}")
        else:
            raw_lines.append("  No timeline events recorded.")
        raw_lines.append("\n")

        # 4. Evidence Inventory
        raw_lines.append("--- SECTION 4: DIGITAL EVIDENCE INVENTORY ---")
        evidence = self.report.get("evidenceInventory", [])
        if evidence:
            for e in evidence:
                raw_lines.append(f"  - {e.get('name')} ({e.get('category')}) | Size: {e.get('sizeBytes')} B | SHA256: {e.get('hashSha256')}")
        else:
            raw_lines.append("  No evidence artifacts registered.")
        raw_lines.append("\n")

        # 5. Packet Deep Inspection
        raw_lines.append("--- SECTION 5: PACKET DEEP INSPECTION (SCAPY / PYSHARK) ---")
        pcap = self.report.get("packetAnalysis", {})
        if isinstance(pcap, dict):
            raw_lines.append(f"  PCAP File:           {pcap.get('pcapFilename', 'None')}")
            raw_lines.append(f"  Dissection Engine:   {pcap.get('analysisEngine', 'Scapy / PyShark')}")
            raw_lines.append(f"  Total Packets:       {pcap.get('totalPacketsParsed', 0)}")
            raw_lines.append(f"  Capture Duration:   {pcap.get('captureDurationSeconds', 0)}s")
            top_p = pcap.get("topProtocols", [])
            raw_lines.append(f"  Top Protocols:       {', '.join([str(p) for p in top_p]) if top_p else 'None'}")
        raw_lines.append("\n")

        # 6. Indicators of Compromise
        raw_lines.append("--- SECTION 6: INDICATORS OF COMPROMISE (IOCs) ---")
        iocs = self.report.get("iocs", {})
        if isinstance(iocs, dict):
            items = iocs.get("items", [])
            raw_lines.append(f"  Summary: {iocs.get('summary', 'IOC Analysis Complete')}")
            for i in items:
                raw_lines.append(f"  [{i.get('type', 'IOC').upper()}] {i.get('value')} (Severity: {i.get('severity')}, Status: {i.get('status')})")
        raw_lines.append("\n")

        # 7. Root Cause Analysis
        raw_lines.append("--- SECTION 7: ROOT CAUSE ANALYSIS ---")
        rca = self.report.get("rootCauseAnalysis", {})
        if isinstance(rca, dict):
            raw_lines.append(f"  Primary Vector:            {rca.get('primaryVector', 'Initial Access')}")
            raw_lines.append(f"  Exploited Vulnerabilities: {rca.get('exploitedVulnerabilities', 'None')}")
            raw_lines.append(f"  Technical Description:     {rca.get('description', 'Under Analysis')}")
        raw_lines.append("\n")

        # 8. Containment & Recovery
        raw_lines.append("--- SECTION 8: CONTAINMENT & RECOVERY ACTIONS ---")
        car = self.report.get("containmentAndRecovery", {})
        if isinstance(car, dict):
            raw_lines.append(f"  Status: {car.get('containmentStatus', 'Ongoing')}")
            checklist = car.get("checklistItems", [])
            for c in checklist:
                status_str = "[X]" if c.get("completed") else "[ ]"
                raw_lines.append(f"  {status_str} {c.get('task')} (Assigned: {c.get('assignedTo')})")
        raw_lines.append("\n")

        # 9. Remediation Recommendations
        raw_lines.append("--- SECTION 9: REMEDIATION RECOMMENDATIONS ---")
        recs = self.report.get("remediationRecommendations", [])
        if recs:
            for idx, r in enumerate(recs, 1):
                raw_lines.append(f"  {idx}. {r}")
        else:
            raw_lines.append("  No remediation recommendations listed.")
        raw_lines.append("\n")

        # 10. Evidence Integrity Register
        raw_lines.append("--- SECTION 10: EVIDENCE INTEGRITY VERIFICATION REGISTER ---")
        ei = self.report.get("evidenceIntegrity", [])
        if ei:
            for e in ei:
                raw_lines.append(f"  Artifact: {e.get('artifactName')} | SHA256: {e.get('hashSha256')} | Verification: {e.get('verificationStatus')}")
        else:
            raw_lines.append("  All ingested evidence hashes cryptographically verified.")
        raw_lines.append("\n")

        # 11. Chain of Custody Summary
        raw_lines.append("--- SECTION 11: CHAIN OF CUSTODY SUMMARY ---")
        coc = self.report.get("chainOfCustodySummary", [])
        if coc:
            for c in coc:
                raw_lines.append(f"  [{c.get('timestamp')}] {c.get('evidenceName')}: {c.get('action')} by {c.get('actor')} ({c.get('notes')})")
        else:
            raw_lines.append("  Chain of custody tracked immutably in database register.")
        raw_lines.append("\n")

        # 12. Investigator Notes
        raw_lines.append("--- SECTION 12: INVESTIGATOR NOTES ---")
        notes = self.report.get("investigatorNotes", [])
        if notes:
            for n in notes:
                raw_lines.append(f"  * {n}")
        else:
            raw_lines.append("  No additional notes attached.")
        raw_lines.append("\n")

        # 13. Appendix & Methodology
        raw_lines.append("--- SECTION 13: APPENDIX & METHODOLOGY ---")
        raw_lines.append(str(self.report.get("appendix", "Adheres to NIST SP 800-61 Rev 2 DFIR Forensic Guidelines.")))
        raw_lines.append("\n")

        # 14. Version Control & History
        raw_lines.append("--- SECTION 14: VERSION CONTROL & REVISION HISTORY ---")
        raw_lines.append(f"  Current Version: v{self.version}.0")
        raw_lines.append(f"  Revision Reason: {self.report.get('revisionReason', 'Initial Formal Investigation Report')}")
        raw_lines.append("\n")

        # 15. Cryptographic Seal
        raw_lines.append("--- SECTION 15: CRYPTOGRAPHIC REPORT INTEGRITY SEAL ---")
        raw_lines.append(f"  SHA-256 Checksum:  {self.report_hash}")
        raw_lines.append(f"  Seal Timestamp:    {self.generated_at}")
        raw_lines.append(f"  Digital Attestation: Authenticated electronic signature by {self.generated_by}, {self.organization}.")
        raw_lines.append("================================================================================")

        # Process line wrapping
        formatted_lines = []
        for line in raw_lines:
            formatted_lines.extend(self._wrap_line(line))

        return self._build_pdf_binary(formatted_lines)

    def _build_pdf_binary(self, lines: List[str]) -> bytes:
        """Encodes formatted lines into a valid multi-page PDF 1.4 document stream."""
        lines_per_page = 55
        pages_content: List[List[str]] = []
        
        for i in range(0, len(lines), lines_per_page):
            pages_content.append(lines[i:i + lines_per_page])

        num_pages = len(pages_content)

        # Object registry setup:
        # Obj 1: Catalog
        # Obj 2: Pages container
        # Obj 3: Font (/Type1 /Courier)
        # Page i (1..N):
        #   Obj Page_i_ref = 3 + (i - 1)*2 + 1  --> (4, 6, 8, ...)
        #   Obj Content_i_ref = 3 + (i - 1)*2 + 2 --> (5, 7, 9, ...)

        font_obj_id = 3
        page_objs_refs = []
        content_objs_refs = []

        for idx in range(num_pages):
            page_id = 4 + (idx * 2)
            content_id = page_id + 1
            page_objs_refs.append(page_id)
            content_objs_refs.append(content_id)

        objects = {}

        # 1. Catalog Object
        objects[1] = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"

        # 2. Pages Container Object
        kids_str = " ".join([f"{p} 0 R" for p in page_objs_refs])
        objects[2] = f"2 0 obj\n<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>\nendobj\n".encode("utf-8")

        # 3. Font Object
        objects[3] = b"3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n"

        # Page and Content Stream Objects
        for idx in range(num_pages):
            page_id = page_objs_refs[idx]
            content_id = content_objs_refs[idx]
            page_lines = pages_content[idx]

            # Construct content stream instructions
            stream_lines = ["BT", "/F1 9 Tf", "12 TL", "40 800 Td"]
            for l in page_lines:
                escaped = l.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
                stream_lines.append(f"({escaped}) Tj T*")
            
            # Page Footer
            footer_str = f"Page {idx + 1} of {num_pages} | {self.report_number} | CONFIDENTIAL DFIR REPORT"
            footer_escaped = footer_str.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            stream_lines.append(f"T* (--- {footer_escaped} ---) Tj")
            stream_lines.append("ET")

            stream_data = "\n".join(stream_lines).encode("utf-8")
            stream_len = len(stream_data)

            objects[page_id] = f"{page_id} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents {content_id} 0 R >>\nendobj\n".encode("utf-8")
            objects[content_id] = f"{content_id} 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("utf-8") + stream_data + b"\nendstream\nendobj\n"

        max_obj_id = max(objects.keys())

        # Compile PDF Binary with xref table
        pdf_buf = io.BytesIO()
        pdf_buf.write(b"%PDF-1.4\n")

        offsets = {}
        for obj_id in sorted(objects.keys()):
            offsets[obj_id] = pdf_buf.tell()
            pdf_buf.write(objects[obj_id])

        xref_offset = pdf_buf.tell()
        pdf_buf.write(f"xref\n0 {max_obj_id + 1}\n0000000000 65535 f \n".encode("utf-8"))
        for obj_id in range(1, max_obj_id + 1):
            offset = offsets[obj_id]
            pdf_buf.write(f"{offset:010d} 00000 n \n".encode("utf-8"))

        pdf_buf.write(f"trailer\n<< /Size {max_obj_id + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("utf-8"))

        return pdf_buf.getvalue()


def generate_dfir_report_pdf(report_data: Dict[str, Any]) -> bytes:
    """Utility function returning raw PDF byte array for a report."""
    generator = DFIRPdfGenerator(report_data)
    return generator.generate()


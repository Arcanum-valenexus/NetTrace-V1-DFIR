from typing import Dict, Any, List, Optional
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserModel
from app.models.incident import IncidentModel
from app.models.evidence import EvidenceArtifactModel
from app.models.pcap import PcapSessionModel, PacketModel
from app.models.ioc import IOCModel


class DashboardService:
    """Service providing real-time database query aggregations for Operational Dashboard, PCAP Forensic Analytics, and IOC Intelligence."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def _get_user(self, user_id: Optional[str]) -> Optional[UserModel]:
        if not user_id:
            return None
        res = await self.session.execute(select(UserModel).where(UserModel.id == user_id))
        return res.scalars().first()

    async def get_overview_metrics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates real live metrics from SQLite/PostgreSQL database filtered by user identity."""
        user = await self._get_user(user_id)

        # Count active non-deleted incidents
        inc_query = select(func.count()).select_from(IncidentModel).where(IncidentModel.is_deleted == False)
        crit_query = select(func.count()).select_from(IncidentModel).where(
            IncidentModel.is_deleted == False,
            IncidentModel.severity == "Critical"
        )
        if user:
            user_filters = [
                IncidentModel.assigned_analyst == user.full_name,
                IncidentModel.assigned_analyst == user.email
            ]
            if user.email and "@" in user.email:
                user_filters.append(IncidentModel.assigned_analyst.contains(user.email.split("@")[0]))
            inc_query = inc_query.where(or_(*user_filters))
            crit_query = crit_query.where(or_(*user_filters))

        incidents_result = await self.session.execute(inc_query)
        total_incidents = incidents_result.scalar_one() or 0

        critical_result = await self.session.execute(crit_query)
        critical_alerts = critical_result.scalar_one() or 0

        # Count evidence artifacts
        ev_query = select(func.count()).select_from(EvidenceArtifactModel).where(EvidenceArtifactModel.is_deleted == False)
        if user:
            ev_query = ev_query.where(or_(
                EvidenceArtifactModel.owner_investigator_id == user.id,
                EvidenceArtifactModel.uploaded_by == user.email,
                EvidenceArtifactModel.uploaded_by == user.full_name
            ))
        evidence_result = await self.session.execute(ev_query)
        evidence_count = evidence_result.scalar_one() or 0

        # Count completed PCAP sessions
        pcap_query = select(func.count()).select_from(PcapSessionModel).where(PcapSessionModel.status == "Completed")
        if user:
            pcap_query = pcap_query.where(or_(
                PcapSessionModel.uploaded_by == user.email,
                PcapSessionModel.uploaded_by == user.full_name
            ))
        pcap_count_res = await self.session.execute(pcap_query)
        pcap_count = pcap_count_res.scalar_one() or 0

        # Count total IOCs
        ioc_query = select(func.count()).select_from(IOCModel).where(IOCModel.is_deleted == False)
        if user:
            ioc_query = ioc_query.where(or_(
                IOCModel.source_session.in_(
                    select(PcapSessionModel.id).where(or_(PcapSessionModel.uploaded_by == user.email, PcapSessionModel.uploaded_by == user.full_name))
                ),
                IOCModel.case_id.in_(
                    select(EvidenceArtifactModel.case_id).where(EvidenceArtifactModel.owner_investigator_id == user.id)
                ) if user.id else False
            ))
        ioc_count_res = await self.session.execute(ioc_query)
        ioc_count = ioc_count_res.scalar_one() or 0

        threat_level = "Critical" if critical_alerts > 0 else "Elevated" if total_incidents > 0 else "Normal"
        pcap_metrics = await self.get_pcap_metrics(user_id=user_id)
        ioc_metrics = await self.get_ioc_metrics(user_id=user_id)

        return {
            "activeIncidents": total_incidents,
            "criticalAlerts": critical_alerts,
            "pcapsAnalyzed": pcap_count,
            "totalIocsCataloged": ioc_count,
            "threatLevel": threat_level,
            "pcapMetrics": pcap_metrics,
            "iocMetrics": ioc_metrics,
        }

    async def get_pcap_metrics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates real-time database metrics for PCAP analysis sessions, packets, top protocols, and talkers."""
        user = await self._get_user(user_id)

        session_filter = [PcapSessionModel.id.isnot(None)]
        if user:
            session_filter.append(or_(
                PcapSessionModel.uploaded_by == user.email,
                PcapSessionModel.uploaded_by == user.full_name
            ))

        # Total PCAP Sessions
        res_sessions = await self.session.execute(
            select(func.count()).select_from(PcapSessionModel).where(*session_filter)
        )
        total_sessions = res_sessions.scalar_one() or 0

        # Total Packets
        res_packets = await self.session.execute(
            select(func.count()).select_from(PacketModel)
            .join(PcapSessionModel, PacketModel.session_id == PcapSessionModel.id)
            .where(*session_filter)
        )
        total_packets = res_packets.scalar_one() or 0

        # Completed & Failed Sessions
        res_completed = await self.session.execute(
            select(func.count()).select_from(PcapSessionModel).where(PcapSessionModel.status == "Completed", *session_filter)
        )
        completed_analyses = res_completed.scalar_one() or 0

        res_failed = await self.session.execute(
            select(func.count()).select_from(PcapSessionModel).where(PcapSessionModel.status == "Failed", *session_filter)
        )
        failed_analyses = res_failed.scalar_one() or 0

        # Averages
        res_avg_size = await self.session.execute(
            select(func.avg(PacketModel.packet_length))
            .join(PcapSessionModel, PacketModel.session_id == PcapSessionModel.id)
            .where(*session_filter)
        )
        avg_size = round(res_avg_size.scalar_one() or 0.0, 1)

        res_avg_dur = await self.session.execute(
            select(func.avg(PcapSessionModel.duration_seconds)).where(*session_filter)
        )
        avg_duration = round(res_avg_dur.scalar_one() or 0.0, 1)

        # Top Protocols
        res_top_proto = await self.session.execute(
            select(PacketModel.protocol, func.count(PacketModel.id).label("cnt"))
            .join(PcapSessionModel, PacketModel.session_id == PcapSessionModel.id)
            .where(*session_filter)
            .group_by(PacketModel.protocol)
            .order_by(desc("cnt"))
            .limit(5)
        )
        denom = max(1, total_packets)
        top_protocols = [
            {"name": proto, "count": count, "percentage": round((count / denom) * 100.0, 1)}
            for proto, count in res_top_proto.all()
        ]

        # Top Source IPs
        res_top_src = await self.session.execute(
            select(PacketModel.source_ip, func.count(PacketModel.id).label("cnt"))
            .join(PcapSessionModel, PacketModel.session_id == PcapSessionModel.id)
            .where(PacketModel.source_ip != "0.0.0.0", *session_filter)
            .group_by(PacketModel.source_ip)
            .order_by(desc("cnt"))
            .limit(5)
        )
        top_src_ips = [{"ip": ip, "count": count} for ip, count in res_top_src.all()]

        # Top Destination IPs
        res_top_dst = await self.session.execute(
            select(PacketModel.destination_ip, func.count(PacketModel.id).label("cnt"))
            .join(PcapSessionModel, PacketModel.session_id == PcapSessionModel.id)
            .where(PacketModel.destination_ip != "0.0.0.0", *session_filter)
            .group_by(PacketModel.destination_ip)
            .order_by(desc("cnt"))
            .limit(5)
        )
        top_dst_ips = [{"ip": ip, "count": count} for ip, count in res_top_dst.all()]

        # Recent Analyses
        res_recent = await self.session.execute(
            select(
                PcapSessionModel.id,
                PcapSessionModel.filename,
                PcapSessionModel.status,
                PcapSessionModel.packet_count,
                PcapSessionModel.duration_seconds,
                PcapSessionModel.analysis_engine,
                PcapSessionModel.upload_time,
            )
            .where(*session_filter)
            .order_by(PcapSessionModel.created_at.desc())
            .limit(5)
        )
        recent_sessions = res_recent.all()
        recent_analyses = [
            {
                "id": s.id,
                "filename": s.filename,
                "status": s.status,
                "packetCount": s.packet_count,
                "durationSeconds": s.duration_seconds,
                "analysisEngine": s.analysis_engine,
                "uploadTime": s.upload_time,
            }
            for s in recent_sessions
        ]

        return {
            "totalPcapSessions": total_sessions,
            "totalPackets": total_packets,
            "completedAnalyses": completed_analyses,
            "failedAnalyses": failed_analyses,
            "averagePacketSize": avg_size,
            "averageCaptureDuration": avg_duration,
            "topProtocols": top_protocols,
            "topSourceIps": top_src_ips,
            "topDestinationIps": top_dst_ips,
            "recentAnalyses": recent_analyses,
        }

    async def get_ioc_metrics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates real-time database metrics for IOC Intelligence Desk."""
        user = await self._get_user(user_id)
        ioc_filters = [IOCModel.is_deleted == False]
        if user:
            user_session_ids_subq = select(PcapSessionModel.id).where(
                or_(
                    PcapSessionModel.uploaded_by == user.email,
                    PcapSessionModel.uploaded_by == user.full_name
                )
            )
            ioc_filters.append(
                or_(
                    IOCModel.source_session.in_(user_session_ids_subq),
                    IOCModel.deleted_by == user.id
                )
            )

        res_total = await self.session.execute(select(func.count()).select_from(IOCModel).where(*ioc_filters))
        total_iocs = res_total.scalar_one() or 0

        res_critical = await self.session.execute(
            select(func.count()).select_from(IOCModel).where(*ioc_filters, IOCModel.severity == "Critical")
        )
        critical_iocs = res_critical.scalar_one() or 0

        res_high = await self.session.execute(
            select(func.count()).select_from(IOCModel).where(*ioc_filters, IOCModel.severity == "High")
        )
        high_iocs = res_high.scalar_one() or 0

        res_med = await self.session.execute(
            select(func.count()).select_from(IOCModel).where(*ioc_filters, IOCModel.severity == "Medium")
        )
        medium_iocs = res_med.scalar_one() or 0

        res_low = await self.session.execute(
            select(func.count()).select_from(IOCModel).where(*ioc_filters, IOCModel.severity == "Low")
        )
        low_iocs = res_low.scalar_one() or 0

        # Type breakdown
        res_types = await self.session.execute(
            select(IOCModel.type, func.count(IOCModel.id).label("cnt"))
            .where(*ioc_filters)
            .group_by(IOCModel.type)
        )
        ioc_types = {t: c for t, c in res_types.all()}

        # Category breakdown
        res_cats = await self.session.execute(
            select(IOCModel.category, func.count(IOCModel.id).label("cnt"))
            .where(*ioc_filters)
            .group_by(IOCModel.category)
            .order_by(desc("cnt"))
            .limit(5)
        )
        top_categories = [{"category": cat, "count": count} for cat, count in res_cats.all()]

        # Recent IOCs
        res_recent = await self.session.execute(
            select(IOCModel).where(*ioc_filters).order_by(IOCModel.created_at.desc()).limit(5)
        )
        recent_iocs_objs = res_recent.scalars().all()
        recent_iocs = [
            {
                "id": i.id,
                "type": i.type,
                "value": i.value,
                "status": i.status,
                "severity": i.severity,
                "category": i.category,
                "firstSeen": i.first_seen,
            }
            for i in recent_iocs_objs
        ]

        return {
            "totalIocs": total_iocs,
            "criticalIocs": critical_iocs,
            "highSeverityIocs": high_iocs,
            "mediumSeverityIocs": medium_iocs,
            "lowSeverityIocs": low_iocs,
            "iocTypes": ioc_types,
            "topCategories": top_categories,
            "recentIocs": recent_iocs,
        }

    async def get_kill_chain_distribution(self, user_id: Optional[str] = None) -> Dict[str, int]:
        """Calculates Kill Chain stage distribution for current user."""
        user = await self._get_user(user_id)

        inc_query = select(IncidentModel.current_stage, func.count(IncidentModel.id)).where(IncidentModel.is_deleted == False)
        if user:
            user_filters = [
                IncidentModel.assigned_analyst == user.full_name,
                IncidentModel.assigned_analyst == user.email
            ]
            if user.email and "@" in user.email:
                user_filters.append(IncidentModel.assigned_analyst.contains(user.email.split("@")[0]))
            inc_query = inc_query.where(or_(*user_filters))

        result = await self.session.execute(inc_query.group_by(IncidentModel.current_stage))
        distribution = {stage: count for stage, count in result.all()}
        
        all_stages = ["Initial Access", "Execution", "Privilege Escalation", "Lateral Movement", "Impact"]
        for stage in all_stages:
            if stage not in distribution:
                distribution[stage] = 0

        return distribution


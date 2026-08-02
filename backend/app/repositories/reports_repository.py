from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.report import ForensicsReportModel, ReportHistoryModel
from app.repositories.base import BaseRepository


class ReportsRepository(BaseRepository[ForensicsReportModel]):
    """Async repository for DFIR 15-section Forensics Reports."""

    def __init__(self, session: AsyncSession):
        super().__init__(ForensicsReportModel, session)

    async def get_report_details(self, report_id: str) -> Optional[ForensicsReportModel]:
        """Fetch report with history log entries."""
        result = await self.session.execute(
            select(ForensicsReportModel)
            .options(selectinload(ForensicsReportModel.history))
            .where(ForensicsReportModel.id == report_id, ForensicsReportModel.is_deleted == False)
        )
        return result.scalars().first()

    async def list_reports(
        self,
        incident_id: Optional[str] = None,
        case_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ForensicsReportModel]:
        """List active forensics reports."""
        query = select(ForensicsReportModel).options(
            selectinload(ForensicsReportModel.history)
        ).where(ForensicsReportModel.is_deleted == False)

        if incident_id:
            query = query.where(ForensicsReportModel.incident_id == incident_id)
        if case_id:
            query = query.where(ForensicsReportModel.case_id == case_id)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def add_history_entry(self, **history_data) -> ReportHistoryModel:
        """Add history audit record for report."""
        entry = ReportHistoryModel(**history_data)
        self.session.add(entry)
        await self.session.flush()
        await self.session.refresh(entry)
        return entry

    async def soft_delete_report(self, report_id: str, deleted_by: str) -> bool:
        """Soft-delete report preserving audit integrity."""
        report = await self.get_by_id(report_id)
        if report:
            report.is_deleted = True
            report.deleted_at = datetime.now(timezone.utc)
            report.deleted_by = deleted_by
            await self.session.flush()
            return True
        return False

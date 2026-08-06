from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_token, require_permissions
from app.core.security import TokenData, PermissionEnum
from app.schemas.reports import ReportGenerateRequestSchema, ForensicsReportResponse
from app.services.reports.report_service import ReportService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/reports", tags=["Forensics Reports"])


@router.get("", response_model=ResponseEnvelope[List[ForensicsReportResponse]], summary="List Forensics Reports")
async def list_reports(
    incident_id: Optional[str] = Query(None),
    case_id: Optional[str] = Query(None),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Lists generated DFIR forensics reports."""
    report_service = ReportService(db)
    reports = await report_service.list_reports(incident_id=incident_id, case_id=case_id, user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=reports)


@router.post("/generate", response_model=ResponseEnvelope[ForensicsReportResponse], status_code=status.HTTP_201_CREATED, summary="Generate 15-Section Report")
async def generate_report(
    payload: ReportGenerateRequestSchema,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.REPORTS_GENERATE])),
    db: AsyncSession = Depends(get_db)
):
    """Compiles a complete 15-section DFIR executive & technical forensics report."""
    report_service = ReportService(db)
    report = await report_service.generate_report(payload, actor_id=token_data.sub)
    return ResponseEnvelope(success=True, data=report)


@router.get("/{report_id}", response_model=ResponseEnvelope[ForensicsReportResponse], summary="Get Report Details")
async def get_report(
    report_id: str,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Fetches complete 15-section report object."""
    report_service = ReportService(db)
    report = await report_service.get_report_by_id(report_id, user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=report)


@router.get("/{report_id}/pdf", summary="Download DFIR PDF Report")
async def download_report_pdf(
    report_id: str,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Generates and streams a downloadable PDF file for a forensics report."""
    report_service = ReportService(db)
    pdf_bytes = await report_service.generate_report_pdf(report_id, user_id=token_data.sub)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=DFIR_Report_{report_id}.pdf"}
    )


@router.post("/{report_id}/revision", response_model=ResponseEnvelope[ForensicsReportResponse], summary="Create Report Revision")
async def create_revision(
    report_id: str,
    payload: dict,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.REPORTS_GENERATE])),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new report version revision."""
    report_service = ReportService(db)
    revision = await report_service.create_revision(report_id, payload.get("revisionReason", "Updated report findings"), actor_id=token_data.sub)
    return ResponseEnvelope(success=True, data=revision)


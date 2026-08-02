from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_token
from app.core.security import TokenData
from app.utils.file_validation import validate_file_upload, generate_secure_storage_path
from app.services.evidence.hash_service import HashService
from app.services.storage.storage_service import StorageService
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.evidence import EvidenceArtifactResponse, ChainOfCustodyEntrySchema
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/evidence", tags=["Evidence Vault & Custody"])


@router.get("", response_model=ResponseEnvelope[List[EvidenceArtifactResponse]], summary="List Evidence Artifacts")
async def list_evidence(
    category: Optional[str] = None,
    case_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists active evidence artifacts in vault."""
    evidence_repo = EvidenceRepository(db)
    artifacts = await evidence_repo.list_evidence(category=category, case_id=case_id)
    
    responses = [
        EvidenceArtifactResponse(
            id=a.id,
            caseId=a.case_id,
            incidentId=a.incident_id,
            name=a.name,
            category=a.category,
            description=a.description,
            tags=a.tags or [],
            sizeBytes=a.size_bytes,
            hashSha256=a.hash_sha256,
            hashMd5=a.hash_md5,
            uploadedAt=a.uploaded_at,
            uploadedBy=a.uploaded_by,
            storagePath=a.storage_path,
            chainOfCustody=[
                ChainOfCustodyEntrySchema(
                    id=c.id,
                    evidenceId=c.evidence_id,
                    caseId=c.case_id,
                    action=c.action,
                    actor=c.actor,
                    timestamp=c.timestamp,
                    notes=c.notes
                )
                for c in a.chain_of_custody
            ]
        )
        for a in artifacts
    ]
    return ResponseEnvelope(success=True, data=responses)


@router.post("/upload", response_model=ResponseEnvelope[EvidenceArtifactResponse], status_code=status.HTTP_201_CREATED, summary="Upload Evidence Artifact")
async def upload_evidence(
    file: UploadFile = File(...),
    category: str = Form("PCAP Trace"),
    caseId: str = Form("CASE-2026-001"),
    incidentId: str = Form("inc-1"),
    description: Optional[str] = Form(None),
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Uploads forensic evidence artifact, validates extensions/size, computes SHA256/MD5 hashes, and logs custody entry."""
    content = await file.read()
    sanitized_filename, ext = validate_file_upload(file, len(content))
    
    storage_path = generate_secure_storage_path(sanitized_filename, case_id=caseId)
    
    # Calculate SHA256 & MD5
    hashes = HashService.compute_hashes_from_bytes(content)
    
    # Save file
    storage_service = StorageService()
    await storage_service.save_evidence_file(content, storage_path)
    
    async with db.begin():
        evidence_repo = EvidenceRepository(db)
        audit_repo = AuditRepository(db)
        
        artifact = await evidence_repo.create(
            case_id=caseId,
            incident_id=incidentId,
            name=sanitized_filename,
            category=category,
            description=description or "Uploaded forensic evidence artifact.",
            size_bytes=len(content),
            hash_sha256=hashes["sha256"],
            hash_md5=hashes["md5"],
            uploaded_at=datetime.now(timezone.utc).isoformat(),
            uploaded_by="Alex Mercer",
            storage_path=storage_path,
        )
        
        await evidence_repo.add_custody_entry(
            evidence_id=artifact.id,
            case_id=caseId,
            action="Evidence Ingested & Hashed",
            actor="Alex Mercer",
            timestamp=artifact.uploaded_at,
            notes=f"SHA256: {hashes['sha256']}",
        )
        
        await audit_repo.log_event(
            event_type="EVIDENCE_UPLOAD",
            actor_id=token_data.sub or "usr-alex-01",
            action="UPLOAD_EVIDENCE",
            details={"evidence_id": artifact.id, "filename": sanitized_filename, "sha256": hashes["sha256"]},
        )
        
    full_artifact = await evidence_repo.get_evidence_details(artifact.id)
    return ResponseEnvelope(
        success=True,
        data=EvidenceArtifactResponse(
            id=full_artifact.id,
            caseId=full_artifact.case_id,
            incidentId=full_artifact.incident_id,
            name=full_artifact.name,
            category=full_artifact.category,
            description=full_artifact.description,
            tags=full_artifact.tags or [],
            sizeBytes=full_artifact.size_bytes,
            hashSha256=full_artifact.hash_sha256,
            hashMd5=full_artifact.hash_md5,
            uploadedAt=full_artifact.uploaded_at,
            uploadedBy=full_artifact.uploaded_by,
            storagePath=full_artifact.storage_path,
            chainOfCustody=[
                ChainOfCustodyEntrySchema(
                    id=c.id,
                    evidenceId=c.evidence_id,
                    caseId=c.case_id,
                    action=c.action,
                    actor=c.actor,
                    timestamp=c.timestamp,
                    notes=c.notes
                )
                for c in full_artifact.chain_of_custody
            ]
        )
    )


@router.delete("/{evidence_id}", response_model=ResponseEnvelope[dict], summary="Soft Delete Evidence Artifact")
async def delete_evidence(
    evidence_id: str,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Soft deletes evidence artifact while preserving audit logs."""
    async with db.begin():
        evidence_repo = EvidenceRepository(db)
        audit_repo = AuditRepository(db)
        await evidence_repo.soft_delete_evidence(evidence_id, deleted_by=token_data.sub or "usr-alex-01")
        await audit_repo.log_event(
            event_type="EVIDENCE_DELETED",
            actor_id=token_data.sub or "usr-alex-01",
            action="SOFT_DELETE_EVIDENCE",
            details={"evidence_id": evidence_id},
        )
    return ResponseEnvelope(success=True, message="Evidence artifact soft-deleted successfully")

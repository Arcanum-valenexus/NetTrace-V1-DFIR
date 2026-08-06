"""Add missing ORM indexes for foreign keys, status fields, and soft-delete columns across initial schema tables

Revision ID: 005_add_missing_indexes
Revises: 004_fix_schema_drift
Create Date: 2026-08-06 23:59:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '005_add_missing_indexes'
down_revision: Union[str, None] = '004_fix_schema_drift'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. user_sessions
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)

    # 2. login_history
    op.create_index(op.f('ix_login_history_user_id'), 'login_history', ['user_id'], unique=False)

    # 3. user_activities
    op.create_index(op.f('ix_user_activities_user_id'), 'user_activities', ['user_id'], unique=False)

    # 4. cases
    op.create_index(op.f('ix_cases_case_number'), 'cases', ['case_number'], unique=True)
    op.create_index(op.f('ix_cases_status'), 'cases', ['status'], unique=False)
    op.create_index(op.f('ix_cases_is_deleted'), 'cases', ['is_deleted'], unique=False)

    # 5. incidents
    op.create_index(op.f('ix_incidents_incident_number'), 'incidents', ['incident_number'], unique=True)
    op.create_index(op.f('ix_incidents_severity'), 'incidents', ['severity'], unique=False)
    op.create_index(op.f('ix_incidents_status'), 'incidents', ['status'], unique=False)
    op.create_index(op.f('ix_incidents_is_deleted'), 'incidents', ['is_deleted'], unique=False)

    # 6. impacted_assets
    op.create_index(op.f('ix_impacted_assets_incident_id'), 'impacted_assets', ['incident_id'], unique=False)

    # 7. timeline_events
    op.create_index(op.f('ix_timeline_events_incident_id'), 'timeline_events', ['incident_id'], unique=False)

    # 8. analyst_notes
    op.create_index(op.f('ix_analyst_notes_incident_id'), 'analyst_notes', ['incident_id'], unique=False)

    # 9. containment_checklist
    op.create_index(op.f('ix_containment_checklist_incident_id'), 'containment_checklist', ['incident_id'], unique=False)

    # 10. evidence_artifacts
    op.create_index(op.f('ix_evidence_artifacts_case_id'), 'evidence_artifacts', ['case_id'], unique=False)
    op.create_index(op.f('ix_evidence_artifacts_incident_id'), 'evidence_artifacts', ['incident_id'], unique=False)
    op.create_index(op.f('ix_evidence_artifacts_category'), 'evidence_artifacts', ['category'], unique=False)
    op.create_index(op.f('ix_evidence_artifacts_hash_sha256'), 'evidence_artifacts', ['hash_sha256'], unique=False)
    op.create_index(op.f('ix_evidence_artifacts_hash_md5'), 'evidence_artifacts', ['hash_md5'], unique=False)
    op.create_index(op.f('ix_evidence_artifacts_is_deleted'), 'evidence_artifacts', ['is_deleted'], unique=False)

    # 11. chain_of_custody
    op.create_index(op.f('ix_chain_of_custody_evidence_id'), 'chain_of_custody', ['evidence_id'], unique=False)

    # 12. forensics_reports
    op.create_index(op.f('ix_forensics_reports_report_number'), 'forensics_reports', ['report_number'], unique=True)
    op.create_index(op.f('ix_forensics_reports_incident_id'), 'forensics_reports', ['incident_id'], unique=False)
    op.create_index(op.f('ix_forensics_reports_case_id'), 'forensics_reports', ['case_id'], unique=False)
    op.create_index(op.f('ix_forensics_reports_status'), 'forensics_reports', ['status'], unique=False)
    op.create_index(op.f('ix_forensics_reports_is_deleted'), 'forensics_reports', ['is_deleted'], unique=False)

    # 13. report_history
    op.create_index(op.f('ix_report_history_report_id'), 'report_history', ['report_id'], unique=False)

    # 14. audit_logs
    op.create_index(op.f('ix_audit_logs_event_type'), 'audit_logs', ['event_type'], unique=False)
    op.create_index(op.f('ix_audit_logs_actor_id'), 'audit_logs', ['actor_id'], unique=False)

    # 15. platform_settings
    op.create_index(op.f('ix_platform_settings_user_id'), 'platform_settings', ['user_id'], unique=True)


def downgrade() -> None:
    # 15. platform_settings
    op.drop_index(op.f('ix_platform_settings_user_id'), table_name='platform_settings')

    # 14. audit_logs
    op.drop_index(op.f('ix_audit_logs_actor_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_event_type'), table_name='audit_logs')

    # 13. report_history
    op.drop_index(op.f('ix_report_history_report_id'), table_name='report_history')

    # 12. forensics_reports
    op.drop_index(op.f('ix_forensics_reports_is_deleted'), table_name='forensics_reports')
    op.drop_index(op.f('ix_forensics_reports_status'), table_name='forensics_reports')
    op.drop_index(op.f('ix_forensics_reports_case_id'), table_name='forensics_reports')
    op.drop_index(op.f('ix_forensics_reports_incident_id'), table_name='forensics_reports')
    op.drop_index(op.f('ix_forensics_reports_report_number'), table_name='forensics_reports')

    # 11. chain_of_custody
    op.drop_index(op.f('ix_chain_of_custody_evidence_id'), table_name='chain_of_custody')

    # 10. evidence_artifacts
    op.drop_index(op.f('ix_evidence_artifacts_is_deleted'), table_name='evidence_artifacts')
    op.drop_index(op.f('ix_evidence_artifacts_hash_md5'), table_name='evidence_artifacts')
    op.drop_index(op.f('ix_evidence_artifacts_hash_sha256'), table_name='evidence_artifacts')
    op.drop_index(op.f('ix_evidence_artifacts_category'), table_name='evidence_artifacts')
    op.drop_index(op.f('ix_evidence_artifacts_incident_id'), table_name='evidence_artifacts')
    op.drop_index(op.f('ix_evidence_artifacts_case_id'), table_name='evidence_artifacts')

    # 9. containment_checklist
    op.drop_index(op.f('ix_containment_checklist_incident_id'), table_name='containment_checklist')

    # 8. analyst_notes
    op.drop_index(op.f('ix_analyst_notes_incident_id'), table_name='analyst_notes')

    # 7. timeline_events
    op.drop_index(op.f('ix_timeline_events_incident_id'), table_name='timeline_events')

    # 6. impacted_assets
    op.drop_index(op.f('ix_impacted_assets_incident_id'), table_name='impacted_assets')

    # 5. incidents
    op.drop_index(op.f('ix_incidents_is_deleted'), table_name='incidents')
    op.drop_index(op.f('ix_incidents_status'), table_name='incidents')
    op.drop_index(op.f('ix_incidents_severity'), table_name='incidents')
    op.drop_index(op.f('ix_incidents_incident_number'), table_name='incidents')

    # 4. cases
    op.drop_index(op.f('ix_cases_is_deleted'), table_name='cases')
    op.drop_index(op.f('ix_cases_status'), table_name='cases')
    op.drop_index(op.f('ix_cases_case_number'), table_name='cases')

    # 3. user_activities
    op.drop_index(op.f('ix_user_activities_user_id'), table_name='user_activities')

    # 2. login_history
    op.drop_index(op.f('ix_login_history_user_id'), table_name='login_history')

    # 1. user_sessions
    op.drop_index(op.f('ix_user_sessions_user_id'), table_name='user_sessions')

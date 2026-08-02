"""Initial Schema Creation for NetTrace V1.0 Enterprise Backend

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-02 14:38:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('organization', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=100), nullable=False),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('experience_level', sa.String(length=100), nullable=True),
        sa.Column('certifications', sa.JSON(), nullable=True),
        sa.Column('skills', sa.JSON(), nullable=True),
        sa.Column('is_two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('recovery_codes', sa.JSON(), nullable=True),
        sa.Column('is_email_verified', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # 2. User Sessions Table
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('browser', sa.String(length=255), nullable=False),
        sa.Column('device', sa.String(length=255), nullable=False),
        sa.Column('operating_system', sa.String(length=255), nullable=False),
        sa.Column('ip_address', sa.String(length=100), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('login_time', sa.String(length=100), nullable=False),
        sa.Column('last_active', sa.String(length=100), nullable=False),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Login History Table
    op.create_table(
        'login_history',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('date', sa.String(length=50), nullable=False),
        sa.Column('time', sa.String(length=50), nullable=False),
        sa.Column('browser', sa.String(length=255), nullable=False),
        sa.Column('operating_system', sa.String(length=255), nullable=False),
        sa.Column('ip_address', sa.String(length=100), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=100), nullable=False),
        sa.Column('auth_method', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. User Activity Table
    op.create_table(
        'user_activities',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('timestamp', sa.String(length=100), nullable=False),
        sa.Column('ip_address', sa.String(length=100), nullable=False),
        sa.Column('details', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Cases Table
    op.create_table(
        'cases',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.String(length=36), nullable=True),
        sa.Column('case_number', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('case_number')
    )

    # 6. Incidents Table
    op.create_table(
        'incidents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.String(length=36), nullable=True),
        sa.Column('incident_number', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('assigned_analyst', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('attack_vector', sa.Text(), nullable=True),
        sa.Column('current_stage', sa.String(length=100), nullable=False),
        sa.Column('mitre_tactics', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('incident_number')
    )

    # 7. Impacted Assets Table
    op.create_table(
        'impacted_assets',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('incident_id', sa.String(length=36), nullable=False),
        sa.Column('hostname', sa.String(length=255), nullable=False),
        sa.Column('ip_address', sa.String(length=100), nullable=False),
        sa.Column('os', sa.String(length=255), nullable=True),
        sa.Column('mac_address', sa.String(length=100), nullable=True),
        sa.Column('asset_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('owner', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. Timeline Events Table
    op.create_table(
        'timeline_events',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('incident_id', sa.String(length=36), nullable=False),
        sa.Column('timestamp', sa.String(length=100), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('raw_log', sa.Text(), nullable=True),
        sa.Column('associated_iocs', sa.JSON(), nullable=True),
        sa.Column('threat_actor', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 9. Analyst Notes Table
    op.create_table(
        'analyst_notes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('incident_id', sa.String(length=36), nullable=False),
        sa.Column('author', sa.String(length=255), nullable=False),
        sa.Column('timestamp', sa.String(length=100), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 10. Containment Checklist Table
    op.create_table(
        'containment_checklist',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('incident_id', sa.String(length=36), nullable=False),
        sa.Column('task', sa.Text(), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('assigned_to', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 11. Evidence Artifacts Table
    op.create_table(
        'evidence_artifacts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.String(length=36), nullable=True),
        sa.Column('case_id', sa.String(length=100), nullable=False),
        sa.Column('incident_id', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('size_bytes', sa.BigInteger(), nullable=False),
        sa.Column('hash_sha256', sa.String(length=64), nullable=False),
        sa.Column('hash_md5', sa.String(length=32), nullable=False),
        sa.Column('uploaded_at', sa.String(length=100), nullable=False),
        sa.Column('uploaded_by', sa.String(length=255), nullable=False),
        sa.Column('owner_investigator_id', sa.String(length=36), nullable=True),
        sa.Column('owner_investigator_name', sa.String(length=255), nullable=True),
        sa.Column('access_password', sa.String(length=255), nullable=True),
        sa.Column('storage_path', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. Chain of Custody Table
    op.create_table(
        'chain_of_custody',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('evidence_id', sa.String(length=36), nullable=False),
        sa.Column('case_id', sa.String(length=100), nullable=True),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('actor', sa.String(length=255), nullable=False),
        sa.Column('investigator_id', sa.String(length=36), nullable=True),
        sa.Column('investigator_name', sa.String(length=255), nullable=True),
        sa.Column('timestamp', sa.String(length=100), nullable=False),
        sa.Column('notes', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['evidence_id'], ['evidence_artifacts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 13. Forensics Reports Table
    op.create_table(
        'forensics_reports',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.String(length=36), nullable=True),
        sa.Column('report_number', sa.String(length=100), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('revision_reason', sa.Text(), nullable=True),
        sa.Column('revision_date', sa.String(length=100), nullable=True),
        sa.Column('incident_id', sa.String(length=100), nullable=False),
        sa.Column('case_id', sa.String(length=100), nullable=False),
        sa.Column('incident_title', sa.String(length=255), nullable=False),
        sa.Column('generated_at', sa.String(length=100), nullable=False),
        sa.Column('generated_by', sa.String(length=255), nullable=False),
        sa.Column('organization', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('report_hash', sa.String(length=64), nullable=False),
        sa.Column('sections_json', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('report_number')
    )

    # 14. Report History Table
    op.create_table(
        'report_history',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=False),
        sa.Column('event', sa.String(length=100), nullable=False),
        sa.Column('timestamp', sa.String(length=100), nullable=False),
        sa.Column('actor', sa.String(length=255), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['report_id'], ['forensics_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 15. Audit Logs Table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('actor_id', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SUCCESS'),
        sa.Column('details', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 16. Platform Settings Table
    op.create_table(
        'platform_settings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('theme', sa.String(length=50), nullable=False),
        sa.Column('language', sa.String(length=50), nullable=False),
        sa.Column('timezone', sa.String(length=100), nullable=False),
        sa.Column('beginner_mode', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('notification_preferences', sa.JSON(), nullable=False),
        sa.Column('accessibility_preferences', sa.JSON(), nullable=False),
        sa.Column('privacy_preferences', sa.JSON(), nullable=False),
        sa.Column('default_landing_page', sa.String(length=50), nullable=False),
        sa.Column('default_export_format', sa.String(length=50), nullable=False),
        sa.Column('time_format', sa.String(length=50), nullable=False),
        sa.Column('auto_save_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )


def downgrade() -> None:
    op.drop_table('platform_settings')
    op.drop_table('audit_logs')
    op.drop_table('report_history')
    op.drop_table('forensics_reports')
    op.drop_table('chain_of_custody')
    op.drop_table('evidence_artifacts')
    op.drop_table('containment_checklist')
    op.drop_table('analyst_notes')
    op.drop_table('timeline_events')
    op.drop_table('impacted_assets')
    op.drop_table('incidents')
    op.drop_table('cases')
    op.drop_table('user_activities')
    op.drop_table('login_history')
    op.drop_table('user_sessions')
    op.drop_table('users')

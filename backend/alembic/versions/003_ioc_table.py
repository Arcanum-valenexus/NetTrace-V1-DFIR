"""Create IOC Table

Revision ID: 003_ioc_table
Revises: 002_pcap_tables
Create Date: 2026-08-04 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_ioc_table'
down_revision: Union[str, None] = '002_pcap_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'iocs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.String(length=255), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('value', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Active'),
        sa.Column('category', sa.String(length=100), nullable=False, server_default='Network Telemetry'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('source_packet', sa.Integer(), nullable=True),
        sa.Column('source_session', sa.String(length=36), nullable=True),
        sa.Column('evidence_id', sa.String(length=36), nullable=True),
        sa.Column('incident_id', sa.String(length=36), nullable=True),
        sa.Column('case_id', sa.String(length=100), nullable=True),
        sa.Column('severity', sa.String(length=50), nullable=False, server_default='Medium'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.8'),
        sa.Column('first_seen', sa.String(length=100), nullable=False),
        sa.Column('last_seen', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['source_session'], ['pcap_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['evidence_id'], ['evidence_artifacts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_iocs_id'), 'iocs', ['id'], unique=False)
    op.create_index(op.f('ix_iocs_type'), 'iocs', ['type'], unique=False)
    op.create_index(op.f('ix_iocs_value'), 'iocs', ['value'], unique=False)
    op.create_index(op.f('ix_iocs_status'), 'iocs', ['status'], unique=False)
    op.create_index(op.f('ix_iocs_severity'), 'iocs', ['severity'], unique=False)
    op.create_index(op.f('ix_iocs_category'), 'iocs', ['category'], unique=False)
    op.create_index(op.f('ix_iocs_source_session'), 'iocs', ['source_session'], unique=False)
    op.create_index(op.f('ix_iocs_evidence_id'), 'iocs', ['evidence_id'], unique=False)
    op.create_index(op.f('ix_iocs_incident_id'), 'iocs', ['incident_id'], unique=False)
    op.create_index(op.f('ix_iocs_case_id'), 'iocs', ['case_id'], unique=False)


def downgrade() -> None:
    op.drop_table('iocs')

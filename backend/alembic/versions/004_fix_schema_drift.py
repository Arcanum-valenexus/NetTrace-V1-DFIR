"""Fix critical schema drift by adding missing columns to incidents and evidence_artifacts tables

Revision ID: 004_fix_schema_drift
Revises: 003_ioc_table
Create Date: 2026-08-06 23:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '004_fix_schema_drift'
down_revision: Union[str, None] = '003_ioc_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add created_by column and index to incidents table
    op.add_column('incidents', sa.Column('created_by', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_incidents_created_by'), 'incidents', ['created_by'], unique=False)

    # 2. Add 7 forensic analysis columns to evidence_artifacts table
    op.add_column('evidence_artifacts', sa.Column('analysis_status', sa.String(length=50), nullable=True))
    op.add_column('evidence_artifacts', sa.Column('analysis_engine', sa.String(length=100), nullable=True))
    op.add_column('evidence_artifacts', sa.Column('packet_count', sa.BigInteger(), nullable=True))
    op.add_column('evidence_artifacts', sa.Column('capture_duration', sa.Float(), nullable=True))
    op.add_column('evidence_artifacts', sa.Column('top_protocols', sa.JSON(), nullable=True))
    op.add_column('evidence_artifacts', sa.Column('analysis_summary', sa.JSON(), nullable=True))
    op.add_column('evidence_artifacts', sa.Column('analysis_completed_at', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Downgrade evidence_artifacts table columns
    op.drop_column('evidence_artifacts', 'analysis_completed_at')
    op.drop_column('evidence_artifacts', 'analysis_summary')
    op.drop_column('evidence_artifacts', 'top_protocols')
    op.drop_column('evidence_artifacts', 'capture_duration')
    op.drop_column('evidence_artifacts', 'packet_count')
    op.drop_column('evidence_artifacts', 'analysis_engine')
    op.drop_column('evidence_artifacts', 'analysis_status')

    # Downgrade incidents table index and column
    op.drop_index(op.f('ix_incidents_created_by'), table_name='incidents')
    op.drop_column('incidents', 'created_by')

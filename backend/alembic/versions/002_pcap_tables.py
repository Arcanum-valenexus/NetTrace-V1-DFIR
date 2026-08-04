"""Create PCAP Session, Packet, and Extracted File Tables

Revision ID: 002_pcap_tables
Revises: 001_initial_schema
Create Date: 2026-08-04 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_pcap_tables'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Pcap Sessions Table
    op.create_table(
        'pcap_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=False),
        sa.Column('upload_time', sa.String(length=100), nullable=False),
        sa.Column('uploaded_by', sa.String(length=255), nullable=False),
        sa.Column('evidence_id', sa.String(length=36), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Uploaded'),
        sa.Column('analysis_engine', sa.String(length=100), nullable=False, server_default='PyShark / Scapy'),
        sa.Column('packet_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('duration_seconds', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('top_protocols', sa.JSON(), nullable=True),
        sa.Column('analysis_summary', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['evidence_id'], ['evidence_artifacts.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pcap_sessions_id'), 'pcap_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_pcap_sessions_evidence_id'), 'pcap_sessions', ['evidence_id'], unique=False)
    op.create_index(op.f('ix_pcap_sessions_status'), 'pcap_sessions', ['status'], unique=False)

    # 2. Pcap Packets Table
    op.create_table(
        'pcap_packets',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('session_id', sa.String(length=36), nullable=False),
        sa.Column('packet_number', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.String(length=100), nullable=False),
        sa.Column('protocol', sa.String(length=50), nullable=False),
        sa.Column('source_ip', sa.String(length=100), nullable=False),
        sa.Column('destination_ip', sa.String(length=100), nullable=False),
        sa.Column('source_port', sa.Integer(), nullable=True),
        sa.Column('destination_port', sa.Integer(), nullable=True),
        sa.Column('packet_length', sa.Integer(), nullable=False),
        sa.Column('info', sa.Text(), nullable=True),
        sa.Column('tcp_flags', sa.String(length=50), nullable=True),
        sa.Column('payload_hex', sa.Text(), nullable=True),
        sa.Column('payload_ascii', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['pcap_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pcap_packets_id'), 'pcap_packets', ['id'], unique=False)
    op.create_index(op.f('ix_pcap_packets_session_id'), 'pcap_packets', ['session_id'], unique=False)
    op.create_index(op.f('ix_pcap_packets_packet_number'), 'pcap_packets', ['packet_number'], unique=False)
    op.create_index(op.f('ix_pcap_packets_protocol'), 'pcap_packets', ['protocol'], unique=False)
    op.create_index(op.f('ix_pcap_packets_source_ip'), 'pcap_packets', ['source_ip'], unique=False)
    op.create_index(op.f('ix_pcap_packets_destination_ip'), 'pcap_packets', ['destination_ip'], unique=False)

    # 3. Pcap Extracted Files Table
    op.create_table(
        'pcap_extracted_files',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('session_id', sa.String(length=36), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('content_type', sa.String(length=100), nullable=False),
        sa.Column('storage_path', sa.Text(), nullable=False),
        sa.Column('extracted_at', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['pcap_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pcap_extracted_files_id'), 'pcap_extracted_files', ['id'], unique=False)
    op.create_index(op.f('ix_pcap_extracted_files_session_id'), 'pcap_extracted_files', ['session_id'], unique=False)


def downgrade() -> None:
    op.drop_table('pcap_extracted_files')
    op.drop_table('pcap_packets')
    op.drop_table('pcap_sessions')

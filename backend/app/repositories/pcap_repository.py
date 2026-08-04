from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.pcap import PcapSessionModel, PacketModel, PcapExtractedFileModel
from app.repositories.base import BaseRepository


class PcapRepository(BaseRepository[PcapSessionModel]):
    """Async repository for PCAP sessions, packets, and extracted files."""

    def __init__(self, session: AsyncSession):
        super().__init__(PcapSessionModel, session)

    async def create_session(self, **data) -> PcapSessionModel:
        """Instantiate and persist a new PCAP session."""
        return await self.create(**data)

    async def get_session(self, session_id: str) -> Optional[PcapSessionModel]:
        """Fetch single PCAP session by primary key ID."""
        return await self.get_by_id(session_id)

    async def list_sessions(self, skip: int = 0, limit: int = 100) -> List[PcapSessionModel]:
        """List PCAP sessions with offset pagination."""
        return await self.list(skip=skip, limit=limit)

    async def save_packet(self, **data) -> PacketModel:
        """Instantiate and persist a single packet record."""
        packet = PacketModel(**data)
        self.session.add(packet)
        await self.session.flush()
        return packet

    async def bulk_save_packets(self, packets_data: List[dict]) -> None:
        """Bulk instantiate and persist packet records."""
        packet_objs = [PacketModel(**data) for data in packets_data]
        self.session.add_all(packet_objs)
        await self.session.flush()

    async def list_packets(self, session_id: str, skip: int = 0, limit: int = 100) -> List[PacketModel]:
        """List packets associated with a PCAP session."""
        result = await self.session.execute(
            select(PacketModel)
            .where(PacketModel.session_id == session_id)
            .order_by(PacketModel.packet_number.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_packet_by_number(self, session_id: str, packet_number: int) -> Optional[PacketModel]:
        """Fetch single packet by session ID and packet number."""
        result = await self.session.execute(
            select(PacketModel)
            .where(
                PacketModel.session_id == session_id,
                PacketModel.packet_number == packet_number
            )
        )
        return result.scalars().first()

    async def update_status(self, session_id: str, status: str) -> Optional[PcapSessionModel]:
        """Update processing status of a PCAP session."""
        session_obj = await self.get_by_id(session_id)
        if session_obj:
            session_obj.status = status
            await self.session.flush()
            await self.session.refresh(session_obj)
        return session_obj

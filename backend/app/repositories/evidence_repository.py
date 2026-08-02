from sqlalchemy.ext.asyncio import AsyncSession


class EvidenceRepository:
    """Repository placeholder for Evidence file metadata."""
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_sha256(self, hash_val: str):
        pass

from typing import Any, Generic, List, Optional, TypeVar
from app.repositories.base import BaseRepository

RepoType = TypeVar("RepoType", bound=BaseRepository)


class BaseService(Generic[RepoType]):
    """Generic Base Service wrapping database repository logic."""

    def __init__(self, repository: RepoType):
        self.repository = repository

    async def get_by_id(self, id: Any):
        return await self.repository.get_by_id(id)

    async def list_all(self, skip: int = 0, limit: int = 100):
        return await self.repository.list(skip=skip, limit=limit)

    async def create(self, **data: Any):
        return await self.repository.create(**data)

    async def update(self, id: Any, **data: Any):
        instance = await self.repository.get_by_id(id)
        if not instance:
            return None
        return await self.repository.update(instance, **data)

    async def delete(self, id: Any) -> bool:
        instance = await self.repository.get_by_id(id)
        if not instance:
            return False
        await self.repository.delete(instance)
        return True

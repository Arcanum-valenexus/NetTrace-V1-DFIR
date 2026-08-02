from typing import Optional
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, BaseModelMixin, SoftDeleteMixin


class CaseModel(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "cases"

    case_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", index=True)
    priority: Mapped[str] = mapped_column(String(50), default="High")
    created_by: Mapped[str] = mapped_column(String(255), default="Alex Mercer")

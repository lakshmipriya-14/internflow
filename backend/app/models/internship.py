from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Internship(Base):
    """Internship postings available for students to browse and apply to."""

    __tablename__ = "internships"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150), index=True)
    company: Mapped[str] = mapped_column(String(150), index=True)
    location: Mapped[str] = mapped_column(String(120), default="Remote")
    work_mode: Mapped[str] = mapped_column(String(50), default="Remote")  # Remote, Hybrid, Onsite
    stipend_amount: Mapped[str | None] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    required_skills: Mapped[str] = mapped_column(Text)  # Comma-separated
    experience_level: Mapped[str] = mapped_column(String(50), default="All Students")
    deadline: Mapped[str | None] = mapped_column(String(50))
    source_url: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    applications: Mapped[list["Application"]] = relationship(back_populates="internship")

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Application(Base):
    """Tracks a student's internship application lifecycle (Kanban board status)."""

    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    internship_id: Mapped[int | None] = mapped_column(
        ForeignKey("internships.id", ondelete="SET NULL"), nullable=True, index=True
    )

    company_name: Mapped[str] = mapped_column(String(150))
    role_title: Mapped[str] = mapped_column(String(150))
    status: Mapped[str] = mapped_column(String(50), default="saved", index=True)
    # Statuses: saved, applied, screening, interviewing, offered, rejected, withdrawn

    match_score: Mapped[int | None] = mapped_column(Integer, default=0)
    applied_date: Mapped[str | None] = mapped_column(String(50))
    follow_up_date: Mapped[str | None] = mapped_column(String(50))
    notes: Mapped[str | None] = mapped_column(Text)
    tailored_resume_summary: Mapped[str | None] = mapped_column(Text)
    generated_cover_letter: Mapped[str | None] = mapped_column(Text)
    recruiter_email: Mapped[str | None] = mapped_column(String(150))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="applications")
    internship: Mapped["Internship | None"] = relationship(back_populates="applications")

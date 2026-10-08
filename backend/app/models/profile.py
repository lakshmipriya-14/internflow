from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class StudentProfile(Base):
    """Student profile containing education, skills, career preferences, and resume text."""

    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )

    phone: Mapped[str | None] = mapped_column(String(20))
    location: Mapped[str | None] = mapped_column(String(120))
    college: Mapped[str | None] = mapped_column(String(200))
    degree: Mapped[str | None] = mapped_column(String(100))
    department: Mapped[str | None] = mapped_column(String(100))
    current_year: Mapped[int | None]
    graduation_year: Mapped[int | None]
    cgpa: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))

    skills: Mapped[str | None] = mapped_column(Text)  # Comma-separated list of skills
    bio: Mapped[str | None] = mapped_column(Text)
    experience_summary: Mapped[str | None] = mapped_column(Text)
    target_roles: Mapped[str | None] = mapped_column(String(255))
    preferred_locations: Mapped[str | None] = mapped_column(String(255))
    desired_min_stipend: Mapped[int | None]
    resume_text: Mapped[str | None] = mapped_column(Text)

    github_url: Mapped[str | None] = mapped_column(String(255))
    linkedin_url: Mapped[str | None] = mapped_column(String(255))
    portfolio_url: Mapped[str | None] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="profile")

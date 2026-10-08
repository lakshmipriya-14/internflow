from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class InterviewPrep(Base):
    """Stores AI interview questions, user answers, and AI evaluation feedback."""

    __tablename__ = "interview_preps"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(50), default="Technical")  # Technical, Behavioral, System Design, HR
    question: Mapped[str] = mapped_column(Text)
    suggested_answer: Mapped[str] = mapped_column(Text)
    user_answer: Mapped[str | None] = mapped_column(Text)
    ai_score: Mapped[int | None] = mapped_column(Integer)  # 0 to 100
    ai_feedback: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="interview_preps")

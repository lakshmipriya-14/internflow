"""internflow features

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-06
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to student_profiles
    op.add_column("student_profiles", sa.Column("skills", sa.Text(), nullable=True))
    op.add_column("student_profiles", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("student_profiles", sa.Column("experience_summary", sa.Text(), nullable=True))
    op.add_column("student_profiles", sa.Column("target_roles", sa.String(length=255), nullable=True))
    op.add_column("student_profiles", sa.Column("preferred_locations", sa.String(length=255), nullable=True))
    op.add_column("student_profiles", sa.Column("desired_min_stipend", sa.Integer(), nullable=True))
    op.add_column("student_profiles", sa.Column("resume_text", sa.Text(), nullable=True))

    # Create internships table
    op.create_table(
        "internships",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("company", sa.String(length=150), nullable=False),
        sa.Column("location", sa.String(length=120), server_default="Remote", nullable=False),
        sa.Column("work_mode", sa.String(length=50), server_default="Remote", nullable=False),
        sa.Column("stipend_amount", sa.String(length=50), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("required_skills", sa.Text(), nullable=False),
        sa.Column("experience_level", sa.String(length=50), server_default="All Students", nullable=False),
        sa.Column("deadline", sa.String(length=50), nullable=True),
        sa.Column("source_url", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_internships_title", "internships", ["title"], unique=False)
    op.create_index("ix_internships_company", "internships", ["company"], unique=False)

    # Create applications table
    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("internship_id", sa.Integer(), nullable=True),
        sa.Column("company_name", sa.String(length=150), nullable=False),
        sa.Column("role_title", sa.String(length=150), nullable=False),
        sa.Column("status", sa.String(length=50), server_default="saved", nullable=False),
        sa.Column("match_score", sa.Integer(), server_default="0", nullable=True),
        sa.Column("applied_date", sa.String(length=50), nullable=True),
        sa.Column("follow_up_date", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("tailored_resume_summary", sa.Text(), nullable=True),
        sa.Column("generated_cover_letter", sa.Text(), nullable=True),
        sa.Column("recruiter_email", sa.String(length=150), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["internship_id"], ["internships.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_applications_user_id", "applications", ["user_id"], unique=False)
    op.create_index("ix_applications_internship_id", "applications", ["internship_id"], unique=False)
    op.create_index("ix_applications_status", "applications", ["status"], unique=False)

    # Create interview_preps table
    op.create_table(
        "interview_preps",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=50), server_default="Technical", nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("suggested_answer", sa.Text(), nullable=False),
        sa.Column("user_answer", sa.Text(), nullable=True),
        sa.Column("ai_score", sa.Integer(), nullable=True),
        sa.Column("ai_feedback", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interview_preps_user_id", "interview_preps", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("interview_preps")
    op.drop_table("applications")
    op.drop_table("internships")
    op.drop_column("student_profiles", "resume_text")
    op.drop_column("student_profiles", "desired_min_stipend")
    op.drop_column("student_profiles", "preferred_locations")
    op.drop_column("student_profiles", "target_roles")
    op.drop_column("student_profiles", "experience_summary")
    op.drop_column("student_profiles", "bio")
    op.drop_column("student_profiles", "skills")

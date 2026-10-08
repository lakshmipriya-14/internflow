from io import BytesIO

from docx import Document
from fastapi import APIRouter, File, HTTPException, UploadFile
from pypdf import PdfReader
from app.core.deps import CurrentUser, DbSession
from app.schemas.profile import ProfileResponse, ProfileUpdate, ResumeParseRequest, ResumeParseResponse
from app.services import profile_service, ai_service

router = APIRouter(prefix="/profile", tags=["Student Profile"])
MAX_RESUME_SIZE = 5 * 1024 * 1024


def _extract_resume_text(filename: str, content: bytes) -> str:
    suffix = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    try:
        if suffix == "pdf":
            text = "\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(content)).pages)
        elif suffix == "docx":
            document = Document(BytesIO(content))
            parts = [paragraph.text for paragraph in document.paragraphs]
            parts.extend(
                " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                for table in document.tables
                for row in table.rows
            )
            text = "\n".join(parts)
        elif suffix in {"txt", "md"}:
            text = content.decode("utf-8-sig")
        else:
            raise HTTPException(status_code=415, detail="Upload a PDF, DOCX, TXT, or Markdown resume.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read this resume file. Check that it is a valid, non-password-protected document.") from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text was found. Try a text-based PDF or paste the resume text.")
    if len(text) > 100_000:
        raise HTTPException(status_code=413, detail="Extracted resume text must be 100,000 characters or fewer.")
    return text.strip()


def _save_parsed_resume(db, user_id: int, resume_text: str):
    result = ai_service.parse_resume_text(resume_text)
    profile_service.update_profile(
        db,
        user_id,
        ProfileUpdate(
            resume_text=resume_text,
            skills=", ".join(result["extracted_skills"]) or None,
            bio=result["suggested_bio"],
            target_roles=", ".join(result["suggested_roles"]) or None
        )
    )
    return result


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: CurrentUser, db: DbSession):
    """Retrieve current student profile."""
    return profile_service.get_profile_by_user_id(db, current_user.id)


@router.put("", response_model=ProfileResponse)
def update_profile(payload: ProfileUpdate, current_user: CurrentUser, db: DbSession):
    """Update current student profile details."""
    return profile_service.update_profile(db, current_user.id, payload)


@router.post("/parse-resume", response_model=ResumeParseResponse)
def parse_resume(payload: ResumeParseRequest, current_user: CurrentUser, db: DbSession):
    """Parse resume text and automatically extract skills and suggested bio/roles."""
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    return _save_parsed_resume(db, current_user.id, payload.resume_text.strip())


@router.post("/upload-resume")
async def upload_resume(current_user: CurrentUser, db: DbSession, file: UploadFile = File(...)):
    """Extract, parse, and save a user's uploaded PDF, DOCX, or text resume."""
    content = await file.read(MAX_RESUME_SIZE + 1)
    if len(content) > MAX_RESUME_SIZE:
        raise HTTPException(status_code=413, detail="Resume file must be 5 MB or smaller.")
    resume_text = _extract_resume_text(file.filename or "", content)
    result = _save_parsed_resume(db, current_user.id, resume_text)
    return {**result, "resume_text": resume_text}

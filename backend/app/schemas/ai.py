from pydantic import BaseModel


class MatchScoreRequest(BaseModel):
    internship_id: int | None = None
    job_description: str | None = None
    required_skills: str | None = None


class MatchScoreResponse(BaseModel):
    match_score: int
    matching_skills: list[str]
    missing_skills: list[str]
    recommendation: str


class CoverLetterRequest(BaseModel):
    company_name: str
    role_title: str
    job_description: str | None = None
    tone: str = "Professional"  # Professional, Enthusiastic, Startup/Bold, Conversational


class CoverLetterResponse(BaseModel):
    cover_letter: str
    key_highlights: list[str]


class ColdEmailRequest(BaseModel):
    recruiter_name: str | None = "Hiring Manager"
    company_name: str
    role_title: str
    tone: str = "Professional"


class ColdEmailResponse(BaseModel):
    subject_line: str
    email_body: str


class InterviewPrepGenRequest(BaseModel):
    role_title: str
    category: str = "Technical"  # Technical, Behavioral, System Design, HR
    count: int = 3


class QuestionItem(BaseModel):
    question: str
    category: str
    suggested_answer: str


class InterviewPrepGenResponse(BaseModel):
    role_title: str
    questions: list[QuestionItem]


class InterviewPrepEvalRequest(BaseModel):
    question: str
    category: str = "Technical"
    user_answer: str
    role_title: str = "Software Engineer Intern"


class InterviewPrepEvalResponse(BaseModel):
    score: int  # 0 to 100
    strengths: list[str]
    improvements: list[str]
    feedback_summary: str


class TailoredResumeRequest(BaseModel):
    company_name: str | None = None
    role_title: str | None = None
    target_skills: str | None = None


class TailoredResumeResponse(BaseModel):
    candidate_name: str
    target_role: str
    target_company: str
    matching_skills_highlighted: list[str]
    match_score: int
    resume_markdown: str

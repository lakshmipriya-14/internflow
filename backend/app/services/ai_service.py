import re
from typing import Any
from app.models.profile import StudentProfile
from app.models.internship import Internship

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "SQL",
    "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "Git", "GitHub", "AWS",
    "C++", "Java", "HTML", "CSS", "TailwindCSS", "REST APIs", "GraphQL", "PyTorch",
    "TensorFlow", "Machine Learning", "Data Analysis", "Pandas", "NumPy", "Scikit-Learn",
    "Linux", "CI/CD", "Agile", "System Design", "UI/UX", "Figma", "Redux", "Express",
    "Spring Boot", "Go", "Rust", "Microservices", "NLP", "OpenCV", "Vue.js", "Angular"
]


def extract_skills_from_text(text: str) -> list[str]:
    """Extracts known tech skills from raw text using regex matching."""
    if not text:
        return []
    found = set()
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)
    return sorted(list(found))


def parse_resume_text(resume_text: str) -> dict[str, Any]:
    """Parses resume text into structured summary, skills, and target roles."""
    skills = extract_skills_from_text(resume_text)
    word_count = len(resume_text.split())
    
    suggested_bio = (
        f"Technical skills identified in your resume: {', '.join(skills[:4])}."
        if skills else "Resume uploaded. Add a short summary of your background."
    )
    
    suggested_roles = []
    if any(s in skills for s in ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Vue.js"]):
        suggested_roles.append("Frontend Developer Intern")
    if any(s in skills for s in ["Python", "FastAPI", "Node.js", "SQL", "PostgreSQL", "Java", "C++"]):
        suggested_roles.append("Backend Developer Intern")
    if any(s in skills for s in ["PyTorch", "TensorFlow", "Machine Learning", "Pandas", "NLP"]):
        suggested_roles.append("AI / ML Engineer Intern")
    if not suggested_roles:
        suggested_roles = ["Software Engineer Intern", "Technology Intern"]
        
    return {
        "extracted_skills": skills,
        "suggested_bio": suggested_bio,
        "suggested_roles": suggested_roles,
        "word_count": word_count,
    }


def calculate_match_score(user_skills_str: str | None, required_skills_str: str | None, job_description: str | None = None) -> dict[str, Any]:
    """Calculates match score percentage (0-100), matching skills, and missing skills."""
    if not user_skills_str:
        user_skills = set()
    else:
        user_skills = {s.strip().lower() for s in user_skills_str.split(",") if s.strip()}

    if not required_skills_str:
        required_skills = set()
    else:
        required_skills = {s.strip().lower() for s in required_skills_str.split(",") if s.strip()}

    if job_description:
        desc_skills = {s.lower() for s in extract_skills_from_text(job_description)}
        required_skills.update(desc_skills)

    if not required_skills:
        return {
            "match_score": 75,
            "matching_skills": list(user_skills),
            "missing_skills": [],
            "recommendation": "Strong candidate. Skills match standard internship prerequisites."
        }

    matching = user_skills.intersection(required_skills)
    missing = required_skills - user_skills

    match_percentage = int((len(matching) / len(required_skills)) * 100) if required_skills else 80
    match_percentage = min(100, max(20, match_percentage))

    if match_percentage >= 80:
        recommendation = "Excellent Match! Your profile closely aligns with this internship requirements. Apply right away!"
    elif match_percentage >= 50:
        recommendation = f"Good Match. Consider highlighting your {', '.join([s.title() for s in list(matching)[:3]])} experience in your application."
    else:
        missing_titles = [s.title() for s in list(missing)[:3]]
        recommendation = f"Skill Gap Identified. Learn or feature {', '.join(missing_titles)} to boost your eligibility."

    return {
        "match_score": match_percentage,
        "matching_skills": sorted([s.title() for s in matching]),
        "missing_skills": sorted([s.title() for s in missing]),
        "recommendation": recommendation
    }


def _resume_evidence(profile: StudentProfile, limit: int = 3) -> list[str]:
    skills = [skill.strip().lower() for skill in (profile.skills or "").split(",") if skill.strip()]
    evidence = []
    for raw_line in (profile.resume_text or "").splitlines():
        line = re.sub(r"^\s*[-*•\d.)]+\s*", "", raw_line).strip()
        lowered = line.lower()
        if len(line) < 25 or len(line) > 300:
            continue
        if any(marker in lowered for marker in ["@", "http://", "https://", "phone:", "email:", "linkedin:", "github:"]):
            continue
        if any(skill in lowered for skill in skills) or any(
            marker in lowered for marker in ["built", "developed", "implemented", "designed", "project", "experience", "research"]
        ):
            evidence.append(line)
        if len(evidence) == limit:
            break
    return evidence


def generate_cover_letter(profile: StudentProfile, company_name: str, role_title: str, tone: str = "Professional") -> dict[str, Any]:
    student_name = profile.user.full_name if profile.user else "Student"
    skills = profile.skills.strip()
    education = " ".join(part for part in [profile.degree, profile.college] if part)
    greeting = "Dear Hiring Manager,"
    if tone.lower() == "enthusiastic":
        greeting = "Dear Hiring Manager,\n\nI am excited to apply"
        opening = f" for the {role_title} internship at {company_name}."
    elif tone.lower() == "startup/bold":
        opening = f"I'm applying for the {role_title} internship at {company_name}."
    else:
        opening = f"I am writing to apply for the {role_title} internship at {company_name}."

    paragraphs = [f"{greeting}{opening}"]
    if education:
        paragraphs.append(f"My academic background is in {education}.")
    paragraphs.append(f"My technical skills include {skills}.")
    if profile.experience_summary and profile.experience_summary.strip():
        paragraphs.append(f"Relevant project and experience details from my profile: {profile.experience_summary.strip()}")
    else:
        evidence = _resume_evidence(profile)
        if evidence:
            paragraphs.append("Relevant details from my resume include:\n" + "\n".join(f"- {item}" for item in evidence))
        elif profile.bio and profile.bio.strip():
            paragraphs.append(profile.bio.strip())
        else:
            paragraphs.append("I have included my resume with further details about my background.")
    paragraphs.append(
        f"Thank you for considering my application. I would welcome the opportunity to discuss how my background relates to the {role_title} internship."
    )
    paragraphs.append(f"Sincerely,\n{student_name}")
    body = "\n\n".join(paragraphs)

    return {
        "cover_letter": body,
        "key_highlights": [
            f"Profile skills: {skills}",
            f"Tailored for {role_title} at {company_name}",
            f"Tone style: {tone}"
        ]
    }


def generate_cold_email(profile: StudentProfile, recruiter_name: str, company_name: str, role_title: str, tone: str = "Professional") -> dict[str, Any]:
    student_name = profile.user.full_name if profile.user else "Student"
    skills = profile.skills.strip()
    recruiter = recruiter_name or "Hiring Manager"

    subject = f"Application Inquiry: {role_title} Internship - {student_name}"
    education = " ".join(part for part in [profile.degree, profile.college] if part)
    student_details = f"I am {student_name}"
    if education:
        student_details += f", with an academic background in {education}"
    student_details += f". My technical skills include {skills}."
    experience = (
        f"\n\nRelevant project and experience details from my profile: {profile.experience_summary.strip()}"
        if profile.experience_summary and profile.experience_summary.strip()
        else ""
    )
    if not experience:
        evidence = _resume_evidence(profile, limit=2)
        if evidence:
            experience = "\n\nRelevant details from my resume:\n" + "\n".join(f"- {item}" for item in evidence)
    links = "\n".join(
        f"{label}: {url}"
        for label, url in [("LinkedIn", profile.linkedin_url), ("GitHub", profile.github_url)]
        if url
    )
    links_section = f"\n{links}" if links else ""
    body = (
        f"Hi {recruiter},\n\n"
        f"I'm reaching out about the {role_title} internship at {company_name}. "
        f"{student_details}{experience}\n\n"
        f"I've included my resume for additional information. Thank you for your time.\n\n"
        f"Best regards,\n{student_name}"
        f"{links_section}"
    )

    return {
        "subject_line": subject,
        "email_body": body
    }


def generate_interview_questions(role_title: str, category: str = "Technical", count: int = 3) -> list[dict[str, str]]:
    role_lower = role_title.lower()
    
    technical_bank = [
        {
            "question": f"Explain how you would design a RESTful API service for a key feature in a {role_title} project.",
            "category": "Technical",
            "suggested_answer": "Use HTTP verbs (GET, POST, PUT, DELETE), clean URI structure, proper status codes (200, 201, 400, 404, 500), input validation via Pydantic/DTOs, and JWT authentication middleware."
        },
        {
            "question": "What is the difference between synchronous and asynchronous execution in web applications?",
            "category": "Technical",
            "suggested_answer": "Synchronous code blocks thread execution until task completes. Asynchronous code allows non-blocking I/O operations using event loops (async/await), maximizing throughput."
        },
        {
            "question": "How do you handle error handling and database transactions in modern web frameworks?",
            "category": "Technical",
            "suggested_answer": "Use try-except/try-catch blocks with explicit rollback on error, atomicity for multi-step database writes, structured error logging, and user-friendly error responses."
        },
        {
            "question": "Walk me through how you optimize database queries or frontend render performance.",
            "category": "Technical",
            "suggested_answer": "For DB: Add indexes on foreign keys/frequently filtered columns, avoid N+1 queries using joins/eager loading. For Frontend: Component memoization, lazy loading, debouncing API inputs."
        }
    ]

    behavioral_bank = [
        {
            "question": "Describe a difficult bug or technical challenge you faced in a project and how you resolved it.",
            "category": "Behavioral",
            "suggested_answer": "Structure using STAR method (Situation, Task, Action, Result). Highlight how you diagnosed the root cause using logs, reproduced the issue, and verified the fix with automated tests."
        },
        {
            "question": "Tell me about a time you had to learn a new framework or technology under a tight deadline.",
            "category": "Behavioral",
            "suggested_answer": "Discuss prioritizing core documentation, building a minimal working prototype, asking targeted team questions, and delivering working functionality on time."
        },
        {
            "question": "How do you handle feedback or code review requests that require significant changes?",
            "category": "Behavioral",
            "suggested_answer": "Demonstrate growth mindset: appreciate constructive feedback, ask clarifying questions on architectural decisions, iterate code promptly, and document learnings."
        }
    ]

    if category.lower() == "behavioral":
        return behavioral_bank[:count]
    return technical_bank[:count]


def evaluate_interview_answer(question: str, user_answer: str) -> dict[str, Any]:
    if not user_answer or len(user_answer.strip()) < 15:
        return {
            "score": 35,
            "strengths": ["Attempted to provide an answer"],
            "improvements": ["Answer is too brief. Provide more specific technical details and examples."],
            "feedback_summary": "Your response needs more depth. Use the STAR framework (Situation, Task, Action, Result) or explain specific technical concepts in detail."
        }

    length = len(user_answer.split())
    keywords_found = [word for word in ["used", "built", "implemented", "resolved", "api", "database", "tested", "optimized", "team", "learned"] if word in user_answer.lower()]
    
    score = 65 + min(25, length // 4) + (len(keywords_found) * 2)
    score = min(95, max(40, score))

    strengths = [
        "Clear explanation of approach",
        f"Included relevant technical context ({', '.join(keywords_found[:3]) if keywords_found else 'problem solving'})",
        "Demonstrated practical hands-on understanding"
    ]

    improvements = [
        "Include quantitative metrics where possible (e.g., improved speed by 30%, handled 100+ requests)",
        "Elaborate slightly more on error handling or edge cases faced during execution"
    ]

    return {
        "score": score,
        "strengths": strengths,
        "improvements": improvements,
        "feedback_summary": f"Solid answer! Score: {score}/100. Good use of technical concepts. Adding quantifiable metrics will elevate your answer to top-tier candidate level."
    }


def generate_tailored_resume(
    profile: StudentProfile,
    company_name: str | None = None,
    role_title: str | None = None,
    target_skills: str | None = None
) -> dict[str, Any]:
    """Tailor the presentation of verified profile details without inventing resume entries."""
    name = profile.user.full_name if profile.user else "Student"
    contact = [profile.location, profile.user.email if profile.user else None, profile.phone]
    contact_line = " | ".join(value.strip() for value in contact if value and value.strip())
    user_skills = profile.skills.strip()
    target_company = company_name or "Target Company"
    target_role = role_title or profile.target_roles or "Software Engineering Intern"
    matched = calculate_match_score(user_skills, target_skills)
    sections = [f"# {name.upper()}"]
    if contact_line:
        sections.append(contact_line)
    sections.append(f"## Internship Focus\n{target_role} at {target_company}")
    if matched["matching_skills"]:
        sections.append(f"## Relevant Profile Skills\n{', '.join(matched['matching_skills'])}")
    else:
        sections.append(f"## Technical Skills\n{user_skills}")
    if profile.bio and profile.bio.strip():
        sections.append(f"## Profile Summary\n{profile.bio.strip()}")
    if profile.experience_summary and profile.experience_summary.strip():
        sections.append(f"## Project / Experience Details\n{profile.experience_summary.strip()}")
    education = " — ".join(part for part in [profile.degree, profile.college] if part)
    if education:
        sections.append(f"## Education\n{education}")
    sections.append(f"## Resume Provided by Candidate\n{profile.resume_text.strip()}")
    resume_markdown = "\n\n".join(sections)

    return {
        "candidate_name": name,
        "target_role": target_role,
        "target_company": target_company,
        "matching_skills_highlighted": matched["matching_skills"],
        "match_score": matched["match_score"],
        "resume_markdown": resume_markdown.strip()
    }

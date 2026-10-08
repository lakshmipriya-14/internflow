from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.internship import Internship
from app.schemas.internship import InternshipCreate


DEFAULT_INTERNSHIPS = [
    {
        "title": "Software Engineer Intern (Full Stack)",
        "company": "TechFlow Inc.",
        "location": "Bangalore / Remote",
        "work_mode": "Remote",
        "stipend_amount": "₹35,000/month",
        "description": "Join our fast-paced core platform team. You will build user-facing React interfaces, write clean FastAPI endpoints, and optimize PostgreSQL queries for scale.",
        "required_skills": "Python, React, FastAPI, SQL, PostgreSQL, Git",
        "experience_level": "Pre-final / Final Year",
        "deadline": "2026-11-15",
        "source_url": "https://careers.techflow.io/internships/sde-2026"
    },
    {
        "title": "AI / Machine Learning Engineer Intern",
        "company": "NeuralMind Systems",
        "location": "Hyderabad / Hybrid",
        "work_mode": "Hybrid",
        "stipend_amount": "₹45,000/month",
        "description": "Work on fine-tuning Large Language Models, LLM agent workflows, vector search (FAISS/Pinecone), and Python backend integration.",
        "required_skills": "Python, PyTorch, Machine Learning, NLP, FastAPI, Docker",
        "experience_level": "All Students",
        "deadline": "2026-11-30",
        "source_url": "https://neuralmind.ai/careers/ml-intern"
    },
    {
        "title": "Frontend Developer Intern",
        "company": "DesignCraft Labs",
        "location": "Remote",
        "work_mode": "Remote",
        "stipend_amount": "₹30,000/month",
        "description": "Build stunning, responsive, and animated user web experiences using TypeScript, React, TailwindCSS, and modern state management.",
        "required_skills": "React, TypeScript, JavaScript, HTML, CSS, TailwindCSS, Figma",
        "experience_level": "Pre-final / Final Year",
        "deadline": "2026-11-10",
        "source_url": "https://designcraft.dev/jobs/frontend-intern"
    },
    {
        "title": "Backend Engineering Intern",
        "company": "DataCloud Infrastructure",
        "location": "Pune / Onsite",
        "work_mode": "Onsite",
        "stipend_amount": "₹40,000/month",
        "description": "Design high-performance microservices, REST APIs, and database schemas using Go, Python, PostgreSQL, and Docker container orchestration.",
        "required_skills": "Python, Go, SQL, PostgreSQL, Docker, REST APIs, Linux",
        "experience_level": "Final Year",
        "deadline": "2026-12-05",
        "source_url": "https://datacloud.io/careers/backend-intern"
    },
    {
        "title": "Data Analyst / Science Intern",
        "company": "Apex Analytics",
        "location": "Remote",
        "work_mode": "Remote",
        "stipend_amount": "₹28,000/month",
        "description": "Perform data wrangling, SQL queries, dashboard visualizations, and predictive modeling for consumer growth metrics.",
        "required_skills": "Python, SQL, Pandas, NumPy, Data Analysis, Scikit-Learn",
        "experience_level": "All Students",
        "deadline": "2026-11-20",
        "source_url": "https://apexanalytics.com/internships"
    }
]


def seed_default_internships_if_empty(db: Session):
    count = db.query(Internship).count()
    if count == 0:
        for data in DEFAULT_INTERNSHIPS:
            internship = Internship(**data)
            db.add(internship)
        db.commit()


def get_internships(
    db: Session,
    query: str | None = None,
    work_mode: str | None = None,
    skill: str | None = None,
    limit: int = 50
) -> list[Internship]:
    seed_default_internships_if_empty(db)
    q = db.query(Internship).filter(Internship.is_active == True)

    if query:
        term = f"%{query}%"
        q = q.filter(
            or_(
                Internship.title.ilike(term),
                Internship.company.ilike(term),
                Internship.description.ilike(term)
            )
        )
    if work_mode and work_mode.lower() != "all":
        q = q.filter(Internship.work_mode.ilike(f"%{work_mode}%"))
    if skill:
        q = q.filter(Internship.required_skills.ilike(f"%{skill}%"))

    return q.order_by(Internship.created_at.desc()).limit(limit).all()


def get_internship_by_id(db: Session, internship_id: int) -> Internship | None:
    return db.get(Internship, internship_id)


def create_internship(db: Session, payload: InternshipCreate) -> Internship:
    internship = Internship(**payload.model_dump())
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship

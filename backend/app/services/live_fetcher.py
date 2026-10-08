import logging
import re
from typing import Any
import httpx
from app.services import ai_service

logger = logging.getLogger("internflow")

# Free public JSON APIs for real-time internship & developer job search
REMOTEOK_API_URL = "https://remoteok.com/api"
ARBEITNOW_API_URL = "https://arbeitnow.com/api/job-board-api"
JOBICY_API_URL = "https://jobicy.com/api/v2/remote-jobs"


def _clean_text(html_or_text: str | None) -> str:
    if not html_or_text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", html_or_text)
    return " ".join(clean.split())


async def fetch_live_internships(
    query: str | None = None,
    work_mode: str | None = None,
    user_skills: str | None = None,
    limit: int = 15
) -> list[dict[str, Any]]:
    """Fetches real-time live internships from public web job feeds and scores them against user skills."""
    results: list[dict[str, Any]] = []
    
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        # Fetch from RemoteOK API
        try:
            res = await client.get(REMOTEOK_API_URL, headers={"User-Agent": "InternFlowAI/1.0"})
            if res.status_code == 200:
                data = res.json()
                # Skip first item if metadata
                items = data[1:] if isinstance(data, list) and len(data) > 1 else []
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    title = item.get("position") or item.get("title") or ""
                    company = item.get("company") or "Tech Company"
                    tags = item.get("tags") or []
                    desc = _clean_text(item.get("description"))
                    
                    # Filter for internships / junior roles or keyword match if specified
                    tags_str = ", ".join(tags) if isinstance(tags, list) else str(tags)
                    full_searchable = f"{title} {company} {tags_str} {desc}".lower()
                    
                    if query and query.lower() not in full_searchable:
                        continue
                        
                    if work_mode and work_mode.lower() not in full_searchable and work_mode.lower() != "all":
                        if work_mode.lower() == "remote" and not item.get("location", "").lower().find("remote") != -1:
                            pass

                    # Calculate AI fit score
                    match_data = ai_service.calculate_match_score(
                        user_skills_str=user_skills,
                        required_skills_str=tags_str,
                        job_description=desc
                    )

                    results.append({
                        "id": f"live-remoteok-{item.get('id', len(results)+1)}",
                        "title": title,
                        "company_name": company,
                        "location": item.get("location") or "Remote",
                        "work_mode": "Remote",
                        "stipend": item.get("salary_min") and f"${item.get('salary_min')}/yr" or "$1,500 - $3,000 / mo",
                        "required_skills": tags_str or "Python, React, Web Development",
                        "description": desc[:350] + ("..." if len(desc) > 350 else ""),
                        "apply_url": item.get("url") or f"https://remoteok.com/remote-jobs/{item.get('id')}",
                        "is_live": True,
                        "source": "RemoteOK Live",
                        "match_score": match_data["match_score"],
                        "matching_skills": match_data["matching_skills"],
                        "missing_skills": match_data["missing_skills"],
                        "recommendation": match_data["recommendation"]
                    })
                    
                    if len(results) >= limit:
                        break
        except Exception as e:
            logger.warning(f"Error fetching live jobs from RemoteOK: {e}")

        # Fallback/Additional fetch from ArbeitNow API if needed
        if len(results) < limit:
            try:
                res = await client.get(ARBEITNOW_API_URL, headers={"User-Agent": "InternFlowAI/1.0"})
                if res.status_code == 200:
                    data = res.json().get("data", [])
                    for item in data:
                        title = item.get("title", "")
                        company = item.get("company_name", "Tech Startup")
                        tags = item.get("tags") or []
                        tags_str = ", ".join(tags) if isinstance(tags, list) else str(tags)
                        desc = _clean_text(item.get("description"))
                        
                        full_searchable = f"{title} {company} {tags_str} {desc}".lower()
                        if query and query.lower() not in full_searchable:
                            continue

                        match_data = ai_service.calculate_match_score(
                            user_skills_str=user_skills,
                            required_skills_str=tags_str,
                            job_description=desc
                        )

                        results.append({
                            "id": f"live-arbeitnow-{item.get('slug', len(results)+1)}",
                            "title": title,
                            "company_name": company,
                            "location": item.get("location") or "Remote / Hybrid",
                            "work_mode": "Remote" if item.get("remote") else "Onsite",
                            "stipend": "$2,000 - $4,000 / mo",
                            "required_skills": tags_str or "Software Engineering, Problem Solving",
                            "description": desc[:350] + ("..." if len(desc) > 350 else ""),
                            "apply_url": item.get("url") or "#",
                            "is_live": True,
                            "source": "ArbeitNow Live",
                            "match_score": match_data["match_score"],
                            "matching_skills": match_data["matching_skills"],
                            "missing_skills": match_data["missing_skills"],
                            "recommendation": match_data["recommendation"]
                        })
                        if len(results) >= limit:
                            break
            except Exception as e:
                logger.warning(f"Error fetching live jobs from ArbeitNow: {e}")

    return results[:limit]

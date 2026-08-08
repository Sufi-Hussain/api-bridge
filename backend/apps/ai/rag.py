from __future__ import annotations

from .models import AIDocument, AIDocumentChunk


def chunk_text(text: str, size: int = 1200, overlap: int = 120) -> list[str]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []
    return [cleaned[start : start + size] for start in range(0, len(cleaned), max(1, size - overlap))]


def ingest_document(*, organization, name: str, text: str, source: str = "") -> AIDocument:
    document = AIDocument.objects.create(organization=organization, name=name[:255], source=source[:500])
    AIDocumentChunk.objects.bulk_create([
        AIDocumentChunk(document=document, content=chunk, metadata={"source": source})
        for chunk in chunk_text(text)
    ])
    return document


def retrieve(*, organization, query: str, limit: int = 5) -> list[dict[str, str]]:
    terms = [term for term in query.lower().split() if len(term) > 2][:8]
    if not terms:
        return []
    chunks = AIDocumentChunk.objects.filter(document__organization=organization)
    scored = []
    for chunk in chunks[:500]:
        score = sum(term in chunk.content.lower() for term in terms)
        if score:
            scored.append((score, chunk))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [{"content": chunk.content, "source": chunk.document.source or chunk.document.name} for _, chunk in scored[:limit]]

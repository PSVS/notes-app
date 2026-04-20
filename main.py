import sqlite3
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Note App API")
DATABASE = "notes.db"

class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1)
    tags: Optional[List[str]] = Field(default_factory=list)

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[List[str]] = None

class Note(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

def row_to_note(row: sqlite3.Row) -> Note:
    return Note(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        tags=row["tags"].split(",") if row["tags"] else [],
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
    )

@app.post("/notes", response_model=Note, status_code=201)
def create_note(note: NoteCreate):
    now = datetime.utcnow().isoformat()
    tags = ",".join(note.tags)

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO notes (title, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (note.title, note.content, tags, now, now),
    )
    conn.commit()
    note_id = cursor.lastrowid
    conn.close()

    return get_note(note_id)

@app.get("/notes", response_model=List[Note])
def list_notes():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM notes ORDER BY updated_at DESC").fetchall()
    conn.close()
    return [row_to_note(row) for row in rows]

@app.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return row_to_note(row)

@app.put("/notes/{note_id}", response_model=Note)
def update_note(note_id: int, note: NoteUpdate):
    existing = get_note(note_id)
    updated_data = {
        "title": note.title if note.title is not None else existing.title,
        "content": note.content if note.content is not None else existing.content,
        "tags": note.tags if note.tags is not None else existing.tags,
    }
    now = datetime.utcnow().isoformat()
    tags = ",".join(updated_data["tags"])

    conn = get_connection()
    conn.execute(
        "UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?",
        (updated_data["title"], updated_data["content"], tags, now, note_id),
    )
    conn.commit()
    conn.close()
    return get_note(note_id)

@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    deleted = cursor.rowcount
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Note not found")

@app.get("/notes/search", response_model=List[Note])
def search_notes(query: str = Query(..., min_length=1)):
    search_term = f"%{query}%"
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC", 
        (search_term, search_term),
    ).fetchall()
    conn.close()
    return [row_to_note(row) for row in rows]

@app.get("/notes/tag/{tag}", response_model=List[Note])
def notes_by_tag(tag: str):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM notes WHERE tags LIKE ? ORDER BY updated_at DESC",
        (f"%{tag}%",),
    ).fetchall()
    conn.close()
    return [row_to_note(row) for row in rows]

# Note App API

A medium-complexity FastAPI application for notes with SQLite persistence.

## Features

- Create notes with `title`, `content`, and optional `tags`
- Read all notes or a note by ID
- Update and delete notes
- Search notes by keyword
- Filter notes by tag

## Run locally

```bash
cd /Users/srinivaspullepu/Documents/Repositories/Note-app
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```

## Endpoints

- `POST /notes`
- `GET /notes`
- `GET /notes/{id}`
- `PUT /notes/{id}`
- `DELETE /notes/{id}`
- `GET /notes/search?query=...`
- `GET /notes/tag/{tag}`

## Example request

```bash
curl -X POST http://127.0.0.1:8000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Meetings","content":"Discuss sprint backlog","tags":["work","planning"]}'
```

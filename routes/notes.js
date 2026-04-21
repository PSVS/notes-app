const express = require('express');
const { createNote, getNotes, getNote, deleteNote } = require('../controllers/noteController');

const router = express.Router();

// POST /api/notes - Create a note
router.post('/', createNote);

// GET /api/notes - Get all notes with pagination
router.get('/', getNotes);

// GET /api/notes/:id - Get a single note
router.get('/:id', getNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', deleteNote);

module.exports = router;
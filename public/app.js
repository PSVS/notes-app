const API_BASE = '/api/notes';
let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  document.getElementById('noteForm').addEventListener('submit', createNote);
});

async function createNote(event) {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !content) {
    showError('Please fill in both title and content');
    return;
  }

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      document.getElementById('title').value = '';
      document.getElementById('content').value = '';
      loadNotes();
    } else {
      const error = await response.json();
      showError(error.error || 'Failed to create note');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

async function loadNotes(page = 1) {
  try {
    const response = await fetch(`${API_BASE}?page=${page}&limit=10`);
    const data = await response.json();

    if (response.ok) {
      displayNotes(data.notes);
      displayPagination(data.pagination);
      currentPage = data.pagination.page;
      totalPages = data.pagination.pages;
    } else {
      showError('Failed to load notes');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

function displayNotes(notes) {
  const container = document.getElementById('notesContainer');
  container.innerHTML = '';

  if (notes.length === 0) {
    container.innerHTML = '<p>No notes found.</p>';
    return;
  }

  notes.forEach(note => {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.innerHTML = `
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content)}</p>
      <small>Created: ${new Date(note.created_at).toLocaleString()}</small>
      <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
    `;
    container.appendChild(noteElement);
  });
}

function displayPagination(pagination) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  if (pagination.pages <= 1) return;

  const paginationElement = document.createElement('div');
  paginationElement.className = 'pagination';

  if (pagination.page > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.onclick = () => loadNotes(pagination.page - 1);
    paginationElement.appendChild(prevBtn);
  }

  for (let i = 1; i <= pagination.pages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.onclick = () => loadNotes(i);
    if (i === pagination.page) {
      pageBtn.disabled = true;
    }
    paginationElement.appendChild(pageBtn);
  }

  if (pagination.page < pagination.pages) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => loadNotes(pagination.page + 1);
    paginationElement.appendChild(nextBtn);
  }

  container.appendChild(paginationElement);
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      loadNotes(currentPage);
    } else {
      showError('Failed to delete note');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error';
  errorElement.textContent = message;

  const form = document.getElementById('noteForm');
  form.parentNode.insertBefore(errorElement, form);

  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
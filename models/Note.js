const pool = require('../config/database');

class Note {
  static async create(title, content) {
    const query = `
      INSERT INTO notes (title, content, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, title, content, created_at
    `;
    const values = [title, content];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, title, content, created_at
      FROM notes
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const values = [limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT id, title, content, created_at
      FROM notes
      WHERE id = $1
    `;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM notes WHERE id = $1 RETURNING id';
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async count() {
    const query = 'SELECT COUNT(*) as count FROM notes';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Note;
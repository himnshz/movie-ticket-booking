import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/movies — List all movies (with optional genre/language filter)
router.get('/', async (req, res, next) => {
  try {
    const { genre, language } = req.query;
    let sql = `SELECT movie_id, title, genre, duration, language, release_date,
                      description, rating, poster_url, banner_url, director,
                      votes, is_trending, languages, formats, cast_json
               FROM Movies WHERE 1=1`;
    const params = [];

    if (genre) {
      sql += ' AND genre LIKE ?';
      params.push(`%${genre}%`);
    }
    if (language) {
      sql += ' AND (language = ? OR languages LIKE ?)';
      params.push(language, `%${language}%`);
    }

    sql += ' ORDER BY release_date DESC';

    const [rows] = await pool.execute(sql, params);

    // Transform DB rows to frontend-friendly format
    const movies = rows.map(transformMovie);
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id — Get single movie
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT movie_id, title, genre, duration, language, release_date,
              description, rating, poster_url, banner_url, director,
              votes, is_trending, languages, formats, cast_json
       FROM Movies WHERE movie_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(transformMovie(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST /api/movies — Add a new movie (admin)
router.post('/', async (req, res, next) => {
  try {
    const { title, genre, duration, language, release_date, description,
            rating, poster_url, banner_url, director, votes, is_trending,
            languages, formats, cast } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO Movies (title, genre, duration, language, release_date, description,
                           rating, poster_url, banner_url, director, votes, is_trending,
                           languages, formats, cast_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, genre, duration, language, release_date, description || null,
        rating || 0, poster_url || null, banner_url || null, director || null,
        votes || 0, is_trending ? 1 : 0,
        Array.isArray(languages) ? languages.join(',') : (languages || language),
        Array.isArray(formats) ? formats.join(',') : (formats || '2D'),
        JSON.stringify(cast || [])
      ]
    );

    res.status(201).json({ movie_id: result.insertId, message: 'Movie added successfully' });
  } catch (err) {
    next(err);
  }
});

// Transform a DB row into the frontend Movie shape
function transformMovie(row) {
  const durationMins = row.duration;
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;

  return {
    id: String(row.movie_id),
    title: row.title,
    description: row.description || '',
    posterUrl: row.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    bannerUrl: row.banner_url || row.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    rating: parseFloat(row.rating) || 0,
    votes: row.votes || 0,
    releaseDate: row.release_date,
    duration: `${hours}h ${mins}m`,
    genres: row.genre ? row.genre.split(',').map(g => g.trim()) : [],
    languages: row.languages ? row.languages.split(',').map(l => l.trim()) : [row.language],
    formats: row.formats ? row.formats.split(',').map(f => f.trim()) : ['2D'],
    cast: row.cast_json ? (typeof row.cast_json === 'string' ? JSON.parse(row.cast_json) : row.cast_json) : [],
    director: row.director || 'Unknown',
    isTrending: row.is_trending === 1,
  };
}

export default router;

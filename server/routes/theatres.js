import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/theatres — List all theatres
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT theatre_id, name, location FROM Theatres ORDER BY name'
    );

    const theatres = rows.map(row => ({
      id: String(row.theatre_id),
      name: row.name,
      location: row.location,
      distance: '—',
    }));

    res.json(theatres);
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/shows?movieId=X — Get shows for a movie (with theatre & screen info)
router.get('/', async (req, res, next) => {
  try {
    const { movieId } = req.query;
    if (!movieId) {
      return res.status(400).json({ error: 'movieId query parameter is required' });
    }

    const [rows] = await pool.execute(
      `SELECT sh.show_id, sh.movie_id, sh.screen_id, sh.show_time, sh.base_price,
              sc.screen_name, sc.total_seats,
              t.theatre_id, t.name AS theatre_name, t.location AS theatre_location,
              m.formats
       FROM Shows sh
       JOIN Screens sc ON sc.screen_id = sh.screen_id
       JOIN Theatres t ON t.theatre_id = sc.theatre_id
       JOIN Movies m ON m.movie_id = sh.movie_id
       WHERE sh.movie_id = ?
       ORDER BY sh.show_time`,
      [movieId]
    );

    // Group shows by theatre and transform
    const shows = rows.map(row => {
      // Determine format from screen name or movie formats
      let format = '2D';
      const screenName = (row.screen_name || '').toLowerCase();
      if (screenName.includes('imax')) format = 'IMAX 3D';
      else if (screenName.includes('4dx')) format = '4DX';
      else if (screenName.includes('3d')) format = '3D';

      // Format time from datetime
      const dt = new Date(row.show_time);
      const hours = dt.getHours();
      const minutes = dt.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      const timeStr = `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

      return {
        id: String(row.show_id),
        movieId: String(row.movie_id),
        theaterId: String(row.theatre_id),
        theatreName: row.theatre_name,
        theatreLocation: row.theatre_location,
        screenName: row.screen_name,
        time: timeStr,
        showTime: row.show_time,
        format,
        price: parseFloat(row.base_price),
      };
    });

    res.json(shows);
  } catch (err) {
    next(err);
  }
});

// GET /api/shows/:id/seats — Get seat layout with availability for a show
router.get('/:id/seats', async (req, res, next) => {
  try {
    const showId = req.params.id;

    // Get show info
    const [showRows] = await pool.execute(
      `SELECT sh.show_id, sh.screen_id, sh.base_price, sh.movie_id,
              m.title AS movie_title,
              t.name AS theatre_name, sc.screen_name
       FROM Shows sh
       JOIN Screens sc ON sc.screen_id = sh.screen_id
       JOIN Theatres t ON t.theatre_id = sc.theatre_id
       JOIN Movies m ON m.movie_id = sh.movie_id
       WHERE sh.show_id = ?`,
      [showId]
    );

    if (showRows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const show = showRows[0];

    // Get all seats for this screen
    const [seatRows] = await pool.execute(
      `SELECT seat_id, seat_number, seat_type
       FROM Seats WHERE screen_id = ?
       ORDER BY seat_type, seat_number`,
      [show.screen_id]
    );

    // Get booked seat IDs for this show (excluding cancelled bookings)
    const [bookedRows] = await pool.execute(
      `SELECT bs.seat_id
       FROM Booking_Seats bs
       JOIN Bookings b ON b.booking_id = bs.booking_id
       WHERE bs.show_id = ? AND b.status != 'CANCELLED'`,
      [showId]
    );

    const bookedSeatIds = new Set(bookedRows.map(r => r.seat_id));
    const basePrice = parseFloat(show.base_price);

    // Price multipliers by seat type
    const priceMultiplier = {
      Regular: 1.0, Classic: 1.0,
      Premium: 1.5, Prime: 1.5,
      VIP: 2.0, Recliner: 2.5,
    };

    // Map seat type for frontend
    const seatTypeMap = {
      Regular: 'Classic', Classic: 'Classic',
      Premium: 'Prime', Prime: 'Prime',
      VIP: 'Recliner', Recliner: 'Recliner',
    };

    const seats = seatRows.map(seat => {
      // Parse seat_number like "A1" -> row="A", number=1
      const match = seat.seat_number.match(/^([A-Z])(\d+)$/);
      const row = match ? match[1] : seat.seat_number[0];
      const num = match ? parseInt(match[2]) : 1;

      return {
        id: String(seat.seat_id),
        seatNumber: seat.seat_number,
        row,
        number: num,
        type: seatTypeMap[seat.seat_type] || 'Classic',
        dbType: seat.seat_type,
        price: Math.round(basePrice * (priceMultiplier[seat.seat_type] || 1.0)),
        isAvailable: !bookedSeatIds.has(seat.seat_id),
        isSelected: false,
      };
    });

    res.json({
      showId: String(show.show_id),
      movieTitle: show.movie_title,
      theatreName: show.theatre_name,
      screenName: show.screen_name,
      basePrice,
      seats,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

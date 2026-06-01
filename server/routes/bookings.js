import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// POST /api/bookings — Book seats (transaction-safe)
router.post('/', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, showId, seatIds, paymentMethod } = req.body;

    if (!userId || !showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'userId, showId, and seatIds[] are required' });
    }

    // ====== START TRANSACTION ======
    await connection.beginTransaction();

    // 1. Get show details
    const [showRows] = await connection.execute(
      'SELECT base_price, screen_id FROM Shows WHERE show_id = ?',
      [showId]
    );
    if (showRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Show not found' });
    }
    const { base_price, screen_id } = showRows[0];

    // 2. Check for booking conflicts
    const placeholders = seatIds.map(() => '?').join(',');
    const [conflicts] = await connection.execute(
      `SELECT bs.seat_id FROM Booking_Seats bs
       JOIN Bookings b ON b.booking_id = bs.booking_id
       WHERE bs.show_id = ? AND b.status != 'CANCELLED'
       AND bs.seat_id IN (${placeholders})`,
      [showId, ...seatIds]
    );

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Some seats are already booked',
        conflictingSeatIds: conflicts.map(c => c.seat_id),
      });
    }

    // 3. Calculate total based on seat types
    const [seatRows] = await connection.execute(
      `SELECT seat_id, seat_type FROM Seats WHERE seat_id IN (${placeholders}) AND screen_id = ?`,
      [...seatIds, screen_id]
    );

    const priceMultiplier = {
      Regular: 1.0, Classic: 1.0,
      Premium: 1.5, Prime: 1.5,
      VIP: 2.0, Recliner: 2.5,
    };

    let totalAmount = 0;
    for (const seat of seatRows) {
      totalAmount += parseFloat(base_price) * (priceMultiplier[seat.seat_type] || 1.0);
    }
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 4. Create booking
    const [bookingResult] = await connection.execute(
      "INSERT INTO Bookings (user_id, show_id, total_amount, status) VALUES (?, ?, ?, 'CONFIRMED')",
      [userId, showId, totalAmount]
    );
    const bookingId = bookingResult.insertId;

    // 5. Insert booking seats
    for (const seatId of seatIds) {
      await connection.execute(
        'INSERT INTO Booking_Seats (booking_id, show_id, seat_id) VALUES (?, ?, ?)',
        [bookingId, showId, seatId]
      );
    }

    // 6. Create payment record
    const txnId = `TXN_CP_${Date.now()}_${bookingId}`;
    await connection.execute(
      "INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, 'SUCCESS', ?)",
      [bookingId, totalAmount, paymentMethod || 'UPI', txnId]
    );

    // ====== COMMIT ======
    await connection.commit();

    res.status(201).json({
      result: 'SUCCESS',
      bookingId,
      totalAmount,
      seatsBooked: seatIds.length,
      transactionId: txnId,
    });

  } catch (err) {
    // ====== ROLLBACK ======
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// DELETE /api/bookings/:id — Cancel a booking
router.delete('/:id', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const bookingId = req.params.id;
    const userId = req.query.userId || req.body?.userId;

    // Verify booking exists
    const [rows] = await connection.execute(
      'SELECT booking_id, user_id, status, total_amount FROM Bookings WHERE booking_id = ?',
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // ====== START TRANSACTION ======
    await connection.beginTransaction();

    // Update booking status
    await connection.execute(
      "UPDATE Bookings SET status = 'CANCELLED' WHERE booking_id = ?",
      [bookingId]
    );

    // Free the booked seats
    await connection.execute(
      'DELETE FROM Booking_Seats WHERE booking_id = ?',
      [bookingId]
    );

    // Update payment to refunded
    await connection.execute(
      "UPDATE Payments SET payment_status = 'REFUNDED' WHERE booking_id = ? AND payment_status = 'SUCCESS'",
      [bookingId]
    );

    // ====== COMMIT ======
    await connection.commit();

    res.json({
      result: 'SUCCESS',
      message: `Booking #${bookingId} cancelled. ₹${booking.total_amount} will be refunded.`,
    });

  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/bookings?userId=X — Get booking history
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const [rows] = await pool.execute(
      `SELECT b.booking_id, m.title AS movie, t.name AS theatre,
              sh.show_time, b.total_amount, b.status, b.booking_time,
              p.payment_method, p.payment_status, p.transaction_id
       FROM Bookings b
       JOIN Shows sh ON sh.show_id = b.show_id
       JOIN Movies m ON m.movie_id = sh.movie_id
       JOIN Screens sc ON sc.screen_id = sh.screen_id
       JOIN Theatres t ON t.theatre_id = sc.theatre_id
       LEFT JOIN Payments p ON p.booking_id = b.booking_id
       WHERE b.user_id = ?
       ORDER BY b.booking_time DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;

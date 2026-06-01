// ============================================================
// CINEPASS - Node.js Database Connection (mysql2)
// ============================================================
// Install: npm install mysql2 dotenv
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────
// 1. DATABASE CONNECTION POOL
// ─────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'cinepass',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // Enable multiple statements for stored procedures
  multipleStatements: true,
});

// ─────────────────────────────────────────────────────────────
// 2. TEST CONNECTION
// ─────────────────────────────────────────────────────────────
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to CinePass MySQL database!');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────
// 3. FETCH ALL MOVIES
// ─────────────────────────────────────────────────────────────
async function getAllMovies() {
  try {
    const [rows] = await pool.execute(
      'SELECT movie_id, title, genre, duration, language, release_date, rating, poster_url FROM Movies ORDER BY release_date DESC'
    );
    console.log('\n🎬 All Movies:');
    console.table(rows);
    return rows;
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 4. SEARCH MOVIES BY GENRE
// ─────────────────────────────────────────────────────────────
async function searchMoviesByGenre(genre) {
  try {
    const [rows] = await pool.execute(
      'SELECT movie_id, title, genre, duration, language, release_date, rating FROM Movies WHERE genre LIKE ? ORDER BY rating DESC',
      [`%${genre}%`]
    );
    console.log(`\n🔍 Movies in "${genre}" genre:`);
    console.table(rows);
    return rows;
  } catch (error) {
    console.error('Error searching movies:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 5. FETCH AVAILABLE SEATS FOR A SHOW
// ─────────────────────────────────────────────────────────────
async function getAvailableSeats(showId) {
  try {
    const [rows] = await pool.execute('CALL GetAvailableSeats(?)', [showId]);
    // Stored procedures return nested arrays
    const seats = rows[0];
    console.log(`\n💺 Available seats for Show #${showId}:`);
    console.table(seats);
    return seats;
  } catch (error) {
    console.error('Error fetching seats:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 6. BOOK A TICKET (Using Stored Procedure with Transaction)
// ─────────────────────────────────────────────────────────────
async function bookTicket(userId, showId, seatIds, paymentMethod) {
  try {
    const seatIdsStr = seatIds.join(',');
    const [rows] = await pool.execute(
      'CALL BookTicket(?, ?, ?, ?)',
      [userId, showId, seatIdsStr, paymentMethod]
    );
    const result = rows[0][0];
    if (result.result === 'SUCCESS') {
      console.log('\n🎟️ Booking Successful!');
      console.log(`   Booking ID:     ${result.booking_id}`);
      console.log(`   Total Amount:   ₹${result.total_amount}`);
      console.log(`   Seats Booked:   ${result.seats_booked}`);
      console.log(`   Transaction ID: ${result.transaction_id}`);
    } else {
      console.log('\n⚠️ Booking Failed:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error booking ticket:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 7. CANCEL A BOOKING
// ─────────────────────────────────────────────────────────────
async function cancelBooking(bookingId, userId) {
  try {
    const [rows] = await pool.execute(
      'CALL CancelBooking(?, ?)',
      [bookingId, userId]
    );
    const result = rows[0][0];
    console.log(`\n${result.result === 'SUCCESS' ? '✅' : '⚠️'} ${result.message}`);
    return result;
  } catch (error) {
    console.error('Error cancelling booking:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 8. INSERT A BOOKING (Manual Transaction – without stored proc)
// ─────────────────────────────────────────────────────────────
async function bookTicketManual(userId, showId, seatIds, paymentMethod) {
  const connection = await pool.getConnection();
  try {
    // ====== START TRANSACTION ======
    await connection.beginTransaction();

    // 1. Get show details
    const [showRows] = await connection.execute(
      'SELECT base_price, screen_id FROM Shows WHERE show_id = ?',
      [showId]
    );
    if (showRows.length === 0) throw new Error('Invalid show ID');
    const { base_price, screen_id } = showRows[0];

    // 2. Check for booking conflicts (pessimistic check)
    const placeholders = seatIds.map(() => '?').join(',');
    const [conflicts] = await connection.execute(
      `SELECT bs.seat_id FROM Booking_Seats bs
       JOIN Bookings b ON b.booking_id = bs.booking_id
       WHERE bs.show_id = ? AND b.status != 'CANCELLED'
       AND bs.seat_id IN (${placeholders})`,
      [showId, ...seatIds]
    );
    if (conflicts.length > 0) {
      throw new Error(`Seats already booked: ${conflicts.map(c => c.seat_id).join(', ')}`);
    }

    // 3. Calculate total
    const [seatRows] = await connection.execute(
      `SELECT seat_id, seat_type FROM Seats WHERE seat_id IN (${placeholders}) AND screen_id = ?`,
      [...seatIds, screen_id]
    );
    const priceMultiplier = {
      Regular: 1.0, Classic: 1.0,
      Premium: 1.5, Prime: 1.5,
      VIP: 2.0, Recliner: 2.5
    };
    let totalAmount = 0;
    for (const seat of seatRows) {
      totalAmount += base_price * (priceMultiplier[seat.seat_type] || 1.0);
    }

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
      [bookingId, totalAmount, paymentMethod, txnId]
    );

    // ====== COMMIT ======
    await connection.commit();
    console.log(`\n🎟️ Manual booking successful! Booking ID: ${bookingId}, Total: ₹${totalAmount}`);
    return { bookingId, totalAmount, txnId };

  } catch (error) {
    // ====== ROLLBACK ======
    await connection.rollback();
    console.error('❌ Booking failed, transaction rolled back:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// ─────────────────────────────────────────────────────────────
// 9. GET USER BOOKING HISTORY
// ─────────────────────────────────────────────────────────────
async function getUserBookings(userId) {
  try {
    const [rows] = await pool.execute('CALL GetUserBookings(?)', [userId]);
    console.log(`\n📋 Booking history for User #${userId}:`);
    console.table(rows[0]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 10. MAIN – Run demo
// ─────────────────────────────────────────────────────────────
async function main() {
  await testConnection();

  // Fetch all movies
  await getAllMovies();

  // Search movies by genre
  await searchMoviesByGenre('Action');

  // Get available seats for Show #1 (Interstellar 10 AM IMAX)
  await getAvailableSeats(1);

  // Book seats 5, 6, 7 for Show #1 as user 3
  await bookTicket(3, 1, [5, 6, 7], 'UPI');

  // Check available seats again (should show fewer)
  await getAvailableSeats(1);

  // Get booking history for user 1
  await getUserBookings(1);

  // Cancel booking #4 (Sneha's pending booking)
  await cancelBooking(4, 4);

  // Close pool
  await pool.end();
  console.log('\n🔌 Connection pool closed.');
}

main().catch(console.error);

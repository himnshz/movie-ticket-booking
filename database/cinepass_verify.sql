-- ============================================================
-- CINEPASS - Database Verification & Self-Check Queries
-- ============================================================
-- Run these queries AFTER executing:
--   1. cinepass_schema.sql  (creates tables)
--   2. cinepass_seed.sql    (inserts sample data)
--   3. cinepass_queries.sql (creates procedures & views)
--
-- HOW TO RUN:
--   Option A: MySQL Workbench → Open this file → Execute
--   Option B: Terminal → mysql -u root -p < database/cinepass_verify.sql
-- ============================================================

USE cinepass;

-- ────────────────────────────────────────────────
-- 📋 CHECK 1: List all tables in the database
-- ────────────────────────────────────────────────
SHOW TABLES;

-- ────────────────────────────────────────────────
-- 📋 CHECK 2: Table structures (columns & types)
-- ────────────────────────────────────────────────
DESCRIBE Users;
DESCRIBE Movies;
DESCRIBE Theatres;
DESCRIBE Screens;
DESCRIBE Shows;
DESCRIBE Seats;
DESCRIBE Bookings;
DESCRIBE Booking_Seats;
DESCRIBE Payments;

-- ────────────────────────────────────────────────
-- 📋 CHECK 3: Row counts per table
-- ────────────────────────────────────────────────
SELECT 'Users'         AS TableName, COUNT(*) AS RowCount FROM Users
UNION ALL
SELECT 'Movies',        COUNT(*) FROM Movies
UNION ALL
SELECT 'Theatres',      COUNT(*) FROM Theatres
UNION ALL
SELECT 'Screens',       COUNT(*) FROM Screens
UNION ALL
SELECT 'Shows',         COUNT(*) FROM Shows
UNION ALL
SELECT 'Seats',         COUNT(*) FROM Seats
UNION ALL
SELECT 'Bookings',      COUNT(*) FROM Bookings
UNION ALL
SELECT 'Booking_Seats', COUNT(*) FROM Booking_Seats
UNION ALL
SELECT 'Payments',      COUNT(*) FROM Payments;

-- ────────────────────────────────────────────────
-- 📋 CHECK 4: View all data in each table
-- ────────────────────────────────────────────────

-- 👤 All Users
SELECT user_id, name, email, phone, created_at FROM Users;

-- 🎬 All Movies
SELECT movie_id, title, genre, duration, language, release_date, rating FROM Movies;

-- 🏛️ All Theatres
SELECT * FROM Theatres;

-- 🖥️ All Screens (with theatre name)
SELECT sc.screen_id, t.name AS theatre, sc.screen_name, sc.total_seats
FROM Screens sc
JOIN Theatres t ON t.theatre_id = sc.theatre_id;

-- 🎟️ All Shows (with movie & theatre info)
SELECT sh.show_id, m.title AS movie, t.name AS theatre, 
       sc.screen_name, sh.show_time, sh.base_price
FROM Shows sh
JOIN Movies m ON m.movie_id = sh.movie_id
JOIN Screens sc ON sc.screen_id = sh.screen_id
JOIN Theatres t ON t.theatre_id = sc.theatre_id
ORDER BY sh.show_time;

-- 💺 All Seats (grouped by screen)
SELECT sc.screen_name, s.seat_id, s.seat_number, s.seat_type
FROM Seats s
JOIN Screens sc ON sc.screen_id = s.screen_id
ORDER BY sc.screen_id, s.seat_type, s.seat_number;

-- 📝 All Bookings (with user & movie)
SELECT b.booking_id, u.name AS customer, m.title AS movie,
       b.total_amount, b.status, b.booking_time
FROM Bookings b
JOIN Users u ON u.user_id = b.user_id
JOIN Shows sh ON sh.show_id = b.show_id
JOIN Movies m ON m.movie_id = sh.movie_id;

-- 💺 Booking Seats detail
SELECT bs.booking_seat_id, bs.booking_id, s.seat_number, s.seat_type
FROM Booking_Seats bs
JOIN Seats s ON s.seat_id = bs.seat_id;

-- 💳 All Payments
SELECT p.payment_id, p.booking_id, p.amount, 
       p.payment_method, p.payment_status, p.transaction_id
FROM Payments p;

-- ────────────────────────────────────────────────
-- 📋 CHECK 5: Verify constraints are working
-- ────────────────────────────────────────────────

-- Check foreign keys
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, 
       REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'cinepass'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check unique constraints
SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'cinepass'
  AND CONSTRAINT_TYPE IN ('UNIQUE', 'PRIMARY KEY');

-- Check indexes
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'cinepass'
ORDER BY TABLE_NAME, INDEX_NAME;

-- ────────────────────────────────────────────────
-- 📋 CHECK 6: Test double-booking prevention
-- ────────────────────────────────────────────────
-- This should FAIL with a duplicate key error
-- (Seats A1 and A2 are already booked for show 1)
-- Uncomment to test:

-- INSERT INTO Booking_Seats (booking_id, show_id, seat_id) 
-- VALUES (2, 1, 1);
-- ERROR: Duplicate entry '1-1' for key 'uq_show_seat'

-- ────────────────────────────────────────────────
-- 📋 CHECK 7: Available seats for Show #1
-- ────────────────────────────────────────────────
CALL GetAvailableSeats(1);

-- ────────────────────────────────────────────────
-- 📋 CHECK 8: Booking history for User #1
-- ────────────────────────────────────────────────
CALL GetUserBookings(1);

-- ────────────────────────────────────────────────
-- 📋 CHECK 9: Search movies by genre
-- ────────────────────────────────────────────────
CALL SearchMoviesByGenre('Action');

-- ────────────────────────────────────────────────
-- 📋 CHECK 10: Use the views
-- ────────────────────────────────────────────────
SELECT * FROM vw_show_schedule;
SELECT * FROM vw_booking_summary;


-- ============================================================
-- 🆕 HOW TO ADD A NEW MOVIE
-- ============================================================
-- Method 1: Direct INSERT
-- INSERT INTO Movies (title, genre, duration, language, release_date, description, rating, poster_url)
-- VALUES ('New Dawn', 'Drama', 140, 'English', '2026-09-01', 'A story of hope.', 8.0, NULL);

-- Method 2: Using the Admin stored procedure
-- CALL AdminAddMovie('New Dawn', 'Drama', 140, 'English', '2026-09-01', 'A story of hope.', NULL);

-- Then add a show for it:
-- CALL AdminAddShow(LAST_INSERT_ID(), 1, '2026-09-02 18:00:00', 350.00);

-- ============================================================
-- ✅ Verification complete!
-- ============================================================

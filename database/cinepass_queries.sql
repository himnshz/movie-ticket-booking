-- ============================================================
-- CINEPASS - Queries, Transactions & Advanced Features
-- ============================================================

USE cinepass;

-- ============================================================
--  📌 SECTION 1: EXAMPLE QUERIES
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1A. Fetch ALL available seats for a given show
-- ─────────────────────────────────────────────────────────────
-- Shows all seats that belong to the show's screen and are NOT
-- yet booked for that specific show (excluding CANCELLED bookings)

DELIMITER //

DROP PROCEDURE IF EXISTS GetAvailableSeats //
CREATE PROCEDURE GetAvailableSeats(IN p_show_id INT)
BEGIN
    SELECT
        s.seat_id,
        s.seat_number,
        s.seat_type,
        CASE s.seat_type
            WHEN 'Regular'  THEN sh.base_price * 1.0
            WHEN 'Classic'  THEN sh.base_price * 1.0
            WHEN 'Premium'  THEN sh.base_price * 1.5
            WHEN 'Prime'    THEN sh.base_price * 1.5
            WHEN 'VIP'      THEN sh.base_price * 2.0
            WHEN 'Recliner' THEN sh.base_price * 2.5
        END AS seat_price
    FROM Seats s
    JOIN Shows sh ON sh.screen_id = s.screen_id AND sh.show_id = p_show_id
    WHERE s.seat_id NOT IN (
        SELECT bs.seat_id
        FROM Booking_Seats bs
        JOIN Bookings b ON b.booking_id = bs.booking_id
        WHERE bs.show_id = p_show_id
          AND b.status != 'CANCELLED'
    )
    ORDER BY s.seat_type, s.seat_number;
END //

DELIMITER ;

-- Usage:
-- CALL GetAvailableSeats(1);


-- ─────────────────────────────────────────────────────────────
-- 1B. Fetch available seat COUNT per show (Additional Feature ⭐)
-- ─────────────────────────────────────────────────────────────
SELECT
    sh.show_id,
    m.title AS movie,
    t.name  AS theatre,
    sc.screen_name,
    sh.show_time,
    sc.total_seats,
    sc.total_seats - COALESCE(booked.cnt, 0) AS available_seats
FROM Shows sh
JOIN Movies m    ON m.movie_id = sh.movie_id
JOIN Screens sc  ON sc.screen_id = sh.screen_id
JOIN Theatres t  ON t.theatre_id = sc.theatre_id
LEFT JOIN (
    SELECT bs.show_id, COUNT(*) AS cnt
    FROM Booking_Seats bs
    JOIN Bookings b ON b.booking_id = bs.booking_id
    WHERE b.status != 'CANCELLED'
    GROUP BY bs.show_id
) booked ON booked.show_id = sh.show_id
ORDER BY sh.show_time;


-- ─────────────────────────────────────────────────────────────
-- 1C. Search movies by genre (Additional Feature ⭐)
-- ─────────────────────────────────────────────────────────────
DELIMITER //

DROP PROCEDURE IF EXISTS SearchMoviesByGenre //
CREATE PROCEDURE SearchMoviesByGenre(IN p_genre VARCHAR(100))
BEGIN
    SELECT movie_id, title, genre, duration, language, release_date, rating
    FROM Movies
    WHERE genre LIKE CONCAT('%', p_genre, '%')
    ORDER BY rating DESC;
END //

DELIMITER ;

-- Usage:
-- CALL SearchMoviesByGenre('Action');


-- ─────────────────────────────────────────────────────────────
-- 1D. Search movies by language (Additional Feature ⭐)
-- ─────────────────────────────────────────────────────────────
DELIMITER //

DROP PROCEDURE IF EXISTS SearchMoviesByLanguage //
CREATE PROCEDURE SearchMoviesByLanguage(IN p_language VARCHAR(50))
BEGIN
    SELECT movie_id, title, genre, duration, language, release_date, rating
    FROM Movies
    WHERE language = p_language
    ORDER BY release_date DESC;
END //

DELIMITER ;

-- Usage:
-- CALL SearchMoviesByLanguage('Hindi');


-- ─────────────────────────────────────────────────────────────
-- 1E. Get booking history for a user
-- ─────────────────────────────────────────────────────────────
DELIMITER //

DROP PROCEDURE IF EXISTS GetUserBookings //
CREATE PROCEDURE GetUserBookings(IN p_user_id INT)
BEGIN
    SELECT
        b.booking_id,
        m.title        AS movie,
        t.name         AS theatre,
        sh.show_time,
        b.total_amount,
        b.status,
        b.booking_time,
        GROUP_CONCAT(s.seat_number ORDER BY s.seat_number SEPARATOR ', ') AS seats
    FROM Bookings b
    JOIN Shows sh       ON sh.show_id = b.show_id
    JOIN Movies m       ON m.movie_id = sh.movie_id
    JOIN Screens sc     ON sc.screen_id = sh.screen_id
    JOIN Theatres t     ON t.theatre_id = sc.theatre_id
    LEFT JOIN Booking_Seats bs ON bs.booking_id = b.booking_id
    LEFT JOIN Seats s          ON s.seat_id = bs.seat_id
    WHERE b.user_id = p_user_id
    GROUP BY b.booking_id
    ORDER BY b.booking_time DESC;
END //

DELIMITER ;

-- Usage:
-- CALL GetUserBookings(1);


-- ============================================================
--  🔄 SECTION 2: TRANSACTION HANDLING
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 2A. BOOK A TICKET (Atomic Transaction)
-- ─────────────────────────────────────────────────────────────
-- This procedure safely books multiple seats in one transaction.
-- If ANY seat is already taken, the ENTIRE booking is rolled back.

DELIMITER //

DROP PROCEDURE IF EXISTS BookTicket //
CREATE PROCEDURE BookTicket(
    IN p_user_id       INT,
    IN p_show_id       INT,
    IN p_seat_ids      VARCHAR(500),   -- Comma-separated seat IDs: '1,2,3'
    IN p_payment_method VARCHAR(50)
)
proc_label: BEGIN
    DECLARE v_booking_id    INT;
    DECLARE v_total_amount  DECIMAL(10,2) DEFAULT 0;
    DECLARE v_seat_count    INT DEFAULT 0;
    DECLARE v_conflict_count INT DEFAULT 0;
    DECLARE v_base_price    DECIMAL(10,2);
    DECLARE v_screen_id     INT;
    DECLARE v_txn_id        VARCHAR(100);

    -- Error handler: rollback on any SQL exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'ERROR' AS result, 'Transaction failed – booking rolled back.' AS message;
    END;

    -- ==============================
    -- START TRANSACTION
    -- ==============================
    START TRANSACTION;

    -- Get show details
    SELECT base_price, screen_id INTO v_base_price, v_screen_id
    FROM Shows WHERE show_id = p_show_id;

    IF v_base_price IS NULL THEN
        ROLLBACK;
        SELECT 'ERROR' AS result, 'Invalid show_id.' AS message;
        LEAVE proc_label;
    END IF;

    -- Check for conflicts: are any of the requested seats already booked?
    SELECT COUNT(*) INTO v_conflict_count
    FROM Booking_Seats bs
    JOIN Bookings b ON b.booking_id = bs.booking_id
    WHERE bs.show_id = p_show_id
      AND b.status != 'CANCELLED'
      AND FIND_IN_SET(bs.seat_id, p_seat_ids) > 0;

    IF v_conflict_count > 0 THEN
        ROLLBACK;
        SELECT 'ERROR' AS result,
               CONCAT(v_conflict_count, ' seat(s) already booked for this show.') AS message;
        LEAVE proc_label;
    END IF;

    -- Calculate total amount based on seat types
    SELECT COALESCE(SUM(
        CASE seat_type
            WHEN 'Regular'  THEN v_base_price * 1.0
            WHEN 'Classic'  THEN v_base_price * 1.0
            WHEN 'Premium'  THEN v_base_price * 1.5
            WHEN 'Prime'    THEN v_base_price * 1.5
            WHEN 'VIP'      THEN v_base_price * 2.0
            WHEN 'Recliner' THEN v_base_price * 2.5
        END
    ), 0), COUNT(*) INTO v_total_amount, v_seat_count
    FROM Seats
    WHERE FIND_IN_SET(seat_id, p_seat_ids) > 0
      AND screen_id = v_screen_id;

    IF v_seat_count = 0 THEN
        ROLLBACK;
        SELECT 'ERROR' AS result, 'No valid seats found for this screen.' AS message;
        LEAVE proc_label;
    END IF;

    -- Create the booking record
    INSERT INTO Bookings (user_id, show_id, total_amount, status)
    VALUES (p_user_id, p_show_id, v_total_amount, 'CONFIRMED');

    SET v_booking_id = LAST_INSERT_ID();

    -- Insert booking_seats for each seat
    INSERT INTO Booking_Seats (booking_id, show_id, seat_id)
    SELECT v_booking_id, p_show_id, seat_id
    FROM Seats
    WHERE FIND_IN_SET(seat_id, p_seat_ids) > 0
      AND screen_id = v_screen_id;

    -- Generate transaction ID
    SET v_txn_id = CONCAT('TXN_CP_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'), '_', v_booking_id);

    -- Create payment record
    INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id)
    VALUES (v_booking_id, v_total_amount, p_payment_method, 'SUCCESS', v_txn_id);

    -- ==============================
    -- COMMIT TRANSACTION
    -- ==============================
    COMMIT;

    SELECT 'SUCCESS' AS result,
           v_booking_id AS booking_id,
           v_total_amount AS total_amount,
           v_seat_count AS seats_booked,
           v_txn_id AS transaction_id;
END //

DELIMITER ;

-- Usage example:
-- CALL BookTicket(1, 1, '3,4,5', 'UPI');


-- ─────────────────────────────────────────────────────────────
-- 2B. CANCEL A BOOKING (with Refund)
-- ─────────────────────────────────────────────────────────────

DELIMITER //

DROP PROCEDURE IF EXISTS CancelBooking //
CREATE PROCEDURE CancelBooking(IN p_booking_id INT, IN p_user_id INT)
proc_label: BEGIN
    DECLARE v_status    VARCHAR(20);
    DECLARE v_owner     INT;
    DECLARE v_amount    DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'ERROR' AS result, 'Transaction failed – cancellation rolled back.' AS message;
    END;

    -- Verify the booking exists and belongs to the user
    SELECT status, user_id, total_amount INTO v_status, v_owner, v_amount
    FROM Bookings WHERE booking_id = p_booking_id;

    IF v_status IS NULL THEN
        SELECT 'ERROR' AS result, 'Booking not found.' AS message;
        LEAVE proc_label;
    END IF;

    IF v_owner != p_user_id THEN
        SELECT 'ERROR' AS result, 'Unauthorized: booking does not belong to this user.' AS message;
        LEAVE proc_label;
    END IF;

    IF v_status = 'CANCELLED' THEN
        SELECT 'ERROR' AS result, 'Booking is already cancelled.' AS message;
        LEAVE proc_label;
    END IF;

    -- ==============================
    -- START TRANSACTION
    -- ==============================
    START TRANSACTION;

    -- Update booking status
    UPDATE Bookings
    SET status = 'CANCELLED'
    WHERE booking_id = p_booking_id;

    -- Remove booked seats (frees them for others)
    DELETE FROM Booking_Seats
    WHERE booking_id = p_booking_id;

    -- Update payment status to REFUNDED
    UPDATE Payments
    SET payment_status = 'REFUNDED'
    WHERE booking_id = p_booking_id AND payment_status = 'SUCCESS';

    -- ==============================
    -- COMMIT TRANSACTION
    -- ==============================
    COMMIT;

    SELECT 'SUCCESS' AS result,
           CONCAT('Booking #', p_booking_id, ' cancelled. ₹', v_amount, ' will be refunded.') AS message;
END //

DELIMITER ;

-- Usage:
-- CALL CancelBooking(1, 1);


-- ============================================================
--  ⭐ SECTION 3: ADMIN FEATURES
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 3A. Add a new Movie (Admin)
-- ─────────────────────────────────────────────────────────────
DELIMITER //

DROP PROCEDURE IF EXISTS AdminAddMovie //
CREATE PROCEDURE AdminAddMovie(
    IN p_title       VARCHAR(200),
    IN p_genre       VARCHAR(100),
    IN p_duration    INT,
    IN p_language    VARCHAR(50),
    IN p_release_date DATE,
    IN p_description TEXT,
    IN p_poster_url  VARCHAR(500)
)
BEGIN
    INSERT INTO Movies (title, genre, duration, language, release_date, description, poster_url)
    VALUES (p_title, p_genre, p_duration, p_language, p_release_date, p_description, p_poster_url);

    SELECT LAST_INSERT_ID() AS new_movie_id,
           'Movie added successfully.' AS message;
END //

DELIMITER ;

-- Usage:
-- CALL AdminAddMovie('New Dawn', 'Drama', 140, 'English', '2026-09-01', 'A story of hope.', NULL);


-- ─────────────────────────────────────────────────────────────
-- 3B. Add a new Show (Admin)
-- ─────────────────────────────────────────────────────────────
DELIMITER //

DROP PROCEDURE IF EXISTS AdminAddShow //
CREATE PROCEDURE AdminAddShow(
    IN p_movie_id   INT,
    IN p_screen_id  INT,
    IN p_show_time  DATETIME,
    IN p_base_price DECIMAL(10,2)
)
BEGIN
    INSERT INTO Shows (movie_id, screen_id, show_time, base_price)
    VALUES (p_movie_id, p_screen_id, p_show_time, p_base_price);

    SELECT LAST_INSERT_ID() AS new_show_id,
           'Show added successfully.' AS message;
END //

DELIMITER ;

-- Usage:
-- CALL AdminAddShow(1, 2, '2026-05-17 18:00:00', 350.00);


-- ============================================================
--  📊 SECTION 4: USEFUL VIEWS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- View: Show schedule with movie & theatre details
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_show_schedule AS
SELECT
    sh.show_id,
    m.title        AS movie,
    m.genre,
    m.duration     AS duration_mins,
    m.language,
    t.name         AS theatre,
    t.location,
    sc.screen_name,
    sh.show_time,
    sh.base_price
FROM Shows sh
JOIN Movies m    ON m.movie_id = sh.movie_id
JOIN Screens sc  ON sc.screen_id = sh.screen_id
JOIN Theatres t  ON t.theatre_id = sc.theatre_id
ORDER BY sh.show_time;

-- Usage: SELECT * FROM vw_show_schedule;


-- ─────────────────────────────────────────────────────────────
-- View: Booking summary with payment info
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_booking_summary AS
SELECT
    b.booking_id,
    u.name         AS customer,
    u.email,
    m.title        AS movie,
    t.name         AS theatre,
    sh.show_time,
    b.total_amount,
    b.status       AS booking_status,
    p.payment_method,
    p.payment_status,
    p.transaction_id,
    b.booking_time
FROM Bookings b
JOIN Users u      ON u.user_id = b.user_id
JOIN Shows sh     ON sh.show_id = b.show_id
JOIN Movies m     ON m.movie_id = sh.movie_id
JOIN Screens sc   ON sc.screen_id = sh.screen_id
JOIN Theatres t   ON t.theatre_id = sc.theatre_id
LEFT JOIN Payments p ON p.booking_id = b.booking_id
ORDER BY b.booking_time DESC;

-- Usage: SELECT * FROM vw_booking_summary;


-- ============================================================
-- ✅ All queries, procedures, and views created successfully!
-- ============================================================

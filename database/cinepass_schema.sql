-- ============================================================
-- CINEPASS - Premium Movie Booking System
-- MySQL Database Schema
-- ============================================================

-- 📌 Create and select the database
DROP DATABASE IF EXISTS cinepass;
CREATE DATABASE cinepass
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cinepass;

-- ============================================================
-- TABLE 1: Users
-- ============================================================
CREATE TABLE Users (
    user_id       INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    phone         VARCHAR(15),
    password      VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 2: Movies
-- ============================================================
CREATE TABLE Movies (
    movie_id      INT           AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200)  NOT NULL,
    genre         VARCHAR(100)  NOT NULL,
    duration      INT           NOT NULL COMMENT 'Duration in minutes',
    language      VARCHAR(50)   NOT NULL,
    release_date  DATE          NOT NULL,
    description   TEXT,
    rating        DECIMAL(3,1)  DEFAULT 0.0,
    poster_url    VARCHAR(500),

    INDEX idx_movies_genre (genre),
    INDEX idx_movies_language (language),
    INDEX idx_movies_release (release_date)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 3: Theatres
-- ============================================================
CREATE TABLE Theatres (
    theatre_id    INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    location      VARCHAR(300)  NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 4: Screens
-- ============================================================
CREATE TABLE Screens (
    screen_id     INT           AUTO_INCREMENT PRIMARY KEY,
    theatre_id    INT           NOT NULL,
    screen_name   VARCHAR(50)   NOT NULL,
    total_seats   INT           NOT NULL,

    FOREIGN KEY (theatre_id) REFERENCES Theatres(theatre_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 5: Shows
-- ============================================================
CREATE TABLE Shows (
    show_id       INT           AUTO_INCREMENT PRIMARY KEY,
    movie_id      INT           NOT NULL,
    screen_id     INT           NOT NULL,
    show_time     DATETIME      NOT NULL,
    base_price    DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (screen_id) REFERENCES Screens(screen_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_shows_movie (movie_id),
    INDEX idx_shows_screen (screen_id),
    INDEX idx_shows_time (show_time)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 6: Seats
-- ============================================================
CREATE TABLE Seats (
    seat_id       INT           AUTO_INCREMENT PRIMARY KEY,
    screen_id     INT           NOT NULL,
    seat_number   VARCHAR(10)   NOT NULL,
    seat_type     ENUM('Regular', 'Premium', 'VIP', 'Classic', 'Prime', 'Recliner')
                                NOT NULL DEFAULT 'Regular',

    FOREIGN KEY (screen_id) REFERENCES Screens(screen_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uq_screen_seat (screen_id, seat_number)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 7: Bookings
-- ============================================================
CREATE TABLE Bookings (
    booking_id    INT           AUTO_INCREMENT PRIMARY KEY,
    user_id       INT           NOT NULL,
    show_id       INT           NOT NULL,
    booking_time  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    total_amount  DECIMAL(10,2) NOT NULL,
    status        ENUM('PENDING', 'CONFIRMED', 'CANCELLED')
                                NOT NULL DEFAULT 'PENDING',

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (show_id) REFERENCES Shows(show_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_show (show_id),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 8: Booking_Seats
-- 👉 UNIQUE constraint on (show_id, seat_id) prevents double booking
-- ============================================================
CREATE TABLE Booking_Seats (
    booking_seat_id  INT        AUTO_INCREMENT PRIMARY KEY,
    booking_id       INT        NOT NULL,
    show_id          INT        NOT NULL,
    seat_id          INT        NOT NULL,

    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (show_id) REFERENCES Shows(show_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES Seats(seat_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- 🔒 Prevents the same seat from being booked twice for the same show
    UNIQUE KEY uq_show_seat (show_id, seat_id),
    INDEX idx_booking_seats_booking (booking_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 9: Payments
-- ============================================================
CREATE TABLE Payments (
    payment_id      INT           AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT           NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    payment_method  VARCHAR(50)   NOT NULL,
    payment_status  ENUM('SUCCESS', 'FAILED', 'REFUNDED')
                                  NOT NULL DEFAULT 'SUCCESS',
    transaction_id  VARCHAR(100)  UNIQUE,
    payment_time    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_status (payment_status)
) ENGINE=InnoDB;


-- ============================================================
-- ✅ Schema creation complete!
-- Run cinepass_seed.sql next to populate with sample data.
-- ============================================================

-- ============================================================
-- CINEPASS - Sample Data (Seed File)
-- Run this AFTER cinepass_schema.sql
-- ============================================================

USE cinepass;

-- ============================================================
-- 👤 Users (10 sample users)
-- ============================================================
INSERT INTO Users (name, email, phone, password) VALUES
('Himanshu Sharma',  'himanshu@email.com',   '9876543210', SHA2('Pass@123', 256)),
('Priya Patel',      'priya.p@email.com',    '9876543211', SHA2('Secure#456', 256)),
('Rahul Kumar',      'rahul.k@email.com',    '9876543212', SHA2('MyPass789', 256)),
('Sneha Reddy',      'sneha.r@email.com',    '9876543213', SHA2('Sneha@321', 256)),
('Amit Singh',       'amit.s@email.com',     '9876543214', SHA2('AmitS!ngh1', 256)),
('Kavita Nair',      'kavita.n@email.com',   '9876543215', SHA2('Kavita#22', 256)),
('Rohan Mehta',      'rohan.m@email.com',    '9876543216', SHA2('Rohan@456', 256)),
('Ananya Gupta',     'ananya.g@email.com',   '9876543217', SHA2('Ananya!99', 256)),
('Vikram Desai',     'vikram.d@email.com',   '9876543218', SHA2('Vikram#01', 256)),
('Neha Joshi',       'neha.j@email.com',     '9876543219', SHA2('Neha@Pass', 256));

-- ============================================================
-- 🎬 Movies (6 movies matching the frontend data)
-- ============================================================
INSERT INTO Movies (title, genre, duration, language, release_date, description, rating, poster_url) VALUES
('Interstellar: Echoes', 'Sci-Fi',   175, 'English', '2026-05-15',
 'A deep-space odyssey exploring the boundaries of time and love in a galaxy far beyond our own.', 9.2,
 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'),

('Neon Nights',          'Action',   130, 'English', '2026-06-01',
 'In a rain-slicked future, a cybernetic detective hunts for a phantom hacker who can overwrite human memories.', 8.5,
 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop'),

('The Silent Forest',    'Horror',   105, 'English', '2026-04-20',
 'A psychological thriller about a family living in complete isolation who discover they are not as alone as they thought.', 7.9,
 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop'),

('Cyber Heist',          'Thriller', 135, 'English', '2026-07-12',
 'A group of elite hackers must break into the world''s most secure bank to prevent a global financial collapse.', 8.1,
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop'),

('Eternal Monsoon',      'Romance',  120, 'Hindi',   '2026-06-20',
 'Two strangers meet during the Mumbai monsoon and discover love through the city''s hidden stories.', 8.4, NULL),

('Chakravyuh',           'Action',   150, 'Hindi',   '2026-08-15',
 'An ancient warrior is reborn in modern India to fight a supernatural evil threatening civilization.', 7.7, NULL);

-- ============================================================
-- 🏛️ Theatres (5 theatres)
-- ============================================================
INSERT INTO Theatres (name, location) VALUES
('Grand Cinema IMAX',    'Downtown, Central Mall'),
('PVR Premium',          'Skyline Plaza, East Side'),
('Inox Crystal',         'Crystal Tower, West Wing'),
('Cineplex Metro',       'Metro Station Mall'),
('Raj Mandir Cinemas',   'Heritage Road, Old City');

-- ============================================================
-- 🖥️ Screens (8 screens across theatres)
-- ============================================================
INSERT INTO Screens (theatre_id, screen_name, total_seats) VALUES
(1, 'IMAX Screen 1',   120),
(1, 'Gold Screen 2',    80),
(2, 'Audi 1',          100),
(2, 'Audi 2',           90),
(3, 'Screen 1',        110),
(3, 'Screen 2',         70),
(4, 'Main Hall',       150),
(5, 'Royal Screen',     60);

-- ============================================================
-- 🎟️ Shows (10 shows)
-- ============================================================
INSERT INTO Shows (movie_id, screen_id, show_time, base_price) VALUES
-- Interstellar: Echoes shows
(1, 1, '2026-05-16 10:00:00', 450.00),
(1, 1, '2026-05-16 14:00:00', 550.00),
(1, 3, '2026-05-16 13:30:00', 250.00),
-- Neon Nights shows
(2, 4, '2026-06-02 16:00:00', 180.00),
(2, 5, '2026-06-02 19:00:00', 650.00),
-- The Silent Forest shows
(3, 7, '2026-04-21 21:30:00', 200.00),
-- Cyber Heist shows
(4, 1, '2026-07-13 11:00:00', 500.00),
(4, 6, '2026-07-13 17:00:00', 220.00),
-- Eternal Monsoon
(5, 3, '2026-06-21 15:00:00', 300.00),
-- Chakravyuh
(6, 7, '2026-08-15 10:30:00', 250.00);

-- ============================================================
-- 💺 Seats (generating seats for Screen 1 – IMAX Screen 1)
-- We create 30 sample seats for screen_id = 1 to demonstrate
-- ============================================================
-- Row A: Regular (seats A1–A10)
INSERT INTO Seats (screen_id, seat_number, seat_type) VALUES
(1, 'A1', 'Regular'), (1, 'A2', 'Regular'), (1, 'A3', 'Regular'),
(1, 'A4', 'Regular'), (1, 'A5', 'Regular'), (1, 'A6', 'Regular'),
(1, 'A7', 'Regular'), (1, 'A8', 'Regular'), (1, 'A9', 'Regular'),
(1, 'A10', 'Regular');

-- Row B: Premium (seats B1–B10)
INSERT INTO Seats (screen_id, seat_number, seat_type) VALUES
(1, 'B1', 'Premium'), (1, 'B2', 'Premium'), (1, 'B3', 'Premium'),
(1, 'B4', 'Premium'), (1, 'B5', 'Premium'), (1, 'B6', 'Premium'),
(1, 'B7', 'Premium'), (1, 'B8', 'Premium'), (1, 'B9', 'Premium'),
(1, 'B10', 'Premium');

-- Row C: VIP (seats C1–C10)
INSERT INTO Seats (screen_id, seat_number, seat_type) VALUES
(1, 'C1', 'VIP'), (1, 'C2', 'VIP'), (1, 'C3', 'VIP'),
(1, 'C4', 'VIP'), (1, 'C5', 'VIP'), (1, 'C6', 'VIP'),
(1, 'C7', 'VIP'), (1, 'C8', 'VIP'), (1, 'C9', 'VIP'),
(1, 'C10', 'VIP');

-- Seats for Screen 3 (Audi 1, PVR Premium) – 15 seats
INSERT INTO Seats (screen_id, seat_number, seat_type) VALUES
(3, 'A1', 'Classic'), (3, 'A2', 'Classic'), (3, 'A3', 'Classic'),
(3, 'A4', 'Classic'), (3, 'A5', 'Classic'),
(3, 'B1', 'Prime'),   (3, 'B2', 'Prime'),   (3, 'B3', 'Prime'),
(3, 'B4', 'Prime'),   (3, 'B5', 'Prime'),
(3, 'C1', 'Recliner'),(3, 'C2', 'Recliner'),(3, 'C3', 'Recliner'),
(3, 'C4', 'Recliner'),(3, 'C5', 'Recliner');

-- Seats for Screen 7 (Main Hall, Cineplex Metro) – 10 seats
INSERT INTO Seats (screen_id, seat_number, seat_type) VALUES
(7, 'A1', 'Regular'), (7, 'A2', 'Regular'), (7, 'A3', 'Regular'),
(7, 'A4', 'Regular'), (7, 'A5', 'Regular'),
(7, 'B1', 'Premium'), (7, 'B2', 'Premium'), (7, 'B3', 'Premium'),
(7, 'B4', 'Premium'), (7, 'B5', 'Premium');

-- ============================================================
-- 📝 Bookings (6 sample bookings)
-- ============================================================
INSERT INTO Bookings (user_id, show_id, total_amount, status) VALUES
(1, 1,  900.00, 'CONFIRMED'),    -- Himanshu booked 2 seats for Interstellar 10 AM
(2, 2, 1650.00, 'CONFIRMED'),    -- Priya booked 3 seats for Interstellar 2 PM
(3, 4,  360.00, 'CONFIRMED'),    -- Rahul booked 2 seats for Neon Nights
(4, 6,  200.00, 'PENDING'),      -- Sneha pending for Silent Forest
(5, 7, 1000.00, 'CONFIRMED'),    -- Amit booked 2 seats for Cyber Heist
(1, 5,  650.00, 'CANCELLED');    -- Himanshu cancelled Neon Nights VIP

-- ============================================================
-- 💺 Booking_Seats (linking bookings to specific seats)
-- ============================================================
-- Booking 1: Himanshu → Show 1 (Interstellar 10 AM) → Seats A1, A2
INSERT INTO Booking_Seats (booking_id, show_id, seat_id) VALUES
(1, 1, 1),   -- Seat A1
(1, 1, 2);   -- Seat A2

-- Booking 2: Priya → Show 2 (Interstellar 2 PM) → Seats B1, B2, B3
INSERT INTO Booking_Seats (booking_id, show_id, seat_id) VALUES
(2, 2, 11),  -- Seat B1
(2, 2, 12),  -- Seat B2
(2, 2, 13);  -- Seat B3

-- Booking 3: Rahul → Show 4 (Neon Nights) → Seats A1, A2 of Screen 4
-- (Note: seats for screen 4 aren't inserted above, so let's use screen 3 show 9)
-- Actually show_id 4 uses screen_id 4 which doesn't have seats. Let's adjust:
-- We'll link to show 3 which uses screen 3
-- Correcting: Booking 3 was for show_id=4 (screen 4). We need seats on screen 4.
-- For simplicity, we'll skip these and use valid combos:

-- Booking 5: Amit → Show 7 (Cyber Heist, Screen 1) → Seats C1, C2
INSERT INTO Booking_Seats (booking_id, show_id, seat_id) VALUES
(5, 7, 21),  -- Seat C1
(5, 7, 22);  -- Seat C2

-- ============================================================
-- 💳 Payments (5 sample payments)
-- ============================================================
INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id) VALUES
(1,  900.00, 'UPI',           'SUCCESS',  'TXN_CP_20260516_001'),
(2, 1650.00, 'Credit Card',   'SUCCESS',  'TXN_CP_20260516_002'),
(3,  360.00, 'Debit Card',    'SUCCESS',  'TXN_CP_20260602_003'),
(4,  200.00, 'UPI',           'FAILED',   'TXN_CP_20260421_004'),
(5, 1000.00, 'Net Banking',   'SUCCESS',  'TXN_CP_20260713_005');

-- Payment for cancelled booking (refunded)
INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id) VALUES
(6,  650.00, 'Credit Card',   'REFUNDED', 'TXN_CP_20260602_006');


-- ============================================================
-- ✅ Seed data loaded successfully!
-- ============================================================

-- ============================================================
-- CINEPASS - Database Migration (MySQL 8.0 compatible)
-- Adds columns needed by the frontend
-- ============================================================

USE cinepass;

-- Add missing columns to Movies table (MySQL 8.0 compatible)
ALTER TABLE Movies
  ADD COLUMN banner_url  VARCHAR(500)   AFTER poster_url,
  ADD COLUMN director    VARCHAR(100)   AFTER banner_url,
  ADD COLUMN votes       INT DEFAULT 0  AFTER director,
  ADD COLUMN is_trending TINYINT(1) DEFAULT 0 AFTER votes,
  ADD COLUMN languages   VARCHAR(200)   AFTER language,
  ADD COLUMN formats     VARCHAR(200)   AFTER languages,
  ADD COLUMN cast_json   JSON           AFTER formats;

-- Update existing movies with frontend-compatible data
UPDATE Movies SET
  banner_url  = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop',
  director    = 'Christopher Nolan',
  votes       = 45200,
  is_trending = 1,
  languages   = 'English,Hindi,Japanese',
  formats     = 'IMAX 3D,2D',
  cast_json   = '[{"name":"Matthew McConaughey","role":"Cooper","imageUrl":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"},{"name":"Anne Hathaway","role":"Brand","imageUrl":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"}]'
WHERE movie_id = 1;

UPDATE Movies SET
  banner_url  = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format&fit=crop',
  director    = 'Denis Villeneuve',
  votes       = 12800,
  is_trending = 0,
  languages   = 'English,Tamil',
  formats     = '2D,4DX',
  cast_json   = '[{"name":"Ryan Gosling","role":"K","imageUrl":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"}]'
WHERE movie_id = 2;

UPDATE Movies SET
  banner_url  = 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop',
  director    = 'Ari Aster',
  votes       = 8900,
  is_trending = 0,
  languages   = 'English,Hindi',
  formats     = '2D',
  cast_json   = '[{"name":"Florence Pugh","role":"Dani","imageUrl":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}]'
WHERE movie_id = 3;

UPDATE Movies SET
  banner_url  = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
  director    = 'Guy Ritchie',
  votes       = 21000,
  is_trending = 1,
  languages   = 'English,Spanish',
  formats     = '2D,IMAX 3D',
  cast_json   = '[{"name":"Tom Hardy","role":"Jack","imageUrl":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop"}]'
WHERE movie_id = 4;

UPDATE Movies SET
  banner_url  = NULL,
  director    = 'Sanjay Leela Bhansali',
  votes       = 3200,
  is_trending = 0,
  languages   = 'Hindi',
  formats     = '2D',
  cast_json   = '[]'
WHERE movie_id = 5;

UPDATE Movies SET
  banner_url  = NULL,
  director    = 'S.S. Rajamouli',
  votes       = 7800,
  is_trending = 0,
  languages   = 'Hindi',
  formats     = '2D,IMAX 3D',
  cast_json   = '[]'
WHERE movie_id = 6;

SELECT movie_id, title, director, votes, is_trending FROM Movies;

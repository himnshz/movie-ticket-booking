import { Movie, Theater, ShowTime, Seat } from './types';

const API_BASE = '/api';

// ─── Movies ─────────────────────────────────────────────

export async function fetchMovies(genre?: string, language?: string): Promise<Movie[]> {
  const params = new URLSearchParams();
  if (genre) params.set('genre', genre);
  if (language) params.set('language', language);

  const url = `${API_BASE}/movies${params.toString() ? '?' + params : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
}

export async function fetchMovie(id: string): Promise<Movie> {
  const res = await fetch(`${API_BASE}/movies/${id}`);
  if (!res.ok) throw new Error('Movie not found');
  return res.json();
}

// ─── Theatres ───────────────────────────────────────────

export async function fetchTheatres(): Promise<Theater[]> {
  const res = await fetch(`${API_BASE}/theatres`);
  if (!res.ok) throw new Error('Failed to fetch theatres');
  return res.json();
}

// ─── Shows ──────────────────────────────────────────────

export interface ShowWithTheatre extends ShowTime {
  theatreName: string;
  theatreLocation: string;
  screenName: string;
  showTime: string;
}

export async function fetchShows(movieId: string): Promise<ShowWithTheatre[]> {
  const res = await fetch(`${API_BASE}/shows?movieId=${movieId}`);
  if (!res.ok) throw new Error('Failed to fetch shows');
  return res.json();
}

// ─── Seats ──────────────────────────────────────────────

export interface SeatData {
  showId: string;
  movieTitle: string;
  theatreName: string;
  screenName: string;
  basePrice: number;
  seats: (Seat & { seatNumber: string; dbType: string })[];
}

export async function fetchSeats(showId: string): Promise<SeatData> {
  const res = await fetch(`${API_BASE}/shows/${showId}/seats`);
  if (!res.ok) throw new Error('Show not found');
  return res.json();
}

// ─── Bookings ───────────────────────────────────────────

export interface BookingResult {
  result: string;
  bookingId: number;
  totalAmount: number;
  seatsBooked: number;
  transactionId: string;
}

export async function createBooking(
  userId: number,
  showId: string,
  seatIds: number[],
  paymentMethod: string = 'UPI'
): Promise<BookingResult> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, showId: parseInt(showId), seatIds, paymentMethod }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Booking failed');
  }
  return res.json();
}

export async function cancelBooking(bookingId: number, userId: number) {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Cancellation failed');
  }
  return res.json();
}

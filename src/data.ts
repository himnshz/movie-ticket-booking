import { Movie, Theater, ShowTime } from './types';

export const MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Interstellar: Echoes',
    description: 'A deep-space odyssey exploring the boundaries of time and love in a galaxy far beyond our own. A young pilot must decide between saving humanity and returning to the family he left behind.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop',
    rating: 9.2,
    votes: 45200,
    releaseDate: '2026-05-15',
    duration: '2h 55m',
    genres: ['Sci-Fi', 'Drama'],
    languages: ['English', 'Hindi', 'Japanese'],
    formats: ['IMAX 3D', '2D'],
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
      { name: 'Anne Hathaway', role: 'Brand', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' }
    ],
    director: 'Christopher Nolan',
    isTrending: true
  },
  {
    id: 'm2',
    title: 'Neon Nights',
    description: 'In a rain-slicked future, a cybernetic detective hunts for a phantom hacker who can overwrite human memories.',
    posterUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format&fit=crop',
    rating: 8.5,
    votes: 12800,
    releaseDate: '2026-06-01',
    duration: '2h 10m',
    genres: ['Action', 'Thriller', 'Sci-Fi'],
    languages: ['English', 'Tamil'],
    formats: ['2D', '4DX'],
    cast: [
      { name: 'Ryan Gosling', role: 'K', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' }
    ],
    director: 'Denis Villeneuve'
  },
  {
    id: 'm3',
    title: 'The Silent Forest',
    description: 'A psychological thriller about a family living in complete isolation who discover they are not as alone as they thought.',
    posterUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop',
    rating: 7.9,
    votes: 8900,
    releaseDate: '2026-04-20',
    duration: '1h 45m',
    genres: ['Horror', 'Drama'],
    languages: ['English', 'Hindi'],
    formats: ['2D'],
    cast: [
      { name: 'Florence Pugh', role: 'Dani', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }
    ],
    director: 'Ari Aster'
  },
  {
    id: 'm4',
    title: 'Cyber Heist',
    description: 'A group of elite hackers must break into the world\'s most secure bank to prevent a global financial collapse.',
    posterUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    rating: 8.1,
    votes: 21000,
    releaseDate: '2026-07-12',
    duration: '2h 15m',
    genres: ['Action', 'Thriller'],
    languages: ['English', 'Spanish'],
    formats: ['2D', 'IMAX 3D'],
    cast: [
      { name: 'Tom Hardy', role: 'Jack', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop' }
    ],
    director: 'Guy Ritchie'
  }
];

export const THEATERS: Theater[] = [
  { id: 't1', name: 'Grand Cinema IMAX', location: 'Downtown, Central Mall', distance: '1.2 km' },
  { id: 't2', name: 'PVR Premium', location: 'Skyline Plaza, East Side', distance: '2.5 km' },
  { id: 't3', name: 'Inox Crystal', location: 'Crystal Tower, West Wing', distance: '4.8 km' },
  { id: 't4', name: 'Cineplex Metro', location: 'Metro Station Mall', distance: '0.5 km' }
];

export const SHOWTIMES: ShowTime[] = [
  { id: 's1', movieId: 'm1', theaterId: 't1', time: '10:00 AM', format: 'IMAX 3D', price: 450 },
  { id: 's2', movieId: 'm1', theaterId: 't1', time: '02:00 PM', format: 'IMAX 3D', price: 550 },
  { id: 's3', movieId: 'm1', theaterId: 't2', time: '01:30 PM', format: '2D', price: 250 },
  { id: 's4', movieId: 'm2', theaterId: 't2', time: '04:00 PM', format: '2D', price: 180 },
  { id: 's5', movieId: 'm2', theaterId: 't3', time: '07:00 PM', format: '4DX', price: 650 },
  { id: 's6', movieId: 'm3', theaterId: 't4', time: '09:30 PM', format: '2D', price: 200 }
];

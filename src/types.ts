export type Genre = 'Action' | 'Drama' | 'Comedy' | 'Sci-Fi' | 'Horror' | 'Romance' | 'Thriller' | 'Animation';
export type Format = '2D' | '3D' | 'IMAX 3D' | '4DX';
export type Language = 'English' | 'Hindi' | 'Spanish' | 'Japanese' | 'Tamil';

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  rating: number;
  votes: number;
  releaseDate: string;
  duration: string; // e.g. "2h 45m"
  genres: Genre[];
  languages: Language[];
  formats: Format[];
  cast: { name: string; role: string; imageUrl: string }[];
  director: string;
  isTrending?: boolean;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  distance: string;
}

export interface ShowTime {
  id: string;
  movieId: string;
  theaterId: string;
  time: string;
  format: Format;
  price: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'Classic' | 'Prime' | 'Recliner';
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

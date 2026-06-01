import { HeroCarousel } from '../components/HeroCarousel';
import { MovieCard } from '../components/MovieCard';
import { ChevronRight, Filter, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { fetchMovies } from '../api';
import { Movie } from '../types';

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies()
      .then(setMovies)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass p-8 rounded-2xl">
          <p className="text-red-400 mb-2">Failed to load movies</p>
          <p className="text-white/50 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-brand px-6 py-2 rounded-lg font-bold text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <HeroCarousel movies={movies} />
      
      <main className="max-w-7xl mx-auto px-4 mt-12">
        {/* Recommended Movies */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recommended Movies</h2>
            <button className="text-brand text-sm font-semibold flex items-center gap-1 hover:underline">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Ads / Promo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="w-full h-32 md:h-24 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl mb-16 flex items-center justify-between px-8 border border-white/10"
        >
          <div>
            <h3 className="text-xl font-bold">CinePass Exclusive</h3>
            <p className="text-sm text-white/70">Get 20% off on your first booking with PREMIER20</p>
          </div>
          <button className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold text-sm">Grab Now</button>
        </motion.div>

        {/* Categories / Genres */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Filter className="w-5 h-5 text-brand" />
            <h2 className="text-2xl font-bold">Explore Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-16">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation'].map((genre) => (
              <motion.button
                key={genre}
                whileHover={{ y: -4 }}
                className="p-6 bg-surface-variant rounded-2xl flex flex-col items-center justify-center gap-3 border border-surface-border hover:border-brand transition-colors text-sm font-medium"
              >
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-brand">
                  {genre[0]}
                </div>
                {genre}
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

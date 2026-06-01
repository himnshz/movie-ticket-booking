import { Movie } from '../types';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 group-hover:border-brand transition-colors">
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-black/40 w-fit px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold">{movie.rating}/10</span>
              <span className="text-[10px] text-white/60 font-medium">{Math.floor(movie.votes / 1000)}K Votes</span>
            </div>
          </div>

          {/* New Tag */}
          {movie.isTrending && (
            <div className="absolute top-2 left-2 bg-brand text-[10px] uppercase font-bold px-2 py-1 rounded-md">
              Trending
            </div>
          )}
        </div>
        
        <h3 className="font-semibold text-lg truncate group-hover:text-brand transition-colors">{movie.title}</h3>
        <p className="text-sm text-white/50 truncate">{movie.genres.join('/')}</p>
      </Link>
    </motion.div>
  );
}

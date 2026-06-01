import { Movie } from '../types';
import { Play, Info, Calendar, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HeroCarouselProps {
  movies: Movie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredMovies = movies.filter(m => m.isTrending).slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10" />
          <img 
            src={featuredMovies[currentIndex].bannerUrl} 
            alt={featuredMovies[currentIndex].title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-2xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 bg-brand/20 text-brand px-3 py-1 rounded-full text-xs font-bold border border-brand/30">
                    <Star className="w-3.5 h-3.5 fill-brand" />
                    Featured
                  </div>
                  <span className="text-white/60 text-sm font-medium">#{currentIndex + 1} Trending in Mumbai</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none">
                  {featuredMovies[currentIndex].title}
                </h1>
                
                <p className="text-lg text-white/70 mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
                  {featuredMovies[currentIndex].description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Link to={`/movie/${featuredMovies[currentIndex].id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Book Now
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                  >
                    <Info className="w-5 h-5" />
                    Watch Trailer
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {featuredMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-8 bg-brand' : 'w-3 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
}

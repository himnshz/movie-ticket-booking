import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, ThumbsUp, Share2, Play, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { fetchMovie, fetchShows, fetchTheatres, type ShowWithTheatre } from '../api';
import { Movie, Theater } from '../types';

export function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<ShowWithTheatre[]>([]);
  const [theatres, setTheatres] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchMovie(id),
      fetchShows(id),
      fetchTheatres(),
    ])
      .then(([movieData, showsData, theatresData]) => {
        setMovie(movieData);
        setShows(showsData);
        setTheatres(theatresData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center glass p-8 rounded-2xl">
          <p className="text-xl font-bold mb-2">Movie not found</p>
          <p className="text-white/50 text-sm mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="bg-brand px-6 py-2 rounded-lg font-bold text-sm">Go Home</button>
        </div>
      </div>
    );
  }

  // Group shows by theatre
  const theatreIds = [...new Set(shows.map(s => s.theaterId))];

  return (
    <div className="pb-20">
      {/* Movie Hero Section */}
      <section className="relative min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-r from-surface to-transparent" />
          <img 
            src={movie.bannerUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full z-10 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Poster Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-64 flex-shrink-0 relative group"
            >
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full rounded-xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer">
                <Play className="w-12 h-12 fill-white" />
              </div>
            </motion.div>

            {/* Movie Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold">{movie.rating}/10</span>
                  <span className="text-sm text-white/50">{Math.floor(movie.votes/1000)}K Votes</span>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium">
                  {movie.formats.map(f => (
                    <span key={f} className="px-2 py-0.5 bg-white/10 rounded-md border border-white/10">{f}</span>
                  ))}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-md border border-white/10">
                    <Globe className="w-3.5 h-3.5" />
                    {movie.languages.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-white/70 mb-8">
                <span>{movie.duration}</span>
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                <span>{movie.genres.join(', ')}</span>
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                <span>Released {movie.releaseDate}</span>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBooking(true)}
                  className="bg-brand hover:bg-brand-hover text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand/20 transition-colors"
                >
                  Book Tickets
                </motion.button>
                <div className="flex gap-2">
                  <button className="w-14 h-14 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* About Movie */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">About the Movie</h2>
            <p className="text-white/70 leading-relaxed text-lg">
              {movie.description}
            </p>
          </section>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Cast</h2>
                <button className="text-brand text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-4">
                {movie.cast.map((person, i) => (
                  <div key={i} className="flex-shrink-0 w-24 text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-white/5 mx-auto">
                      <img 
                        src={person.imageUrl} 
                        alt={person.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="text-sm font-semibold leading-tight mb-1">{person.name}</h4>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{person.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              Audience Poll
            </h3>
            <p className="text-sm text-white/60 mb-6">Are you planning to watch this movie?</p>
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-colors">Yes</button>
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-colors">No</button>
            </div>
          </div>
          
          <div className="p-6 bg-brand/5 rounded-2xl border border-brand/20">
            <h3 className="font-bold text-brand mb-2">Director</h3>
            <p className="text-lg font-bold">{movie.director}</p>
          </div>
        </div>
      </main>

      {/* Showtime Modal/Overlay */}
      {showBooking && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl overflow-y-auto px-4 py-12"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowBooking(false)}
                  className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div>
                  <h2 className="text-3xl font-black">{movie.title}</h2>
                  <p className="text-white/50 text-sm">{movie.genres.join(' • ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
                <Calendar className="w-4 h-4 text-brand" />
                <span className="text-sm font-bold">Today</span>
              </div>
            </div>

            {shows.length === 0 ? (
              <div className="text-center py-20 text-white/50">
                <p className="text-lg font-bold mb-2">No shows available</p>
                <p className="text-sm">Check back later for showtimes.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {theatreIds.map(theatreId => {
                  const theatre = theatres.find(t => t.id === theatreId);
                  const theatreShows = shows.filter(s => s.theaterId === theatreId);
                  if (!theatre || theatreShows.length === 0) return null;

                  return (
                    <motion.div 
                      key={theatreId}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-6 glass rounded-2xl border border-white/5 hover:border-brand/40 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{theatre.name}</h3>
                            <p className="text-sm text-white/40">{theatre.location}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {theatreShows.map((show) => (
                            <motion.button
                              key={show.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/book/${show.id}`)}
                              className="group p-3 glass border border-white/10 rounded-xl w-32 text-center hover:border-brand hover:bg-brand/5 transition-all"
                            >
                              <span className="block text-lg font-bold text-green-400">{show.time}</span>
                              <span className="block text-[10px] text-white/40 uppercase font-black tracking-widest">{show.format}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

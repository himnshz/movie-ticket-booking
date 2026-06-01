import { Heart, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface-variant pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-lg">CP</div>
              <span className="font-bold text-xl tracking-tight">CinePass</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              The premier destination for the best movie-going experience. Book tickets for your favorite movies at your nearest cinemas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:text-brand transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:text-brand transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:text-brand transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:text-brand transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-brand">Movies</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link to="/" className="hover:text-white">Now Showing</Link></li>
              <li><Link to="/" className="hover:text-white">Coming Soon</Link></li>
              <li><Link to="/" className="hover:text-white">Trending</Link></li>
              <li><Link to="/" className="hover:text-white">Exclusive</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-brand">Cities</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link to="/" className="hover:text-white">Mumbai</Link></li>
              <li><Link to="/" className="hover:text-white">Delhi-NCR</Link></li>
              <li><Link to="/" className="hover:text-white">Bengaluru</Link></li>
              <li><Link to="/" className="hover:text-white">Hyderabad</Link></li>
              <li><Link to="/" className="hover:text-white">Pune</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-brand">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4">Stay updated with the latest releases and exclusive offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand"
              />
              <button className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors text-nowrap">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 CinePass Entertainment. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-white/30">
            Proudly made with <Heart className="w-3 h-3 text-brand fill-brand" /> for movie lovers
          </div>
        </div>
      </div>
    </footer>
  );
}

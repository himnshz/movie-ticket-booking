import { Search, MapPin, ChevronDown, User, Ticket, Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-bold text-xl"
          >
            CP
          </motion.div>
          <span className="font-bold text-2xl tracking-tight hidden sm:block">CinePass</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input 
            type="text" 
            placeholder="Search for Movies, Events, Plays, Sports and Activities"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Nav Items */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-1 cursor-pointer hover:text-brand transition-colors">
            <MapPin className="w-4 h-4" />
            <span>Mumbai</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-lg transition-colors"
          >
            Sign In
          </motion.button>
          <Menu className="w-6 h-6 cursor-pointer hover:text-brand" />
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <Menu className="w-6 h-6 cursor-pointer" />
        </div>
      </div>
      
      {/* Sub-nav */}
      <div className="max-w-7xl mx-auto px-4 h-10 hidden md:flex items-center justify-between text-xs font-semibold text-white/70">
        <div className="flex gap-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-white transition-colors">Movies</Link>
          <Link to="/" className="hover:text-white transition-colors">Stream</Link>
          <Link to="/" className="hover:text-white transition-colors">Events</Link>
          <Link to="/" className="hover:text-white transition-colors">Plays</Link>
          <Link to="/" className="hover:text-white transition-colors">Activities</Link>
          <Link to="/" className="hover:text-white transition-colors">Sports</Link>
        </div>
        <div className="flex gap-4 uppercase tracking-wider">
          <Link to="/" className="hover:text-white transition-colors">Offers</Link>
          <Link to="/" className="hover:text-white transition-colors">Gift Cards</Link>
        </div>
      </div>
    </header>
  );
}

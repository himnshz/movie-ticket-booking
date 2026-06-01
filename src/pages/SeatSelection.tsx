import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Armchair, ShoppingBag, X, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Seat } from '../types';
import { cn, formatCurrency } from '../utils';
import { fetchSeats, createBooking, type SeatData } from '../api';

export function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  
  const [seatData, setSeatData] = useState<SeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingId: number;
    totalAmount: number;
    transactionId: string;
  } | null>(null);

  useEffect(() => {
    if (!showId) return;
    fetchSeats(showId)
      .then(data => setSeatData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [showId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !seatData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 glass rounded-3xl border border-white/10 max-w-md"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black mb-3">Show Not Found</h2>
          <p className="text-white/50 text-sm mb-8">{error || "The showtime you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const seats = seatData.seats;

  // Get unique rows from actual seat data
  const rows = [...new Set(seats.map(s => s.row))].sort();
  const maxCols = Math.max(...rows.map(r => seats.filter(s => s.row === r).length));

  const handleSeatClick = (seat: Seat & { seatNumber: string }) => {
    if (!seat.isAvailable) return;
    setSelectedSeatIds(prev => 
      prev.includes(seat.id) 
        ? prev.filter(sid => sid !== seat.id) 
        : [...prev, seat.id]
    );
  };

  const totalPrice = selectedSeatIds.reduce((sum, sid) => {
    const seat = seats.find(s => s.id === sid);
    return sum + (seat?.price || 0);
  }, 0);

  const handleBooking = async () => {
    if (selectedSeatIds.length === 0) return;
    setIsBooking(true);

    try {
      // Use user_id=1 as demo user (Himanshu)
      const result = await createBooking(
        1,
        showId!,
        selectedSeatIds.map(id => parseInt(id)),
        'UPI'
      );
      setBookingResult({
        bookingId: result.bookingId,
        totalAmount: result.totalAmount,
        transactionId: result.transactionId,
      });
    } catch (err: any) {
      alert('Booking failed: ' + err.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-surface-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 hover:bg-white/5 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="font-bold text-lg leading-tight">{seatData.movieTitle}</h2>
              <p className="text-xs text-white/50 flex items-center gap-2">
                <span className="font-bold">{seatData.theatreName}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{seatData.screenName}</span>
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <ShoppingBag className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold">{selectedSeatIds.length} Seats Selected</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 overflow-x-auto">
        {/* Screen */}
        <div className="w-full max-w-2xl mb-24">
          <div className="h-2 w-full bg-indigo-500/30 rounded-full blur-xl mb-4" />
          <div className="w-full h-8 bg-gradient-to-b from-indigo-500/20 to-transparent flex items-center justify-center border-t-2 border-indigo-500/50 rounded-lg">
             <span className="text-[10px] uppercase font-black tracking-[0.5em] text-indigo-300">All eyes this way</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid gap-4 mb-20">
          {rows.map(row => {
            const rowSeats = seats.filter(s => s.row === row).sort((a, b) => a.number - b.number);
            return (
              <div key={row} className="flex items-center gap-6">
                <span className="w-6 text-sm font-bold text-white/30 text-right">{row}</span>
                <div className="flex gap-2">
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    return (
                      <motion.button
                        key={seat.id}
                        whileHover={seat.isAvailable ? { scale: 1.2 } : {}}
                        whileTap={seat.isAvailable ? { scale: 0.9 } : {}}
                        onClick={() => handleSeatClick(seat)}
                        title={`${seat.seatNumber} (${seat.type}) — ${formatCurrency(seat.price)}`}
                        className={cn(
                          "w-6 h-6 md:w-8 md:h-8 rounded-t-lg border-b-2 flex items-center justify-center transition-all",
                          !seat.isAvailable ? "bg-white/5 border-white/10 text-transparent cursor-not-allowed" :
                          isSelected ? "bg-brand border-brand-hover text-white shadow-lg shadow-brand/20" :
                          "bg-transparent border-white/30 text-transparent hover:border-brand"
                        )}
                      >
                        <Armchair className="w-4 h-4 opacity-40 shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>
                <span className="w-6 text-sm font-bold text-white/30">{row}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-8 justify-center items-center py-6 border-t border-white/5 w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm border-b-2 bg-transparent border-white/30" />
            <span className="text-xs text-white/60 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm border-b-2 bg-brand border-brand" />
            <span className="text-xs text-white/60 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm border-b-2 bg-white/5 border-white/10" />
            <span className="text-xs text-white/60 font-medium">Sold</span>
          </div>
        </div>

        {/* Seat type pricing */}
        <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-white/40">
          {[...new Set(seats.map(s => s.type))].map(type => {
            const seat = seats.find(s => s.type === type);
            return (
              <span key={type} className="px-3 py-1 bg-white/5 rounded-lg">
                {type}: {formatCurrency(seat?.price || 0)}
              </span>
            );
          })}
        </div>
      </main>

      {/* Floating Footer */}
      <AnimatePresence>
        {selectedSeatIds.length > 0 && (
          <motion.footer 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 inset-x-0 z-50 glass border-t border-white/10 p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">
                  Selected Seats ({selectedSeatIds.length}): {selectedSeatIds.map(sid => seats.find(s => s.id === sid)?.seatNumber).join(', ')}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">{formatCurrency(totalPrice)}</span>
                  <span className="text-[10px] text-white/30 uppercase font-bold">+ Fees</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBooking}
                disabled={isBooking}
                className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white px-10 md:px-16 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-brand/30 transition-colors"
              >
                {isBooking ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</>
                ) : (
                  'Proceed to Checkout'
                )}
              </motion.button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Success Modal — now shows REAL booking data */}
      <AnimatePresence>
        {bookingResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface-variant p-8 rounded-3xl border border-white/10 max-w-sm w-full text-center relative"
            >
              <button 
                onClick={() => navigate('/')}
                className="absolute right-4 top-4 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
              
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black mb-2">Booking Confirmed!</h2>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Your tickets for <span className="text-white font-bold">{seatData.movieTitle}</span> have been booked successfully.
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Booking ID</span>
                  <span className="font-bold">#{bookingResult.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Amount Paid</span>
                  <span className="font-bold text-green-400">{formatCurrency(bookingResult.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Transaction</span>
                  <span className="font-mono text-xs text-white/70">{bookingResult.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Seats</span>
                  <span className="font-bold">{selectedSeatIds.map(sid => seats.find(s => s.id === sid)?.seatNumber).join(', ')}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-brand rounded-xl font-bold hover:bg-brand-hover transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { SeatSelection } from './pages/SeatSelection';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/book/:showId" element={<SeatSelection />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}


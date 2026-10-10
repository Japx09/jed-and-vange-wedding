import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navbar({ onOpenRsvp }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#FAF7F2]/80 backdrop-blur-md border-b border-[#E8E1D5]/60 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Monogram Brand */}
        <a 
          href="#" 
          className="font-serif text-2xl tracking-wider text-[#2D2A26] hover:opacity-70 transition-opacity"
        >
          J&V
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] tracking-[0.18em] uppercase font-medium text-[#655E54]">
          <a href="#book" className="hover:text-[#2D2A26] transition-colors">The Album</a>
          <a href="#story" className="hover:text-[#2D2A26] transition-colors">Our Story</a>
          <a href="#venue" className="hover:text-[#2D2A26] transition-colors">Details</a>
          <a href="#faq" className="hover:text-[#2D2A26] transition-colors">FAQ</a>
        </nav>

        {/* RSVP Action */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenRsvp}
            className="text-[12px] tracking-[0.2em] uppercase font-semibold bg-[#2D2A26] text-[#FAF7F2] px-5 py-2.5 rounded-full hover:bg-[#48433C] transition-all duration-300 shadow-sm hover:shadow active:scale-95"
          >
            Submit RSVP
          </button>
        </div>
      </div>
    </motion.header>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Footer({ onOpenRsvp }) {
  return (
    <footer className="relative min-h-[85vh] flex flex-col justify-between p-8 md:p-16 lg:p-20 overflow-hidden text-white">
      {/* Background High-Res Image with Dark Romantic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/footer.webp"
          alt="Jed and Vange celebration"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
      </div>

      {/* Top Bar inside Footer */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-8">
        <span className="font-serif text-3xl tracking-widest">J&V</span>
        <button
          onClick={onOpenRsvp}
          className="text-xs uppercase tracking-[0.2em] font-semibold px-6 py-2.5 rounded-full bg-white text-[#2D2A26] hover:bg-white/90 transition-all shadow-md active:scale-95"
        >
          Submit RSVP
        </button>
      </div>

      {/* Center Cinematic Quote */}
      <div className="relative z-10 max-w-4xl my-auto py-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight text-white/95"
        >
          "you’re my favorite person to do anything with for the rest of my life."
        </motion.p>
      </div>

      {/* Bottom Bar Details */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-white/20 text-xs text-white/70 tracking-wider">
        <div>
          <span>Cecil Green Park House · Vancouver, BC · June 18, 2027</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
          <span>· Cordially Motion Experience</span>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const marqueeImages = [
  { src: '/images/hero.webp', shape: 'forward' },
  { src: '/images/story-1-1.webp', shape: 'reverse' },
  { src: '/images/details-travel.webp', shape: 'forward' },
  { src: '/images/story-1-2.webp', shape: 'reverse' },
  { src: '/images/venue.webp', shape: 'forward' },
  { src: '/images/story-1-3.webp', shape: 'reverse' },
  { src: '/images/details-dining.webp', shape: 'forward' },
  { src: '/images/details-parties.webp', shape: 'reverse' }
];

export default function HeroMarquee({ onOpenRsvp }) {
  // Triple the list for an uninterrupted seamless infinite loop
  const displayImages = [...marqueeImages, ...marqueeImages, ...marqueeImages];

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-[#FAF7F2]">
      {/* Title & Invitation Header */}
      <div className="max-w-4xl mx-auto px-6 text-center z-10">
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[12px] md:text-[14px] tracking-[0.28em] uppercase text-[#7D7569] mb-4 font-medium"
        >
          you're cordially invited to celebrate the story of...
        </motion.p>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#2D2A26] tracking-tight leading-[0.88] font-normal"
        >
          Jed & Vange
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[#5E574D] text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed tracking-wide"
        >
          Cecil Green Park House · Vancouver, British Columbia
          <br />
          <span className="font-serif italic text-xl text-[#3A352F]">June 18, 2027</span>
        </motion.p>
      </div>

      {/* Pillar Marquee with Frosted Edge Masks */}
      <div className="relative w-full my-10 overflow-hidden select-none">
        {/* Left Progressive Frosted Edge Mask */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-24 md:w-48 z-20 pointer-events-none backdrop-blur-md"
          style={{
            background: 'linear-gradient(90deg, #FAF7F2 15%, rgba(250, 247, 242, 0.4) 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, #000 30%, transparent 100%)',
            maskImage: 'linear-gradient(90deg, #000 30%, transparent 100%)'
          }}
        />

        {/* Right Progressive Frosted Edge Mask */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-24 md:w-48 z-20 pointer-events-none backdrop-blur-md"
          style={{
            background: 'linear-gradient(270deg, #FAF7F2 15%, rgba(250, 247, 242, 0.4) 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(270deg, #000 30%, transparent 100%)',
            maskImage: 'linear-gradient(270deg, #000 30%, transparent 100%)'
          }}
        />

        {/* The Animated Pillar Track */}
        <div className="flex gap-4 md:gap-6 w-max animate-pillar-marquee">
          {displayImages.map((item, index) => {
            const isForward = item.shape === 'forward';
            const radiusClass = isForward 
              ? 'rounded-tl-[70px] rounded-br-[70px] rounded-tr-[14px] rounded-bl-[14px]' 
              : 'rounded-tr-[70px] rounded-bl-[70px] rounded-tl-[14px] rounded-br-[14px]';

            return (
              <div
                key={index}
                className={`relative w-[150px] md:w-[220px] lg:w-[260px] h-[260px] md:h-[380px] lg:h-[450px] flex-none overflow-hidden bg-[#ECE6DC] shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-transform duration-500 hover:scale-[1.02] ${radiusClass}`}
              >
                <img
                  src={item.src}
                  alt="Wedding memory"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading={index < 8 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Down Cue */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="flex flex-col items-center justify-center text-[#8C8477] text-xs tracking-[0.25em] uppercase"
      >
        <span className="mb-2">Explore the album</span>
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-[#8C8477]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

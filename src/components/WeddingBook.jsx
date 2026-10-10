import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const bookSpreads = [
  {
    left: {
      tag: "The Prelude",
      title: "Jed & Vange",
      subtitle: "A story written over a thousand small moments.",
      date: "EST. 2019",
      quote: "Every love story is beautiful, but ours is our favorite."
    },
    right: {
      type: "image",
      src: "/images/hero.webp",
      caption: "Our first weekend together in Vancouver",
      year: "2019"
    }
  },
  {
    left: {
      chapter: "Chapter One",
      title: "How We Met",
      text: "We met at university, became fast friends, and eventually realized the best parts of every week were the parts we spent together.",
      notes: "First year on campus · Coffee between classes · The start of everything"
    },
    right: {
      type: "image",
      src: "/images/story-1-1.webp",
      caption: "Library steps & endless conversations",
      year: "2020"
    }
  },
  {
    left: {
      chapter: "Chapter Two",
      title: "Falling in Love",
      text: "Toronto became our home base for late dinners, weekend walks, shared routines, and all of the small moments that made life feel bigger.",
      notes: "A favorite city corner · Weekends downtown · Our everyday ritual"
    },
    right: {
      type: "image",
      src: "/images/story-1-2.webp",
      caption: "Late summer evening on the terrace",
      year: "2023"
    }
  },
  {
    left: {
      chapter: "Chapter Three",
      title: "The Next Step",
      text: "A trip, a question, a very easy yes, and suddenly the future we had been imagining became something we could invite everyone into.",
      notes: "The weekend away · Right after yes · Celebrating together"
    },
    right: {
      type: "image",
      src: "/images/story-1-3.webp",
      caption: "Just moments after she said yes",
      year: "2026"
    }
  }
];

export default function WeddingBook() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');
  const bookRef = useRef(null);

  // 3D Tilt Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Damped springs for smooth physical inertia
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 18 });
  const bookLift = useSpring(0, { stiffness: 150, damping: 20 });

  const handlePointerMove = (e) => {
    if (!bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerEnter = () => {
    bookLift.set(1);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    bookLift.set(0);
  };

  const goToNext = () => {
    if (currentSpread < bookSpreads.length - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread((prev) => prev + 1);
        setIsFlipping(false);
      }, 500);
    }
  };

  const goToPrev = () => {
    if (currentSpread > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread((prev) => prev - 1);
        setIsFlipping(false);
      }, 500);
    }
  };

  const spread = bookSpreads[currentSpread];

  return (
    <section id="book" className="relative py-24 md:py-32 px-4 md:px-8 bg-[#FAF7F2] overflow-hidden select-none">
      {/* Section Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#786F62] text-[11px] tracking-[0.25em] uppercase mb-4">
          <Sparkles className="w-3 h-3 text-[#A89884]" />
          Interactive 3D Album
        </div>
        <h2 className="font-serif text-4xl md:text-6xl text-[#2D2A26] font-normal leading-tight">
          Flip Through Our Story
        </h2>
        <p className="mt-3 text-sm md:text-base text-[#6E665A] font-light">
          Move your cursor to tilt the album in 3D space, or click to turn the pages.
        </p>
      </div>

      {/* 3D Stage Container */}
      <div 
        className="max-w-5xl mx-auto perspective-1750 flex flex-col items-center"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {/* The 3D Physical Book */}
        <motion.div
          ref={bookRef}
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            transformStyle: "preserve-3d"
          }}
          className="relative w-full max-w-[960px] aspect-[1536/900] md:aspect-[1536/820] cursor-grab active:cursor-grabbing transition-shadow duration-300"
        >
          {/* Layer 1: Diffuse Ambient Floor Shadow */}
          <div 
            className="absolute -inset-8 z-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(50% 50% at 50% 60%, rgba(58,44,26,0.28) 0%, rgba(58,44,26,0.12) 45%, transparent 75%)',
              filter: 'blur(32px)'
            }}
          />

          {/* Layer 2: Contact Edge Shadow */}
          <div 
            className="absolute inset-x-8 bottom-[-15px] h-12 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(44,32,14,0.35) 0%, transparent 80%)',
              filter: 'blur(12px)'
            }}
          />

          {/* Layer 3: Realistic Book Shell Texture & Rim */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none rounded-[16px] overflow-hidden"
            style={{
              backgroundImage: 'url(/images/book-shell.webp)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              boxShadow: '0 24px 60px rgba(45,42,38,0.22), 0 4px 12px rgba(45,42,38,0.1)'
            }}
          />

          {/* Inside Book Pages Spread */}
          <div className="absolute inset-[3.2%] z-20 grid grid-cols-2 rounded-[10px] overflow-hidden bg-[#FBF8F3]">
            {/* Paper Texture Overlay */}
            <div 
              className="absolute inset-0 z-30 pointer-events-none opacity-40 mix-blend-multiply"
              style={{
                backgroundImage: 'url(/images/paper-texture.webp)',
                backgroundSize: 'cover'
              }}
            />

            {/* Spine Center Fold Shadow & Crease */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-12 z-25 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(60,40,20,0.16) 0%, rgba(60,40,20,0.02) 40%, rgba(60,40,20,0.22) 50%, rgba(60,40,20,0.02) 60%, rgba(60,40,20,0.16) 100%)'
              }}
            />

            {/* LEFT PAGE */}
            <div className="relative p-6 md:p-12 lg:p-14 flex flex-col justify-between border-r border-[#E8DFD1]/60">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`left-${currentSpread}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col justify-between"
                >
                  {spread.left.tag ? (
                    // Cover Spread
                    <div className="my-auto text-center px-4">
                      <span className="text-[11px] tracking-[0.3em] uppercase text-[#8A7F70] font-medium block mb-3">
                        {spread.left.tag}
                      </span>
                      <h3 className="font-serif text-4xl md:text-6xl text-[#2D2A26] font-normal leading-tight">
                        {spread.left.title}
                      </h3>
                      <div className="w-10 h-[1px] bg-[#C8BCAB] mx-auto my-6" />
                      <p className="text-sm md:text-base text-[#655E53] font-light leading-relaxed max-w-xs mx-auto">
                        {spread.left.subtitle}
                      </p>
                      <p className="font-serif italic text-lg md:text-xl text-[#7F7363] mt-8">
                        "{spread.left.quote}"
                      </p>
                    </div>
                  ) : (
                    // Chapter Spread
                    <div>
                      <span className="text-[11px] tracking-[0.3em] uppercase text-[#968977] font-semibold block mb-2">
                        {spread.left.chapter}
                      </span>
                      <h3 className="font-serif text-3xl md:text-5xl text-[#2D2A26] font-normal leading-tight mb-6">
                        {spread.left.title}
                      </h3>
                      <p className="text-xs md:text-sm lg:text-base text-[#524B42] font-light leading-relaxed">
                        {spread.left.text}
                      </p>
                      <div className="mt-8 pt-6 border-t border-[#EAE2D5] text-[11px] tracking-[0.16em] uppercase text-[#877C6D]">
                        {spread.left.notes}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] tracking-[0.25em] uppercase text-[#A89E90] pt-4">
                    Page {currentSpread * 2 + 1}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT PAGE */}
            <div className="relative p-6 md:p-12 lg:p-14 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`right-${currentSpread}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col justify-between"
                >
                  {/* Photo Frame with subtle cream border and shadow */}
                  <div className="relative w-full h-[76%] rounded-[6px] overflow-hidden bg-[#ECE6DC] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-2 bg-[#FCFAF7] border border-[#EBE4D8]">
                    <img
                      src={spread.right.src}
                      alt={spread.right.caption}
                      className="w-full h-full object-cover rounded-[4px]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A7164] pt-4 border-t border-[#EAE2D5]">
                    <span className="italic font-serif text-sm text-[#4E473D]">{spread.right.caption}</span>
                    <span className="tracking-[0.2em] uppercase font-mono text-[10px]">{spread.right.year}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Page Turn Controls */}
        <div className="flex items-center gap-6 mt-8 z-30">
          <button
            onClick={goToPrev}
            disabled={currentSpread === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-[#D9CEBF] text-xs tracking-[0.2em] uppercase font-medium transition-all ${
              currentSpread === 0 
                ? 'opacity-30 cursor-not-allowed text-[#A89E90]' 
                : 'hover:bg-[#2D2A26] hover:text-[#FAF7F2] hover:border-[#2D2A26] text-[#4F493F]'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          {/* Spread Indicator Dots */}
          <div className="flex gap-2">
            {bookSpreads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSpread(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSpread === i 
                    ? 'w-6 bg-[#2D2A26]' 
                    : 'w-2 bg-[#D1C5B4] hover:bg-[#A89A86]'
                }`}
                aria-label={`Go to spread ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentSpread === bookSpreads.length - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-[#D9CEBF] text-xs tracking-[0.2em] uppercase font-medium transition-all ${
              currentSpread === bookSpreads.length - 1 
                ? 'opacity-30 cursor-not-allowed text-[#A89E90]' 
                : 'hover:bg-[#2D2A26] hover:text-[#FAF7F2] hover:border-[#2D2A26] text-[#4F493F]'
            }`}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

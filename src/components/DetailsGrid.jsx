import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const detailCards = [
  {
    id: "parties",
    title: "Wedding Parties",
    subtitle: "Meet our favorite people.",
    image: "/images/details-parties.webp",
    detail: "Our bridal party and groomsmen have stood with us through every milestone. Look out for them on the day—they are the ones making sure glasses stay full and energy stays high!"
  },
  {
    id: "travel",
    title: "Travel Logistics",
    subtitle: "Plan your trip and stay.",
    image: "/images/details-travel.webp",
    detail: "For guests arriving from out of town, we recommend flying into Vancouver International Airport (YVR). We have hotel room blocks reserved downtown and near UBC."
  },
  {
    id: "registry",
    title: "Registry",
    subtitle: "Your presence is enough, but if you insist...",
    image: "/images/details-registry.webp",
    detail: "Having you celebrate with us is the greatest gift of all. For those wishing to honor us with a gift, we have created a honeymoon fund to help us explore Japan in 2028."
  },
  {
    id: "dresscode",
    title: "Dress Code",
    subtitle: "Summer garden party vibes.",
    image: "/images/details-dresscode.webp",
    detail: "For the ladies: tea or floor length dresses in cheerful florals or pastel tones. For the gentlemen: tailored suits or dress shirts with linen accents. Bring a light layer for the evening breeze!"
  },
  {
    id: "dining",
    title: "Dinner Menu",
    subtitle: "A quick look at what we are serving.",
    image: "/images/details-dining.webp",
    detail: "A family-style feast featuring Pacific Northwest salmon, braised short ribs, seasonal heirloom vegetables, and late-night wood-fired snacks."
  },
  {
    id: "music",
    title: "Music",
    subtitle: "Cocktail hour and dance party playlists.",
    image: "/images/details-music.webp",
    detail: "From acoustic ceremony strings to late-night dance floor anthems, the playlist is carefully curated. Feel free to submit your favorite track with your RSVP!"
  }
];

export default function DetailsGrid() {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <section id="details" className="py-24 md:py-32 bg-[#FAF7F2] border-t border-[#EFE8DD]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[12px] tracking-[0.28em] uppercase text-[#857B6C] font-semibold block mb-3">
            and now some additional details...
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-[#2D2A26] font-normal tracking-tight">
            The Weekend Guide
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#665D4F] font-light">
            The people, places, and practical details that will make the celebration effortless.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {detailCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedCard(card)}
              className="group cursor-pointer rounded-[22px] overflow-hidden bg-[#FAF7F2] border border-[#E9E0D2] shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/11] overflow-hidden bg-[#ECE6DC]">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <h3 className="font-serif text-2xl md:text-3xl text-[#2D2A26] font-normal mb-1.5 group-hover:text-[#64594A] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-[#736A5D] font-light leading-relaxed">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Popup for Details */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="absolute inset-0 bg-[#2D2A26]/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-[#FAF7F2] rounded-[24px] overflow-hidden shadow-2xl z-10 border border-[#EBE3D5] p-8 md:p-10"
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#EFE9DF] text-[#4F473D] flex items-center justify-center hover:bg-[#E2D8C9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[11px] tracking-[0.25em] uppercase text-[#8F8372] font-semibold block mb-2">
                Event Detail
              </span>

              <h3 className="font-serif text-3xl md:text-4xl text-[#2D2A26] font-normal mb-4">
                {selectedCard.title}
              </h3>

              <div className="w-10 h-[1px] bg-[#D4C8B6] mb-6" />

              <p className="text-sm md:text-base text-[#564E43] font-light leading-relaxed mb-6">
                {selectedCard.detail}
              </p>

              <div className="text-right">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-6 py-2.5 rounded-full bg-[#2D2A26] text-[#FAF7F2] text-xs tracking-[0.18em] uppercase font-semibold hover:bg-[#453F36] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

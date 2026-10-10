import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';

export default function VenueSection({ onOpenRsvp }) {
  return (
    <section id="venue" className="py-24 md:py-32 bg-[#F5EFE6] border-t border-[#E8DFC8]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[12px] tracking-[0.28em] uppercase text-[#7D7364] font-medium block mb-3">
            so please join us...
          </span>
          <h2 className="font-serif text-5xl md:text-7xl text-[#2D2A26] font-normal tracking-tight">
            June 18, 2027
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#61584C] font-light">
            Ceremony in the garden, followed by cocktails and dancing on the terrace.
          </p>
        </div>

        {/* Venue Card Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] overflow-hidden bg-[#FAF7F2] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E4D9C8]"
        >
          {/* High-res Venue Image */}
          <div className="relative h-[340px] md:h-[500px] w-full overflow-hidden">
            <img
              src="/images/venue.webp"
              alt="Cecil Green Park House"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/80 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
              <span className="text-xs tracking-[0.25em] uppercase text-white/80 block mb-1">
                The Venue
              </span>
              <h3 className="font-serif text-3xl md:text-5xl font-normal text-white">
                Cecil Green Park House
              </h3>
            </div>
          </div>

          {/* Details & Location Row */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 text-[#4D463C]">
                <MapPin className="w-5 h-5 text-[#8F816E] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-base text-[#2D2A26]">Cecil Green Park House</div>
                  <div className="text-sm text-[#6C6356]">6251 Cecil Green Park Rd, Vancouver, BC</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-[#4D463C]">
                <Calendar className="w-5 h-5 text-[#8F816E] flex-shrink-0" />
                <span className="text-sm text-[#6C6356]">
                  Friday, June 18, 2027 · Guest arrival at 3:45 PM
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <a
                href="https://maps.google.com/?q=6251+Cecil+Green+Park+Rd+Vancouver+BC"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#D5C9B8] text-xs tracking-[0.2em] uppercase font-medium text-[#463F34] hover:bg-[#FAF0E2] transition-colors w-full sm:w-auto"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onOpenRsvp}
                className="flex items-center justify-center px-7 py-3 rounded-full bg-[#2D2A26] text-[#FAF7F2] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#433E37] transition-all shadow-md active:scale-95 w-full sm:w-auto"
              >
                Submit RSVP
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

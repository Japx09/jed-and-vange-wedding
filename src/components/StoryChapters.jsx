import React from 'react';
import { motion } from 'framer-motion';

const chapters = [
  {
    number: "01",
    tagline: "chapter one: how we met",
    title: "The Start of Everything",
    narrative: "We met at university, became fast friends, and eventually realized the best parts of every week were the parts we spent together.",
    photo: "/images/story-1-1.webp",
    milestones: ["First year on campus", "Coffee between classes", "Late night study sessions"]
  },
  {
    number: "02",
    tagline: "chapter two: falling in love",
    title: "City Life & Shared Routines",
    narrative: "Toronto became our home base for late dinners, weekend walks, shared routines, and all of the small moments that made life feel bigger.",
    photo: "/images/story-1-2.webp",
    milestones: ["A favorite city corner", "Weekends downtown", "Our everyday ritual"]
  },
  {
    number: "03",
    tagline: "chapter three: the next step",
    title: "A Very Easy Yes",
    narrative: "A trip, a question, a very easy yes, and suddenly the future we had been imagining became something we could invite everyone into.",
    photo: "/images/story-1-3.webp",
    milestones: ["The weekend away", "Right after yes", "Celebrating together"]
  }
];

export default function StoryChapters() {
  return (
    <section id="story" className="py-24 md:py-32 bg-[#FAF7F2] border-t border-[#EFE8DD]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="text-[12px] tracking-[0.28em] uppercase text-[#857B6C] font-semibold block mb-3">
            our story
          </span>
          <h2 className="font-serif text-5xl md:text-7xl text-[#2D2A26] font-normal tracking-tight">
            How It Began
          </h2>
          <div className="w-12 h-[1px] bg-[#CCC2B3] mx-auto mt-6" />
        </div>

        {/* Chapters Stack */}
        <div className="space-y-28 md:space-y-36">
          {chapters.map((ch, index) => {
            const isReversed = index % 2 === 1;

            return (
              <motion.div
                key={ch.number}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col ${
                  isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
                } items-center gap-10 md:gap-16 lg:gap-24`}
              >
                {/* Photo Card with Arched Border Radius and Subtle Lift */}
                <div className="w-full md:w-1/2">
                  <div className="relative group overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.06)] bg-[#ECE5DB] aspect-[4/5] border border-[#E8DFC8]">
                    <img
                      src={ch.photo}
                      alt={ch.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-[#8A7E6E] font-medium mb-3">
                    <span className="font-mono text-sm">{ch.number}</span>
                    <span>—</span>
                    <span>{ch.tagline}</span>
                  </div>

                  <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2D2A26] font-normal leading-[1.1] mb-6">
                    {ch.title}
                  </h3>

                  <p className="text-base md:text-lg text-[#5B5449] font-light leading-relaxed mb-8">
                    {ch.narrative}
                  </p>

                  {/* Bulleted Memory Pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {ch.milestones.map((item, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-full bg-[#EFE9DF] text-[#696155] text-xs tracking-wider uppercase font-medium border border-[#E3D9CB]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

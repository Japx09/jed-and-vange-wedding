import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Mail } from 'lucide-react';

const faqs = [
  {
    question: "When should I RSVP by?",
    answer: "Please RSVP by August 20, 2027 so we can finalize our guest counts and seating arrangements with the venue."
  },
  {
    question: "What is the dress code?",
    answer: "Think Summer Garden Party! For the ladies: tea or floor length dresses; bright florals and soft pastel tones are warmly welcomed. For the gentlemen: tailored suits or dress shirts with light or linen colors. Wear comfortable footwear suited for outdoor garden walkways!"
  },
  {
    question: "Is the wedding indoors or outdoors?",
    answer: "Our ceremony will take place outdoors in the Cecil Green garden, followed by drinks and dinner on the covered terrace. In the rare event of inclement weather, the venue has an indoor fireside hall ready to go."
  },
  {
    question: "Can I bring a plus-one or children?",
    answer: "Due to venue capacity, our guest list is intimate and attendance is reserved for those specifically listed on your invitation. When you submit your RSVP, your household count will appear automatically."
  },
  {
    question: "What time should I arrive?",
    answer: "Please plan to arrive around 3:45 PM—about 15 minutes before the ceremony begins at 4:00 PM—so everyone has time to find a seat and grab a welcome beverage."
  },
  {
    question: "Are dietary restrictions accommodated?",
    answer: "Yes, absolutely! Please indicate any dietary restrictions, allergies, or vegetarian/vegan preferences when submitting your RSVP, and our chef will prepare a tailored course for you."
  },
  {
    question: "Is parking available at the venue?",
    answer: "Yes, complimentary parking is available on-site at Cecil Green Park House. Rideshares (Uber and Lyft) can drop off directly at the main circular driveway."
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#FAF7F2] border-t border-[#EFE8DD]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-[12px] tracking-[0.28em] uppercase text-[#857B6C] font-semibold block mb-3">
            Q&A
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-[#2D2A26] font-normal tracking-tight">
            Questions & Answers
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#665D4F] font-light flex items-center justify-center gap-2">
            <span>Can't find the answer here?</span>
            <a 
              href="mailto:jimandpam@example.com?subject=Wedding%20Question" 
              className="underline underline-offset-4 text-[#2D2A26] font-medium hover:opacity-70 transition-opacity inline-flex items-center gap-1"
            >
              Reach out to Jed or Vange <Mail className="w-3.5 h-3.5 inline" />
            </a>
          </p>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-[#EAE2D5] border-y border-[#EAE2D5]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={idx} className="py-6 md:py-8 transition-colors">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left gap-6 group"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-2xl md:text-3xl text-[#2D2A26] group-hover:text-[#64594A] transition-colors">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#D9CFC1] flex items-center justify-center flex-shrink-0 text-[#6B6153] group-hover:border-[#2D2A26] group-hover:text-[#2D2A26] transition-all">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm md:text-base text-[#5B5449] font-light leading-relaxed max-w-2xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

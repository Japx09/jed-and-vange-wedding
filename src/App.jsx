import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroMarquee from './components/HeroMarquee';
import WeddingBook from './components/WeddingBook';
import StoryChapters from './components/StoryChapters';
import VenueSection from './components/VenueSection';
import DetailsGrid from './components/DetailsGrid';
import FaqAccordion from './components/FaqAccordion';
import RsvpModal from './components/RsvpModal';
import Footer from './components/Footer';

export default function App() {
  const [rsvpOpen, setRsvpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] selection:bg-[#EAE0D2]">
      {/* Top Floating Navbar with Backdrop Blur */}
      <Navbar onOpenRsvp={() => setRsvpOpen(true)} />

      <main>
        {/* Pillar Marquee Hero */}
        <HeroMarquee onOpenRsvp={() => setRsvpOpen(true)} />

        {/* Interactive 3D Wedding Book (Tilt Physics + Page Flip) */}
        <WeddingBook />

        {/* Narrative Chapters Timeline */}
        <StoryChapters />

        {/* Date & Venue Presentation */}
        <VenueSection onOpenRsvp={() => setRsvpOpen(true)} />

        {/* Event Details Bento Grid */}
        <DetailsGrid />

        {/* Interactive FAQ Accordion */}
        <FaqAccordion />
      </main>

      {/* Cinematic Full-Bleed Photo Footer */}
      <Footer onOpenRsvp={() => setRsvpOpen(true)} />

      {/* RSVP Modal with Confetti Celebration */}
      <RsvpModal isOpen={rsvpOpen} onClose={() => setRsvpOpen(false)} />
    </div>
  );
}

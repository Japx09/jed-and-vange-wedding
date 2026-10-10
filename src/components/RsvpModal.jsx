import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RsvpModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attending: 'yes',
    guestCount: 1,
    dietary: '',
    songRequest: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Save locally
      try {
        const existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        existing.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('wedding_rsvps', JSON.stringify(existing));
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
      setSubmitted(true);

      // Trigger warm champagne celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FAF7F2', '#A38756', '#52432B']
      });
    }, 700);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleReset}
        className="absolute inset-0 bg-[#2D2A26]/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-[28px] overflow-hidden shadow-2xl z-10 border border-[#E8DFD1] p-8 md:p-10 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={handleReset}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#EFE9DF] text-[#4F473D] flex items-center justify-center hover:bg-[#E2D8C9] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#8F8372] font-semibold block mb-2">
                Response Card
              </span>
              <h3 className="font-serif text-3xl md:text-4xl text-[#2D2A26] font-normal">
                Join the Celebration
              </h3>
              <p className="text-xs md:text-sm text-[#6C6356] font-light mt-2">
                Kindly respond by August 20, 2027
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#635B50] font-medium mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jed Halpert"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD4C5] text-sm text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#635B50] font-medium mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., jim@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD4C5] text-sm text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] transition-colors"
                />
              </div>

              {/* Attendance Toggle */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#635B50] font-medium mb-1.5">
                  Will you be attending? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, attending: 'yes' })}
                    className={`py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold border transition-all ${
                      formData.attending === 'yes'
                        ? 'bg-[#2D2A26] text-[#FAF7F2] border-[#2D2A26]'
                        : 'bg-white text-[#5F584C] border-[#DDD4C5] hover:bg-[#F3EFE9]'
                    }`}
                  >
                    Accepts with pleasure
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, attending: 'no' })}
                    className={`py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold border transition-all ${
                      formData.attending === 'no'
                        ? 'bg-[#2D2A26] text-[#FAF7F2] border-[#2D2A26]'
                        : 'bg-white text-[#5F584C] border-[#DDD4C5] hover:bg-[#F3EFE9]'
                    }`}
                  >
                    Declines with regret
                  </button>
                </div>
              </div>

              {formData.attending === 'yes' && (
                <>
                  {/* Guest Count */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#635B50] font-medium mb-1.5">
                      Number of Guests (including yourself)
                    </label>
                    <select
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD4C5] text-sm text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] transition-colors"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                    </select>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#635B50] font-medium mb-1.5">
                      Dietary Restrictions or Allergies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vegetarian, Gluten-Free, No Shellfish"
                      value={formData.dietary}
                      onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD4C5] text-sm text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] transition-colors"
                    />
                  </div>

                  {/* Song Request */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#635B50] font-medium mb-1.5">
                      Song Request for the Dance Floor
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. September - Earth, Wind & Fire"
                      value={formData.songRequest}
                      onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD4C5] text-sm text-[#2D2A26] focus:outline-none focus:border-[#2D2A26] transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#2D2A26] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#453F36] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-6"
              >
                {loading ? 'Submitting RSVP...' : 'Confirm Response'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#E8E1D2] text-[#2D2A26] flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-3xl md:text-4xl text-[#2D2A26] font-normal mb-3">
              {formData.attending === 'yes' ? 'We Can’t Wait!' : 'You Will Be Missed!'}
            </h3>

            <p className="text-sm text-[#61574A] font-light leading-relaxed max-w-sm mx-auto mb-8">
              {formData.attending === 'yes'
                ? `Thank you, ${formData.name}. Your RSVP has been confirmed for June 18, 2027 at Cecil Green Park House.`
                : `Thank you for letting us know, ${formData.name}. We will be thinking of you on our special day!`}
            </p>

            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-full bg-[#2D2A26] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#433D35] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

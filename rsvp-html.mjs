export const rsvpHtml = `<!-- RSVP Section -->
<div id="rsvp-section-wrapper" class="w-full py-16 md:py-24" style="background-color: transparent;">
  <div class="mx-auto max-w-3xl px-4 sm:px-6">
    <div class="rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl transition-all duration-300" style="background-color: rgba(255, 250, 241, 0.94); border: 1px solid rgba(138, 90, 43, 0.18); backdrop-filter: blur(12px); box-shadow: 0 20px 50px rgba(47, 36, 27, 0.08);">
      
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-10">
        <h2 class="template-font-heading text-4xl sm:text-5xl md:text-6xl tracking-tight mb-3" style="color: #2f241b;">RSVP</h2>
        <div class="flex items-center justify-center gap-3 my-2">
          <span class="h-[1px] w-8 sm:w-12" style="background-color: rgba(138, 90, 43, 0.3);"></span>
          <p class="text-xs sm:text-sm font-medium uppercase tracking-[0.22em]" style="color: #8a5a2b;">Kindly respond by October 30, 2026</p>
          <span class="h-[1px] w-8 sm:w-12" style="background-color: rgba(138, 90, 43, 0.3);"></span>
        </div>
        <p class="text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed" style="color: #76614d;">
          We can’t wait to celebrate our union with you. Please confirm your attendance below so we can prepare your seat.
        </p>
      </div>

      <!-- Form Container -->
      <form id="wedding-rsvp-form" class="space-y-6" onsubmit="window.handleRsvpSubmit(event)">
        <!-- Full Name -->
        <div>
          <label for="rsvp-full-name" class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #2f241b;">
            Full Name(s) <span style="color: #8a5a2b;">*</span>
          </label>
          <input 
            type="text" 
            id="rsvp-full-name" 
            name="fullName" 
            required 
            placeholder="e.g. Maria Clara & Juan Dela Cruz" 
            class="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none" 
            style="background-color: #ffffff; border: 1px solid rgba(47, 36, 27, 0.16); color: #2f241b;"
            onfocus="this.style.borderColor='#8a5a2b'; this.style.boxShadow='0 0 0 3px rgba(138, 90, 43, 0.14)';"
            onblur="this.style.borderColor='rgba(47, 36, 27, 0.16)'; this.style.boxShadow='none';"
          />
          <p class="text-[11px] mt-1.5" style="color: #76614d;">Please enter the names of all guests included in your party.</p>
        </div>

        <!-- Attendance Choice (Joyfully Accepts vs Regretfully Declines) -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #2f241b;">
            Will you be attending? <span style="color: #8a5a2b;">*</span>
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="attendance-options" style="display: grid; gap: 14px;">
            <label class="rsvp-radio-card relative flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200" style="background-color: rgba(138, 90, 43, 0.06); border-color: #8a5a2b; display: flex; align-items: center; padding: 16px 20px; border-radius: 14px; cursor: pointer;" onclick="window.selectAttendance('Joyfully Accepts', this)">
              <input type="radio" name="attendance" value="Joyfully Accepts" checked style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" />
              <div class="rsvp-radio-circle flex items-center justify-center shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200" style="border-color: #8a5a2b; background-color: #ffffff; width: 22px; height: 22px; min-width: 22px; min-height: 22px; margin-right: 18px; flex-shrink: 0; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border-width: 2px;">
                <div class="rsvp-radio-dot w-2.5 h-2.5 rounded-full transition-all duration-200" style="background-color: #8a5a2b; opacity: 1; transform: scale(1); width: 10px; height: 10px; border-radius: 9999px;"></div>
              </div>
              <div style="flex: 1;">
                <span class="block text-sm font-medium" style="color: #2f241b; display: block; font-size: 15px; font-weight: 600; line-height: 1.3;">Joyfully Accepts</span>
                <span class="block text-[11px]" style="color: #76614d; display: block; font-size: 11px; margin-top: 4px; line-height: 1.3;">I will celebrate in person</span>
              </div>
            </label>
            <label class="rsvp-radio-card relative flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200" style="background-color: #ffffff; border-color: rgba(47, 36, 27, 0.16); display: flex; align-items: center; padding: 16px 20px; border-radius: 14px; cursor: pointer;" onclick="window.selectAttendance('Regretfully Declines', this)">
              <input type="radio" name="attendance" value="Regretfully Declines" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" />
              <div class="rsvp-radio-circle flex items-center justify-center shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200" style="border-color: rgba(47, 36, 27, 0.3); background-color: #ffffff; width: 22px; height: 22px; min-width: 22px; min-height: 22px; margin-right: 18px; flex-shrink: 0; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border-width: 2px;">
                <div class="rsvp-radio-dot w-2.5 h-2.5 rounded-full transition-all duration-200" style="background-color: #8a5a2b; opacity: 0; transform: scale(0); width: 10px; height: 10px; border-radius: 9999px;"></div>
              </div>
              <div style="flex: 1;">
                <span class="block text-sm font-medium" style="color: #2f241b; display: block; font-size: 15px; font-weight: 600; line-height: 1.3;">Regretfully Declines</span>
                <span class="block text-[11px]" style="color: #76614d; display: block; font-size: 11px; margin-top: 4px; line-height: 1.3;">Celebrating from afar</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Number of Guests -->
        <div id="guest-count-wrapper">
          <label for="rsvp-guest-count" class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #2f241b;">
            Total Number of Guests Attending <span style="color: #8a5a2b;">*</span>
          </label>
          <select 
            id="rsvp-guest-count" 
            name="guestCount" 
            class="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer" 
            style="background-color: #ffffff; border: 1px solid rgba(47, 36, 27, 0.16); color: #2f241b;"
            onfocus="this.style.borderColor='#8a5a2b'; this.style.boxShadow='0 0 0 3px rgba(138, 90, 43, 0.14)';"
            onblur="this.style.borderColor='rgba(47, 36, 27, 0.16)'; this.style.boxShadow='none';"
          >
            <option value="1">1 Guest (Self)</option>
            <option value="2" selected>2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5">5 Guests</option>
          </select>
          <p class="text-[11px] mt-1.5" style="color: #76614d;">Please kindly follow the allotted seats on your formal invitation.</p>
        </div>

        <!-- Dietary Restrictions -->
        <div>
          <label for="rsvp-dietary" class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #2f241b;">
            Dietary Restrictions or Food Allergies
          </label>
          <input 
            type="text" 
            id="rsvp-dietary" 
            name="dietary" 
            placeholder="e.g. None, Vegetarian, Seafood allergy" 
            class="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none" 
            style="background-color: #ffffff; border: 1px solid rgba(47, 36, 27, 0.16); color: #2f241b;"
            onfocus="this.style.borderColor='#8a5a2b'; this.style.boxShadow='0 0 0 3px rgba(138, 90, 43, 0.14)';"
            onblur="this.style.borderColor='rgba(47, 36, 27, 0.16)'; this.style.boxShadow='none';"
          />
        </div>

        <!-- Note / Message for Jed & Vange -->
        <div>
          <label for="rsvp-message" class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: #2f241b;">
            Message or Well Wishes for the Couple
          </label>
          <textarea 
            id="rsvp-message" 
            name="message" 
            rows="3" 
            placeholder="Share your prayers, love, or warm wishes for Jed & Vanj..." 
            class="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none resize-y" 
            style="background-color: #ffffff; border: 1px solid rgba(47, 36, 27, 0.16); color: #2f241b;"
            onfocus="this.style.borderColor='#8a5a2b'; this.style.boxShadow='0 0 0 3px rgba(138, 90, 43, 0.14)';"
            onblur="this.style.borderColor='rgba(47, 36, 27, 0.16)'; this.style.boxShadow='none';"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="pt-2 text-center">
          <button 
            type="submit" 
            id="rsvp-submit-btn" 
            class="w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center px-10 py-4 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer" 
            style="background-color: #8a5a2b; color: #fff9f1; box-shadow: 0 6px 20px rgba(138, 90, 43, 0.32);"
          >
            <span id="rsvp-btn-text">CONFIRM RSVP</span>
            <svg id="rsvp-btn-spinner" class="hidden animate-spin ml-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>

        <div id="rsvp-error-msg" class="hidden text-center text-xs font-medium text-red-600 mt-2"></div>
      </form>

      <!-- Success State (Shown after submission) -->
      <div id="rsvp-success-card" class="hidden text-center py-8 sm:py-12 px-4 space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl shadow-inner" style="background-color: rgba(138, 90, 43, 0.12); color: #8a5a2b;">
          🤍
        </div>
        <h3 class="template-font-heading text-3xl sm:text-4xl" style="color: #2f241b;">Thank You, <span id="rsvp-confirmed-name"></span>!</h3>
        <p id="rsvp-confirmed-detail" class="text-xs sm:text-sm max-w-md mx-auto leading-relaxed" style="color: #76614d;">
          Your RSVP has been saved to our guest list. We look forward to celebrating this special day together on December 8, 2026 at Zaycoland Resort!
        </p>
        <div class="pt-4">
          <button 
            type="button" 
            onclick="window.resetRsvpForm()" 
            class="text-xs uppercase tracking-wider underline cursor-pointer hover:opacity-80 transition-opacity" 
            style="color: #8a5a2b;"
          >
            Submit another response
          </button>
        </div>
      </div>

    </div>
  </div>
</div>`;

const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialCardsArray = Array.from(testimonialCards);

// Select a random element index
const randomIndex = Math.floor(Math.random() * testimonialCardsArray.length);

// Remove all elements except the randomly selected one
testimonialCardsArray.forEach((element, index) => {
  if (index !== randomIndex) {
    element.parentNode.removeChild(element);
  }
});

(function () {
// --- Config ---
const NEXT_ID = "testimonial-next-clickable-area";
const PREV_ID = "testimonial-prev-clickable-area"; // optional
const SLIDER_ID = "testimonial-slider";            // optional
const INTERVAL_MS = 4000;

// --- Helpers ---
function initOnceHammerLoaded() {
  document.addEventListener("DOMContentLoaded", () => {
    const next = document.getElementById(NEXT_ID);
    const prev =
      document.getElementById(PREV_ID) ||
      document.querySelector(".w-slider-arrow-left");
    const slider =
      document.getElementById(SLIDER_ID) ||
      document.querySelector(".w-slider");

    if (!slider || !next) return; // need at least slider + next

    let autoTimer = null;

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => {
        if (document.hidden) return; // don't advance when tab not visible
        // Programmatic click => e.isTrusted === false on listeners
        next.click();
      }, INTERVAL_MS);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    // Stop only on *real* arrow clicks (user initiated)
    function onArrowClick(e) {
      if (e.isTrusted) stopAuto();
    }
    next.addEventListener("click", onArrowClick, { passive: true });
    if (prev) prev.addEventListener("click", onArrowClick, { passive: true });

    // Hammer swipe detection (horizontal only)
    const hammertime = new Hammer(slider);
    // Optional: make it a bit less sensitive if you like:
    // hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10, velocity: 0.3 });
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    hammertime.on("swipeleft swiperight", function (ev) {
      // Real user gesture => stop autoplay
      stopAuto();
    });

    // Kick off autoplay
    startAuto();
  });
}

// --- Load Hammer if missing ---
if (window.Hammer) {
  initOnceHammerLoaded();
} 
// else {
//    const s = document.createElement("script");
//    s.src = "https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js";
//    s.onload = initOnceHammerLoaded;
//    document.head.appendChild(s);
//  }
})();

/* ==========================================================================
   Cholo Ghure Asssiii — Scene 1: Architectural Gate (js/scenes/gate.js)
   ERA Residence Behavior: Scroll-SCRUBBED double gate doors
   ========================================================================== */

export function initGateScene() {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn("[GateScene] GSAP or ScrollTrigger not available.");
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Timeline scrubbed strictly by scroll
  const gateTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#scene-gate",
      start: "top top",
      end: "+=130%",
      pin: true,
      scrub: 1.2,
      anticipatePin: 1
    }
  });

  // Part doors proportionally to scroll progress (0 -> 1)
  gateTimeline
    .to(".gate-door.left", { xPercent: -102, ease: "none" }, 0)
    .to(".gate-door.right", { xPercent: 102, ease: "none" }, 0)
    .to(".gate-scroll-cue", { opacity: 0, y: -20, ease: "none" }, 0)
    .to(".gate-hero-content", { scale: 1.12, opacity: 0, ease: "power1.in" }, 0.4);
}

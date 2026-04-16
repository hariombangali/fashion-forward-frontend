/**
 * Thin gradient bar pinned to top of viewport that fills as the user scrolls.
 * Uses Framer Motion's useScroll + scaleX for buttery-smooth rendering (no
 * re-renders on every scroll event — GPU-accelerated transform).
 */
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-brand-gradient pointer-events-none"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

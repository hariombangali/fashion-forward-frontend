/**
 * Floating "scroll to top" button. Appears after user scrolls past 400px.
 * Uses framer-motion for spring entry/exit. Gradient background + pulse ring.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={toTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-12 h-12 rounded-full bg-brand-gradient text-white shadow-lg flex items-center justify-center animate-pulse-ring"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

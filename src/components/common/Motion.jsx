/**
 * Reusable motion primitives.
 * All use `whileInView` so content animates as it scrolls into view.
 *
 * Usage:
 *   <FadeIn>...</FadeIn>
 *   <SlideUp delay={0.1}>...</SlideUp>
 *   <Stagger>
 *     <StaggerItem>A</StaggerItem>
 *     <StaggerItem>B</StaggerItem>
 *   </Stagger>
 */
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1]; // smooth, classy easing

export function FadeIn({ children, delay = 0, duration = 0.6, className = '', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0, duration = 0.7, y = 40, className = '', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ direction = 'left', children, delay = 0, duration = 0.7, distance = 60, className = '', ...rest }) {
  const offsets = {
    left:  { x: -distance, y: 0 },
    right: { x:  distance, y: 0 },
    up:    { x: 0, y:  distance },
    down:  { x: 0, y: -distance },
  };
  const initial = { opacity: 0, ...offsets[direction] };
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, duration = 0.6, className = '', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container — children animate one after another.
 * Use with <StaggerItem>.
 */
export function Stagger({ children, delayChildren = 0.1, staggerChildren = 0.08, className = '', ...rest }) {
  const variants = {
    hidden: {},
    show: {
      transition: { delayChildren, staggerChildren },
    },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, y = 30, className = '', ...rest }) {
  const variants = {
    hidden: { opacity: 0, y },
    show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };
  return (
    <motion.div variants={variants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Word-by-word headline reveal.
 * Pass the headline as a single string.
 */
export function AnimatedHeadline({ text, className = '', wordClassName = '', as: Tag = 'h1', delay = 0 }) {
  const words = String(text).split(' ');
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * 0.08, duration: 0.6, ease }}
          className={`inline-block mr-[0.25em] ${wordClassName}`}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

/**
 * Tilt-on-hover wrapper — mouse-tracking 3D tilt effect.
 * Lightweight, no external dep.
 */
export function Tilt({ children, max = 10, className = '', ...rest }) {
  const handleMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * 2 * max;
    const rotX = (0.5 - y) * 2 * max;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  };
  const handleLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
  };
  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.2s ease-out', transformStyle: 'preserve-3d' }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * CountUp — animated number from 0 → target when in view.
 */
import { useEffect, useRef, useState } from 'react';
export function CountUp({ end = 100, duration = 1.8, suffix = '', prefix = '', className = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const target = Number(end);
          const tick = (now) => {
            const p = Math.min((now - start) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

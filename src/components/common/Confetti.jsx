/**
 * Lightweight canvas-based confetti — no external dep.
 * Fires a burst on mount. Cleans up after the animation ends.
 *
 * Usage:
 *   <Confetti />            // fires once on mount
 *   <Confetti fire={bool} /> // refire when bool flips to true
 */
import { useEffect, useRef } from 'react';

const PALETTE = [
  '#ff5b7a', '#ffbf47', '#4ecdc4', '#6c63ff',
  '#ff9aa2', '#c9b1ff', '#7ae582', '#ffd166', '#ef476f',
];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function Confetti({ fire = true, count = 160, duration = 3600 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(DPR, DPR);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2 + randomBetween(-80, 80),
      y: window.innerHeight / 3 + randomBetween(-40, 40),
      vx: randomBetween(-6, 6),
      vy: randomBetween(-14, -6),
      g:  0.25,
      rot: randomBetween(0, Math.PI * 2),
      vRot: randomBetween(-0.2, 0.2),
      size: randomBetween(6, 12),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      life: 1,
    }));

    startedAt.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAt.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = Math.max(0, 1 - elapsed / duration);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        p.vx *= 0.995;
        p.rot += p.vRot;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [fire, count, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[70] pointer-events-none"
      aria-hidden="true"
    />
  );
}

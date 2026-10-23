import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  hue: number;
  targetHue: number;
}

// C++ cyan hue range — fixed, since C++ is the only supported language.
const CPP_HUE_RANGE: [number, number] = [185, 195];

// Decorative background, so it never needs to run at full 60fps — this alone
// roughly halves its CPU cost with no visible difference for slow drift.
const TARGET_FPS = 30;
const CALM_FPS = 18;          // while a visualizer is open, leave the CPU to the visualizer

const CONNECT_DIST = 130;
const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

export default function BackgroundCanvas({ calm = false }: { calm?: boolean }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const particles  = useRef<Particle[]>([]);
  const animRef    = useRef<number>(0);
  const targetHues = useRef<[number, number]>(CPP_HUE_RANGE);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const reduceMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initParticles() {
      const [h1, h2] = targetHues.current ?? [185, 195];
      // Capped a bit lower than before (110 -> 80) — the O(n^2) connection
      // check below grows with the square of this number, so trimming it
      // is the single biggest lever on how expensive every frame is.
      const count = Math.min(Math.floor(window.innerWidth * window.innerHeight / 9000), calm ? 28 : 80);
      particles.current = Array.from({ length: count }, (_, idx) => {
        const hue = idx % 2 === 0 ? h1 : h2;
        return {
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2.5 + 1,
          hue,
          targetHue: hue,
        };
      });
    }

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
      initParticles();
    }

    function drawFrame() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      const pts = particles.current;
      const [h1, h2] = targetHues.current ?? [185, 195];

      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas!.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;
        p.targetHue = i % 2 === 0 ? h1 : h2;
        const diff = ((p.targetHue - p.hue + 180) % 360) - 180;
        p.hue += diff * 0.015;
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const distSq = dx * dx + dy * dy;
          // Cheap squared-distance filter first — Math.sqrt only runs for
          // the (much smaller) set of pairs that are actually close enough
          // to draw a line between, instead of on every single pair.
          if (distSq < CONNECT_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${pts[i].hue},100%,60%,${(1 - dist / CONNECT_DIST) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `hsla(${pts[i].hue},100%,65%,.78)`;
        ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const FRAME_BUDGET_MS = 1000 / (calm ? CALM_FPS : TARGET_FPS);
    let lastFrameTime = 0;
    function animate(now: number) {
      animRef.current = requestAnimationFrame(animate);
      // Frame-rate throttle: skip work entirely if we're being called faster
      // than TARGET_FPS needs. requestAnimationFrame itself can't be told to
      // run slower, so this is the standard way to cap it.
      if (now - lastFrameTime < FRAME_BUDGET_MS) return;
      lastFrameTime = now;
      drawFrame();
    }

    resize();

    if (reduceMotion) {
      // Respect the user's OS-level motion preference: draw one static
      // frame instead of starting an animation loop at all.
      drawFrame();
    } else {
      animRef.current = requestAnimationFrame(animate);
    }

    // Stop burning CPU on a canvas nobody can see — switching tabs, minimizing
    // the window, or the phone screen locking all fire this.
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
      } else if (!reduceMotion) {
        lastFrameTime = 0;
        animRef.current = requestAnimationFrame(animate);
      }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animRef.current);
    };
  }, [calm]);

  return <canvas ref={canvasRef} id="bgCanvas" />;
}

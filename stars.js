(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector("[data-starfield]");
  const spotlight = document.querySelector("[data-spotlight]");

  if (spotlight) {
    const setSpot = (x, y) => {
      spotlight.style.setProperty("--spot-x", `${x}px`);
      spotlight.style.setProperty("--spot-y", `${y}px`);
    };

    setSpot(window.innerWidth * 0.58, window.innerHeight * 0.46);

    if (!reduceMotion) {
      let targetX = window.innerWidth * 0.58;
      let targetY = window.innerHeight * 0.46;
      let smoothX = targetX;
      let smoothY = targetY;
      let raf = 0;

      const move = (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      };

      const tick = () => {
        smoothX += (targetX - smoothX) * 0.09;
        smoothY += (targetY - smoothY) * 0.09;
        setSpot(smoothX, smoothY);
        raf = window.requestAnimationFrame(tick);
      };

      window.addEventListener("pointermove", move, { passive: true });
      raf = window.requestAnimationFrame(tick);
      window.addEventListener("pagehide", () => {
        window.removeEventListener("pointermove", move);
        window.cancelAnimationFrame(raf);
      }, { once: true });
    }
  }

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let stars = [];
  let raf = 0;
  const count = reduceMotion ? 90 : 150;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.58 + 0.18,
      vx: (Math.random() - 0.5) * 0.08,
      vy: Math.random() * 0.05 + 0.01,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      ctx.beginPath();
      ctx.globalAlpha = star.a;
      ctx.fillStyle = "#d7f3ff";
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) {
        star.x += star.vx;
        star.y += star.vy;
        if (star.y > height + 8) star.y = -8;
        if (star.x < -8) star.x = width + 8;
        if (star.x > width + 8) star.x = -8;
      }
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) raf = window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", () => {
    window.removeEventListener("resize", resize);
    window.cancelAnimationFrame(raf);
  }, { once: true });
})();

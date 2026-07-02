(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector("[data-starfield]");
  const spotlight = document.querySelector("[data-spotlight]");

  if (spotlight) {
    const setSpot = (x, y) => {
      spotlight.style.setProperty("--spot-x", x + "px");
      spotlight.style.setProperty("--spot-y", y + "px");
    };

    let targetX = window.innerWidth * 0.62;
    let targetY = window.innerHeight * 0.42;
    let smoothX = targetX;
    let smoothY = targetY;
    let spotlightRaf = 0;

    setSpot(targetX, targetY);

    if (!reduceMotion) {
      const move = (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      };

      const tick = () => {
        smoothX += (targetX - smoothX) * 0.09;
        smoothY += (targetY - smoothY) * 0.09;
        setSpot(smoothX, smoothY);
        spotlightRaf = window.requestAnimationFrame(tick);
      };

      window.addEventListener("pointermove", move, { passive: true });
      spotlightRaf = window.requestAnimationFrame(tick);

      window.addEventListener(
        "pagehide",
        () => {
          window.removeEventListener("pointermove", move);
          window.cancelAnimationFrame(spotlightRaf);
        },
        { once: true }
      );
    }
  }

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  let width = 0;
  let height = 0;
  let stars = [];
  let raf = 0;
  const starCount = reduceMotion ? 80 : 140;

  const rebuild = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.2,
      a: Math.random() * 0.6 + 0.16,
      vx: (Math.random() - 0.5) * 0.08,
      vy: Math.random() * 0.05 + 0.01,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      ctx.beginPath();
      ctx.globalAlpha = star.a;
      ctx.fillStyle = "#eef6ff";
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      star.x += star.vx;
      star.y += star.vy;

      if (star.y > height + 8) star.y = -8;
      if (star.x < -8) star.x = width + 8;
      if (star.x > width + 8) star.x = -8;
    }

    ctx.globalAlpha = 1;

    if (!reduceMotion) {
      raf = window.requestAnimationFrame(draw);
    }
  };

  rebuild();
  draw();
  window.addEventListener("resize", rebuild, { passive: true });

  window.addEventListener(
    "pagehide",
    () => {
      window.removeEventListener("resize", rebuild);
      window.cancelAnimationFrame(raf);
    },
    { once: true }
  );
})();

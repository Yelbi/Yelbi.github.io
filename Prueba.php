<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fondo Estelar Mejorado</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html,
    body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    canvas#spaceCanvas {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1;
      display: block;
    }
    .nebula {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      background: radial-gradient(
        circle at center,
        rgba(5, 5, 20, 0.9) 0%,
        rgba(1, 1, 10, 0.9) 40%,
        rgba(0, 0, 0, 1) 70%
      );
    }
  </style>
</head>
<body>
  <div class="nebula"></div>
  <canvas id="spaceCanvas"></canvas>
  <script>
    const canvas = document.getElementById("spaceCanvas");
    const ctx = canvas.getContext("2d");
    let stars = [], animId;

    const config = {
      starCount: 2000,
      rotationSpeed: 0.5,
      twinkleFactor: 0.3,
      baseSize: 1.5,
      fixedSize: 1.5,
      galaxyCenter: { x: 0, y: 0 },
    };

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      config.galaxyCenter = { x: w / 2, y: h / 2 };
    }

    function createStars(count) {
      stars = [];
      const maxOrbit = Math.hypot(window.innerWidth, window.innerHeight);
      for (let i = 0; i < count; i++) {
        const speed = Math.random() * 0.6 + 0.1;
        const depth = Math.random();
        const orbit = Math.random() * maxOrbit;
        stars.push({
          angle: Math.random() * 2 * Math.PI,
          orbit,
          speed,
          depth,
          color: `rgba(255,255,255,${Math.random() * 0.7 + 0.3})`,
          twinkleRate: Math.random() * 0.015 + 0.005,
          twinkleOffset: Math.random() * 2 * Math.PI,
        });
      }
    }

    function animate(ts = 0) {
      const now = ts * 0.001;
      const { x: cx, y: cy } = config.galaxyCenter;
      const { rotationSpeed, twinkleFactor, fixedSize } = config;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,5,0.08)";
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.angle += s.speed * rotationSpeed * 0.008;
        const dp = 0.4 + s.depth * 0.6;
        const x = cx + Math.cos(s.angle) * s.orbit * dp;
        const y = cy + Math.sin(s.angle) * s.orbit * dp;

        const tw = Math.sin(now * s.twinkleRate + s.twinkleOffset) * twinkleFactor * 0.5 + 0.5;
        const curSize = fixedSize * tw;

        if (x > -50 && x < w + 50 && y > -50 && y < h + 50) {
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(x, y, curSize, 0, 2 * Math.PI);
          ctx.fill();
          if (curSize > 1.5) {
            ctx.globalAlpha = 0.15 * tw;
            ctx.beginPath();
            ctx.arc(x, y, curSize * 1.8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
      animId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
      cancelAnimationFrame(animId);
      resizeCanvas();
      createStars(config.starCount);
      animate();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else animate();
    });

    resizeCanvas();
    createStars(config.starCount);
    animate();
  </script>
</body>
</html>

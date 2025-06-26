// Crear este archivo como JS/hole-animation.js

import easingUtils from "https://esm.sh/easing-utils";

class AHoleSection2 extends HTMLElement {
  connectedCallback() {
    // Elements
    this.canvas = this.querySelector(".js-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.discs = [];
    this.lines = [];
    this.isActive = false;
    this.animationId = null;

    // Init
    this.setSize();
    this.setDiscs();
    this.setLines();
    this.setParticles();

    this.bindEvents();

    // Observer para optimización
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.startAnimation();
          } else {
            this.stopAnimation();
          }
        });
      }, { threshold: 0.1 });

      this.observer.observe(this);
    } else {
      // Fallback para navegadores sin IntersectionObserver
      this.startAnimation();
    }
  }

  startAnimation() {
    if (!this.isActive) {
      this.isActive = true;
      this.tick();
    }
  }

  stopAnimation() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  bindEvents() {
    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    this.setSize();
    this.setDiscs();
    this.setLines();
    this.setParticles();
  }

  setSize() {
    this.rect = this.getBoundingClientRect();

    this.render = {
      width: this.rect.width,
      height: this.rect.height,
      dpi: window.devicePixelRatio
    };

    this.canvas.width = this.render.width * this.render.dpi;
    this.canvas.height = this.render.height * this.render.dpi;
  }

  setDiscs() {
    const { width, height } = this.rect;

    this.discs = [];

    this.startDisc = {
      x: width * 0.5,
      y: height * 0.45,
      w: width * 0.75,
      h: height * 0.7
    };

    this.endDisc = {
      x: width * 0.5,
      y: height * 0.95,
      w: 0,
      h: 0
    };

    const totalDiscs = 100;

    let prevBottom = height;
    this.clip = {};

    for (let i = 0; i < totalDiscs; i++) {
      const p = i / totalDiscs;

      const disc = this.tweenDisc({
        p
      });

      const bottom = disc.y + disc.h;

      if (bottom <= prevBottom) {
        this.clip = {
          disc: { ...disc },
          i
        };
      }

      prevBottom = bottom;

      this.discs.push(disc);
    }

    this.clip.path = new Path2D();
    this.clip.path.ellipse(
      this.clip.disc.x,
      this.clip.disc.y,
      this.clip.disc.w,
      this.clip.disc.h,
      0,
      0,
      Math.PI * 2
    );

    this.clip.path.rect(
      this.clip.disc.x - this.clip.disc.w,
      0,
      this.clip.disc.w * 2,
      this.clip.disc.y
    );
  }

  setLines() {
    const { width, height } = this.rect;

    this.lines = [];

    const totalLines = 100;
    const linesAngle = Math.PI * 2 / totalLines;

    for (let i = 0; i < totalLines; i++) {
      this.lines.push([]);
    }

    this.discs.forEach(disc => {
      for (let i = 0; i < totalLines; i++) {
        const angle = i * linesAngle;

        const p = {
          x: disc.x + Math.cos(angle) * disc.w,
          y: disc.y + Math.sin(angle) * disc.h
        };

        this.lines[i].push(p);
      }
    });

    this.linesCanvas = new OffscreenCanvas(width, height);
    const ctx = this.linesCanvas.getContext("2d");

    this.lines.forEach((line, i) => {
      ctx.save();

      let lineIsIn = false;
      line.forEach((p1, j) => {
        if (j === 0) {
          return;
        }

        const p0 = line[j - 1];

        if (
          !lineIsIn && (
            ctx.isPointInPath(this.clip.path, p1.x, p1.y) ||
            ctx.isPointInStroke(this.clip.path, p1.x, p1.y)
          )
        ) {
          lineIsIn = true;
        } else if (lineIsIn) {
          ctx.clip(this.clip.path);
        }

        ctx.beginPath();

        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);

        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.closePath();
      });

      ctx.restore();
    });

    this.linesCtx = ctx;
  }

  setParticles() {
    const { width, height } = this.rect;

    this.particles = [];

    this.particleArea = {
      sw: this.clip.disc.w * 0.5,
      ew: this.clip.disc.w * 2,
      h: height * 0.85
    };

    this.particleArea.sx = (width - this.particleArea.sw) / 2;
    this.particleArea.ex = (width - this.particleArea.ew) / 2;

    const totalParticles = 80;

    for (let i = 0; i < totalParticles; i++) {
      const particle = this.initParticle(true);
      this.particles.push(particle);
    }
  }

  initParticle(start = false) {
    const sx = this.particleArea.sx + this.particleArea.sw * Math.random();
    const ex = this.particleArea.ex + this.particleArea.ew * Math.random();
    const dx = ex - sx;
    const vx = 0.1 + Math.random() * 0.5;
    const y = start ? this.particleArea.h * Math.random() : this.particleArea.h;
    const r = 0.5 + Math.random() * 3;
    const vy = 0.5 + Math.random();

    return {
      x: sx,
      sx,
      dx,
      y,
      vy,
      p: 0,
      r,
      c: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`
    };
  }

  tweenValue(start, end, p, ease = false) {
    const delta = end - start;

    const easeFn =
      easingUtils[
        ease ? "ease" + ease.charAt(0).toUpperCase() + ease.slice(1) : "linear"
      ];

    return start + delta * easeFn(p);
  }

  drawDiscs() {
    const { ctx } = this;

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1.5;

    // Outer disc
    const outerDisc = this.startDisc;

    ctx.beginPath();

    ctx.ellipse(
      outerDisc.x,
      outerDisc.y,
      outerDisc.w,
      outerDisc.h,
      0,
      0,
      Math.PI * 2
    );

    ctx.stroke();
    ctx.closePath();

    // Discs
    this.discs.forEach((disc, i) => {
      if (i % 5 !== 0) {
        return;
      }

      if (disc.w < this.clip.disc.w - 5) {
        ctx.save();
        ctx.clip(this.clip.path);
      }

      ctx.beginPath();
      ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

      if (disc.w < this.clip.disc.w - 5) {
        ctx.restore();
      }
    });
  }

  drawLines() {
    const { ctx, linesCanvas } = this;
    ctx.drawImage(linesCanvas, 0, 0);
  }

  drawParticles() {
    const { ctx } = this;

    ctx.save();
    ctx.clip(this.clip.path);

    this.particles.forEach(particle => {
      ctx.fillStyle = particle.c;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  moveDiscs() {
    this.discs.forEach(disc => {
      disc.p = (disc.p + 0.001) % 1;
      this.tweenDisc(disc);
    });
  }

  moveParticles() {
    this.particles.forEach(particle => {
      particle.p = 1 - particle.y / this.particleArea.h;
      particle.x = particle.sx + particle.dx * particle.p;
      particle.y -= particle.vy;

      if (particle.y < 0) {
        const newParticle = this.initParticle();
        particle.y = newParticle.y;
        particle.x = newParticle.sx;
        particle.sx = newParticle.sx;
        particle.dx = newParticle.dx;
      }
    });
  }

  tweenDisc(disc) {
    disc.x = this.tweenValue(this.startDisc.x, this.endDisc.x, disc.p);
    disc.y = this.tweenValue(
      this.startDisc.y,
      this.endDisc.y,
      disc.p,
      "inExpo"
    );

    disc.w = this.tweenValue(this.startDisc.w, this.endDisc.w, disc.p);
    disc.h = this.tweenValue(this.startDisc.h, this.endDisc.h, disc.p);

    return disc;
  }

  tick() {
    if (!this.isActive) return;

    const { ctx } = this;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.scale(this.render.dpi, this.render.dpi);

    this.moveDiscs();
    this.moveParticles();

    this.drawDiscs();
    this.drawLines();
    this.drawParticles();

    ctx.restore();

    this.animationId = requestAnimationFrame(this.tick.bind(this));
  }

  disconnectedCallback() {
    this.stopAnimation();
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener("resize", this.onResize.bind(this));
  }
}

customElements.define("a-hole-section2", AHoleSection2);
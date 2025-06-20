<canvas id="starfield"></canvas>
<script>
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  // Ajustar tamaño
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.onresize = resize;
  resize();
  // Crear estrellas
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width
    });
  }
  // Animar
  function animate() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let s of stars) {
      s.z -= 2;
      if (s.z <= 0) {
        s.z = canvas.width;
        s.x = Math.random() * canvas.width;
        s.y = Math.random() * canvas.height;
      }
      const k  = 128.0 / s.z;
      const px = (s.x - canvas.width/2) * k + canvas.width/2;
      const py = (s.y - canvas.height/2) * k + canvas.height/2;
      const size = (1 - s.z/canvas.width) * 3;
      ctx.fillStyle = 'white';
      ctx.fillRect(px, py, size, size);
    }
    requestAnimationFrame(animate);
  }
  animate();
</script>

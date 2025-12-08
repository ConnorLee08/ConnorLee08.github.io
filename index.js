document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 2);

  const canvas = document.getElementById('backgroundCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const floaterLayer = document.getElementById('floaterLayer');

  const stars = [];

  const floaters = [];
  const FLOATER_MAX_VH = 0.09;
  const FLOATER_SRC = 'images/frank.gif';

  let floatersEnabled = false;


  function generateStars() {
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 2,
        color: "#aaaaaa",
      });
      setInterval(() => { twinkle(i); }, randomInt(7000, 11000));
    }
  }

  function drawStars() {
    for (const star of stars) {
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
  }


  function randomInt(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  function moveStars() {
    stars.forEach(star => {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = randomInt(0, canvas.width);
      }
    });
  }

  function scrollStars(mult, all) {
    if (all) {
      for (let i = 0; i < stars.length; i++) {
        stars[i].y += stars[i].speed * mult;
        if (stars[i].y > canvas.height) {
          stars[i].y = 0;
          stars[i].x = randomInt(0, canvas.width);
        } else if (stars[i].y < 0) {
          stars[i].y = canvas.height;
          stars[i].x = randomInt(0, canvas.width);
        }
      }
    } else {
      for (let i = 0; i < stars.length; i += 2) {
        stars[i].y += stars[i].speed * mult;
        if (stars[i].y > canvas.height) {
          stars[i].y = 0;
          stars[i].x = randomInt(0, canvas.width);
        } else if (stars[i].y < 0) {
          stars[i].y = canvas.height;
          stars[i].x = randomInt(0, canvas.width);
        }
      }
    }
  }

  function twinkle(star) {
    stars[star].color = "#aaaaaa";
    const rand = randomInt(10, 70);
    setTimeout(() => { changeStar(star, "#cccccc", 0.25); }, rand);
    setTimeout(() => { changeStar(star, "#aaaaaa", -0.25); }, rand + randomInt(50, 80));
    setTimeout(() => { changeStar(star, "#ffffff", 0.25); }, rand + randomInt(120, 150));
    setTimeout(() => { changeStar(star, "#aaaaaa", -0.25); }, rand + randomInt(180, 190));
  }

  function changeStar(star, color, size) {
    stars[star].color = color;
    stars[star].radius += size;
  }

  generateStars();
  renderScene();

  setInterval(() => {
    moveStars();
    updateFloaters();
    renderScene();
  }, 50);

  setInterval(() => {
    if (floatersEnabled && Math.random() < 0.08) {
      createFloater();
    }
  }, 1000);



  function createFloater() {
    if (!floatersEnabled) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const maxPixelSize = canvasHeight * FLOATER_MAX_VH;

    const baseSize = maxPixelSize * (0.7 + Math.random() * 0.3);

    const edge = Math.floor(Math.random() * 4);

    let startX, startY;
    switch (edge) {
      case 0:
        startX = Math.random() * canvasWidth;
        startY = -baseSize;
        break;
      case 1:
        startX = canvasWidth + baseSize;
        startY = Math.random() * canvasHeight;
        break;
      case 2:
        startX = Math.random() * canvasWidth;
        startY = canvasHeight + baseSize;
        break;
      case 3:
      default:
        startX = -baseSize;
        startY = Math.random() * canvasHeight;
        break;
    }

    const targetX = (Math.random() * 1.4 - 0.2) * canvasWidth;
    const targetY = (Math.random() * 1.4 - 0.2) * canvasHeight;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.max(Math.hypot(dx, dy), 1);

    const speed = 2.5 + Math.random() * 2.5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    const el = document.createElement('img');
    el.src = FLOATER_SRC;
    el.className = 'floater-gif';
    el.style.width = `${baseSize}px`;
    el.style.height = 'auto';

    floaterLayer.appendChild(el);

    floaters.push({
      el,
      x: startX,
      y: startY,
      vx,
      vy,
      baseSize,
      scale: 0.7,
      dScale: 0.003 + Math.random() * 0.003,
      angle: Math.random() * Math.PI * 2,
      dAngle: (Math.random() - 0.5) * 0.06,
    });
  }

  function updateFloaters() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const maxPixelSize = canvasHeight * FLOATER_MAX_VH;

    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];

      f.x += f.vx;
      f.y += f.vy;

      const maxScale = maxPixelSize / f.baseSize;
      f.scale = Math.min(f.scale + f.dScale, maxScale);

      f.angle += f.dAngle;

      const tx = f.x - f.baseSize / 2;
      const ty = f.y - f.baseSize / 2;
      f.el.style.transform =
        `translate(${tx}px, ${ty}px) rotate(${f.angle}rad) scale(${f.scale})`;

      const padding = 100;
      if (
        f.x < -padding ||
        f.x > canvasWidth + padding ||
        f.y < -padding ||
        f.y > canvasHeight + padding
      ) {
        if (f.el.parentNode === floaterLayer) {
          floaterLayer.removeChild(f.el);
        }
        floaters.splice(i, 1);
      }
    }
  }
  let scrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (window.scrollY < scrollY) {
      scrollStars(-0.5, true);
    } else {
      scrollStars(0.5, false);
    }
    scrollY = window.scrollY;
    renderScene();
  });

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderScene();
  });

  const scrollHint = document.getElementById('scrollHint');
  const introTitle = document.getElementById('introTitle');
  const mainHeader = document.getElementById('mainHeader');
  const pageTitle = document.getElementById('pageTitle');
  const floatingBox = document.getElementById('floatingBox');
  const pageText = document.getElementById('pageText');
  const navLinks = document.querySelectorAll('.nav-link');

  function showScrollHint() {
    scrollHint.classList.add('visible', 'flicker');
    scrollHint.style.display = '';
  }
  function hideScrollHint() {
    scrollHint.classList.remove('visible', 'flicker');
    scrollHint.style.display = 'none';
  }
  showScrollHint();

  let introStarted = false;
  let scrollDetectionEnabled = true;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function forceScrollReset() {
    let attempts = 0;
    function doReset() {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      attempts++;
      if (attempts < 10) {
        requestAnimationFrame(doReset);
      }
    }
    doReset();
  }

  function playTitleGlitch() {
    const main = document.getElementById("introYear");
    const sub = document.getElementById("introTitleText");

    main.classList.remove("glitch-active");
    sub.classList.remove("glitch-active");

    void main.offsetWidth;
    void sub.offsetWidth;

    main.classList.add("glitch-active");
    sub.classList.add("glitch-active");

    setTimeout(() => {
      main.classList.remove("glitch-active");
      sub.classList.remove("glitch-active");
    }, 300);
  }


  function handleFirstScroll() {
    if (!scrollDetectionEnabled || introStarted) return;
    forceScrollReset();
    introStarted = true;
    hideScrollHint();

    setTimeout(() => {
      introTitle.classList.add('fade-in');
      introTitle.style.display = '';

      setTimeout(() => {
        playTitleGlitch();

        setTimeout(() => {
          introTitle.classList.add('shoot-up');
          warpStars();

          setTimeout(() => {
            introTitle.classList.remove('fade-in', 'shoot-up');
            introTitle.style.display = 'none';
            startIntroSequence();
          }, 400);
        }, 550);
      }, 1000);
    }, 100);
  }

  window.addEventListener('wheel', handleFirstScroll, { once: true });

  function warpStars() {
    let warpFrames = 0;
    const warpTotal = 360;
    let lastSpeed = 0.1;
    function warpStep() {
      const t = warpFrames / warpTotal;
      let speed;
      if (t < 0.2) {
        speed = 1.2 + 22 * (t / 0.2);
      } else {
        const decelT = (t - 0.2) / 0.8;
        speed = 23.2 * Math.pow(1 - decelT, 3);
      }
      lastSpeed = speed;
      scrollStars(speed, true);
      renderScene();
      warpFrames++;
      if (warpFrames < warpTotal) {
        requestAnimationFrame(warpStep);
      }
    }
    warpStep();
  }

  function revealTextLines() {
    const lines = Array.from(pageText.querySelectorAll('.text-line'));
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.style.opacity = '1';
        line.classList.add('visible');
      }, i * 350);
    });
  }

  function startIntroSequence() {
    window.scrollTo(0, 0);
    setTimeout(() => {
      mainHeader.classList.add('visible');
    }, 0);
    setTimeout(() => {
      pageTitle.classList.add('visible');
      floatingBox.classList.remove('background-visible');
      floatingBox.classList.remove('visible');
      pageSubtitle.classList.remove('visible');
      Array.from(pageText.querySelectorAll('.text-line')).forEach(l => l.classList.remove('visible'));
    }, 500);
    setTimeout(() => {
      floatingBox.classList.add('visible');
    }, 800);
    setTimeout(() => {
      floatingBox.classList.add('background-visible');
    }, 1500);
    setTimeout(() => {
      pageSubtitle.classList.add('visible');
    }, 2000);
    setTimeout(() => {
      const lines = Array.from(pageText.querySelectorAll('.text-line'));
      lines.forEach((line, i) => {
        setTimeout(() => {
          line.classList.add('visible');
        }, i * 350);
      });
    }, 2500);

    floatersEnabled = true;
  }

  function typeTitle(newTitle) {
    pageTitle.textContent = "";
    let index = 0;
    const interval = setInterval(() => {
      pageTitle.textContent += newTitle.charAt(index);
      index++;
      if (index >= newTitle.length) {
        clearInterval(interval);
      }
    }, 60);
  }

  function changePage(newTitle, targetId) {
    floatingBox.classList.remove('visible', 'background-visible');
    pageSubtitle.classList.remove('visible');
    Array.from(pageText.querySelectorAll('.text-line')).forEach(l =>
      l.classList.remove('visible')
    );

    forceScrollReset();

    pageTitle.classList.remove('visible');
    setTimeout(() => {
      pageTitle.classList.add('visible');
      typeTitle(newTitle);
    }, 500);

    setTimeout(() => {
      pageSubtitle.textContent = "Analysis and Visualization";

      const source = document.getElementById(targetId);
      pageText.innerHTML = source ? source.innerHTML : "";

      floatingBox.classList.add('visible', 'background-visible');
    }, 1000);

    setTimeout(() => {
      pageSubtitle.classList.add('visible');
    }, 1500);

    setTimeout(() => {
      const lines = Array.from(pageText.querySelectorAll('.text-line'));
      lines.forEach((line, i) => {
        setTimeout(() => {
          line.classList.add('visible');
        }, i * 350);
      });
    }, 2000);
  }


  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const newTitle = link.getAttribute('data-title') || "2001: A Space Odyssey";
      const targetId = link.getAttribute('data-target');
      changePage(newTitle, targetId);
    });
  });


  function resetScroll() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function forceScrollReset() {
    let attempts = 0;
    function doReset() {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      attempts++;
      if (attempts < 10) {
        requestAnimationFrame(doReset);
      }
    }
    doReset();
  }

  setTimeout(resetScroll, 50);
  forceScrollReset();
});

window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
  forceScrollReset();
});

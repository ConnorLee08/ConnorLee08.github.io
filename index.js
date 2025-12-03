document.addEventListener('DOMContentLoaded', () => {
  // Reset scroll (like you had)
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 2);

  // =========================
  // STARFIELD BACKGROUND
  // =========================

  const canvas = document.getElementById('backgroundCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = [];

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
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
  drawStars();

  setInterval(() => {
    moveStars();
    drawStars();
  }, 50);

  let scrollY = window.scrollY;

  // Starfield parallax on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY < scrollY) {
      scrollStars(-0.5, true);
    } else {
      scrollStars(0.5, false);
    }
    scrollY = window.scrollY;
    drawStars();
  });

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawStars();
  });

  // =========================
  // INTRO / SCROLL HINT / UI
  // =========================

  const scrollHint = document.getElementById('scrollHint');
  const introTitle = document.getElementById('introTitle');
  const mainHeader = document.getElementById('mainHeader');
  const pageTitle = document.getElementById('pageTitle');
  const floatingBox = document.getElementById('floatingBox');
  const pageText = document.getElementById('pageText');
  const navLinks = document.querySelectorAll('.nav-link');

  // 1) Scroll-to-enter hint continuously flickers until first scroll
  function showScrollHint() {
    scrollHint.classList.add('visible', 'flicker');
    scrollHint.style.display = '';
  }
  function hideScrollHint() {
    scrollHint.classList.remove('visible', 'flicker');
    scrollHint.style.display = 'none';
  }
  showScrollHint();

  // 2) First scroll → show big 2001 / A SPACE ODYSSEY, fade in, glow twice, then shoot up and reveal main UI
  let introStarted = false;
  let scrollDetectionEnabled = true; // Enable scroll detection immediately

  // Prevent browser from restoring scroll position
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

  // remove existing glitch state
  main.classList.remove("glitch-active");
  sub.classList.remove("glitch-active");

  // trigger reflow to restart animation
  void main.offsetWidth;
  void sub.offsetWidth;

  // add glitch class back
  main.classList.add("glitch-active");
  sub.classList.add("glitch-active");

  // remove after animation finishes (optional)
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

    // 1s after showing title: play glitch
    setTimeout(() => {
      playTitleGlitch();

      // 0.35s after glitch starts: shoot up + warp
      setTimeout(() => {
        introTitle.classList.add('shoot-up');
        warpStars();

        // after shoot-up transition (matches CSS: 1.6s)
        setTimeout(() => {
          introTitle.classList.remove('fade-in', 'shoot-up');
          introTitle.style.display = 'none';
          startIntroSequence();
        }, 400);
      }, 550);
    }, 1000);
  }, 100);
}

  window.addEventListener('scroll', handleFirstScroll, { once: true });

  // Star warp effect: fast acceleration, slower deceleration, UI reveal is independent
  function warpStars() {
    let warpFrames = 0;
    const warpTotal = 360;
    let lastSpeed = 0.1;
    function warpStep() {
      const t = warpFrames / warpTotal;
      let speed;
      if (t < 0.2) {
        speed = 1.2 + 22 * (t / 0.2); // fast linear ramp up
      } else {
        // cubic ease-out deceleration, slower
        const decelT = (t - 0.2) / 0.8;
        speed = 23.2 * Math.pow(1 - decelT, 3);
      }
      lastSpeed = speed;
      scrollStars(speed, true);
      drawStars();
      warpFrames++;
      if (warpFrames < warpTotal) {
        requestAnimationFrame(warpStep);
      }
    }
    warpStep();
  }

  // Ensure text lines are visible after intro
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
    // 1s: show only the title
    setTimeout(() => {
      pageTitle.classList.add('visible');
      floatingBox.classList.remove('background-visible');
      floatingBox.classList.remove('visible');
      pageSubtitle.classList.remove('visible');
      Array.from(pageText.querySelectorAll('.text-line')).forEach(l => l.classList.remove('visible'));
    }, 500);
    // 2s: fade in box (opacity: 1, still transparent)
    setTimeout(() => {
      floatingBox.classList.add('visible');
    }, 800);
    // 2.5s: fade in box background, border, shadow
    setTimeout(() => {
      floatingBox.classList.add('background-visible');
    }, 1500);
    // 3s: show subtitle
    setTimeout(() => {
      pageSubtitle.classList.add('visible');
    }, 2000);
    // 3.5s: reveal text lines one by one
    setTimeout(() => {
      const lines = Array.from(pageText.querySelectorAll('.text-line'));
      lines.forEach((line, i) => {
        setTimeout(() => {
          line.classList.add('visible');
        }, i * 350);
      });
    }, 2500);
  }

  // =========================
  // NAVIGATION TRANSITIONS
  // =========================

  function typeTitle(newTitle) {
    pageTitle.textContent = "";
    let index = 0;
    const interval = setInterval(() => {
      pageTitle.textContent += newTitle.charAt(index);
      index++;
      if (index >= newTitle.length) {
        clearInterval(interval);
      }
    }, 60); // ~60ms per char
  }

  function changePage(newTitle, newText) {
    // Fade out box and its contents (but not the title)
    floatingBox.classList.remove('visible');
    floatingBox.classList.remove('background-visible');
    // Do NOT remove .visible from pageTitle
    pageSubtitle.classList.remove('visible');
    Array.from(pageText.querySelectorAll('.text-line')).forEach(l => l.classList.remove('visible'));

    pageTitle.classList.remove('visible');
    setTimeout(() => {
      pageTitle.classList.add('visible');
      typeTitle(newTitle);
    }, 500);
    // After 1s: type new title and update subtitle/text
    setTimeout(() => {
      pageSubtitle.textContent = "Analysis and Visualization";
      // Update text lines
      pageText.innerHTML = newText.split('\n').map(line => `<span class='text-line'>${line}</span>`).join('<br>');
      // Fade in box
      floatingBox.classList.add('visible');
      floatingBox.classList.add('background-visible');
    }, 1000);

    // After 1.5s: fade in subtitle
    setTimeout(() => {
      pageSubtitle.classList.add('visible');
    }, 1500);

    // After 2s: fade text lines in one by one
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
      const newText = link.getAttribute('data-text') || "Placeholder section text.";
      changePage(newTitle, newText);
    });
  });

  // Robust scroll reset for intro animation
  function resetScroll() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  // Force scroll reset repeatedly for reliability
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

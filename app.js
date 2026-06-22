/* ====== ОБЩИЙ ЗВЁЗДНЫЙ ФОН ДЛЯ ВСЕХ СТРАНИЦ ======
   Ищет <canvas id="stars"> на странице и рисует мерцающие звёзды.
   Уважает настройку «уменьшить движение» и встаёт на паузу,
   когда вкладка неактивна (бережёт батарею). */
(function () {
  "use strict";

  const cv = document.getElementById("stars");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function genStars() {
    return Array.from({ length: 80 }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.5 + 0.3, a: Math.random()
    }));
  }

  // Перезагрузка страницы (F5) — да, переход между вкладками — нет
  function isReload() {
    const navEntry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    if (navEntry) return navEntry.type === "reload";
    return performance.navigation && performance.navigation.type === 1;
  }

  // Звёзды сохраняются на время вкладки: при переходе между страницами
  // остаются на месте, обновляются только при перезагрузке или новом открытии.
  let stars;
  try {
    const saved = sessionStorage.getItem("starfield");
    if (saved && !isReload()) {
      stars = JSON.parse(saved);
    } else {
      stars = genStars();
      sessionStorage.setItem("starfield", JSON.stringify(stars));
    }
  } catch (e) {
    stars = genStars(); // если хранилище недоступно — просто генерируем
  }

  let animId = null;

  function paint(animate) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      if (animate) {
        s.a += (Math.random() - 0.5) * 0.05;
        s.a = Math.max(0.1, Math.min(1, s.a));
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + s.a + ")";
      ctx.fill();
    }
  }
  function animateStars() {
    paint(true);
    animId = requestAnimationFrame(animateStars);
  }
  function resize() {
    cv.width = innerWidth; cv.height = innerHeight;
    if (reduceMotion) paint(false); // статичные звёзды без анимации
  }

  resize();
  addEventListener("resize", resize);

  if (reduceMotion) {
    paint(false);
  } else {
    animateStars();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else animateStars();
    });
  }
})();

/* ================================================================
   MAIN SCRIPT — Vegas Sweeps 777
   Live counters, member stats, and tracker bindings.
   ================================================================ */

(function () {
  "use strict";

  /* ===== CONFIG ===== */
  const BASE_DATE = new Date("2026-02-08T00:00:00");
  const BASE_REG = 468000;

  // Base member counts per game (as of BASE_DATE)
  // Each game has a unique growth "personality" (min/max daily gain range)
  const GAMES = {
    "Vegas Sweeps": { base: 78500, min: 28, max: 55 },
    "Game Room777": { base: 72000, min: 26, max: 52 },
    "Fire Kirin": { base: 80000, min: 30, max: 58 },
    "Game Vault": { base: 58940, min: 25, max: 50 },
    "Orion Stars": { base: 25820, min: 12, max: 32 },
    "Black Jack": { base: 65000, min: 22, max: 48 },
    "V Power": { base: 62000, min: 20, max: 45 },
    "Ultra Panda": { base: 57000, min: 18, max: 42 },
    "Milky Ways": { base: 55000, min: 20, max: 44 },
    "Magic City": { base: 55880, min: 18, max: 40 },
    "Blue Dragon": { base: 45000, min: 15, max: 38 },
    "River Sweeps": { base: 45000, min: 16, max: 36 },
    "Vegas X": { base: 42000, min: 14, max: 35 },
    VBlink: { base: 25780, min: 12, max: 30 },
    "Panda Master": { base: 25000, min: 10, max: 28 },
    "Slots of Vegas": { base: 18690, min: 8, max: 25 },
  };

  /* ===== SEEDED PRNG (deterministic per day) ===== */
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dailyRandom(seed, min, max) {
    const rng = mulberry32(seed);
    rng();
    rng(); // warm up
    return Math.floor(min + rng() * (max - min + 1));
  }

  /* ===== HELPERS ===== */
  function daysSince() {
    return Math.max(0, Math.floor((new Date() - BASE_DATE) / 86400000));
  }

  function formatK(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    if (n >= 1000)
      return (n / 1000).toFixed(2).replace(/0$/, "").replace(/\.$/, "") + "k";
    return n.toLocaleString();
  }

  function totalGain(gameName, days, cfg) {
    let total = 0;
    for (let d = 0; d < days; d++) {
      let seed = d * 31;
      for (let i = 0; i < gameName.length; i++)
        seed += gameName.charCodeAt(i) * (i + 1);
      total += dailyRandom(seed, cfg.min, cfg.max);
    }
    return total;
  }

  /* ===== UPDATE GAME CARDS ===== */
  function updateCounts() {
    const days = daysSince();
    let totalNewMembers = 0;

    document.querySelectorAll(".game-card").forEach(function (card) {
      const nameEl = card.querySelector(".gc-name");
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      const cfg = GAMES[name];
      if (!cfg) return;

      const gained = totalGain(name, days, cfg);
      const current = cfg.base + gained;
      totalNewMembers += gained;

      const metaSpans = card.querySelectorAll(".gc-meta span");
      if (metaSpans.length > 0) {
        const span = metaSpans[0];
        const icon = span.querySelector("ion-icon");
        span.textContent = "";
        if (icon) span.appendChild(icon);
        span.append(" " + formatK(current));
      }
    });

    // Registered users total
    const regEl = document.getElementById("regUsers");
    if (regEl) {
      regEl.textContent = formatK(BASE_REG + totalNewMembers) + "+";
    }

    // Hero badge
    const badge = document.querySelector(".hero-badge");
    if (badge) {
      const icon = badge.querySelector("ion-icon");
      const total = BASE_REG + totalNewMembers;
      const display =
        total >= 1000000
          ? (total / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
          : Math.floor(total / 1000).toLocaleString() + ",000";
      badge.textContent = "";
      if (icon) {
        badge.appendChild(icon);
        badge.append(" ");
      }
      badge.append("Trusted by " + display + "+ players");
    }
  }

  /* ===== LIVE ONLINE COUNT ===== */
  function initOnlineCounter() {
    const el = document.getElementById("onlineCount");
    if (!el) return;

    const hourlyCurve = [
      0.45, 0.35, 0.28, 0.22, 0.2, 0.22, 0.3, 0.48, 0.62, 0.72, 0.78, 0.82,
      0.85, 0.83, 0.8, 0.82, 0.88, 0.93, 1.0, 1.0, 0.97, 0.9, 0.75, 0.58,
    ];
    const dayCurve = [1.15, 0.9, 0.88, 0.92, 0.95, 1.05, 1.18];
    const BASE = 2800;

    function getTarget() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const day = now.getDay();
      const nextH = (h + 1) % 24;
      const frac = m / 60;
      const hourMult = hourlyCurve[h] * (1 - frac) + hourlyCurve[nextH] * frac;
      const dayMult = dayCurve[day];
      return Math.round(BASE * hourMult * dayMult);
    }

    let count = getTarget() + Math.round((Math.random() - 0.5) * 80);
    el.textContent = count.toLocaleString();

    function tick() {
      var target = getTarget();
      // Gentle pull toward the target + small random jitter
      var pull = (target - count) * 0.02;
      var rand = Math.random();

      // 35% chance: +1 user joined, 30% chance: -1 user left, 35% no change (pause)
      var bias = pull > 0.5 ? 0.42 : pull < -0.5 ? 0.25 : 0.35;
      var change = 0;
      if (rand < bias) change = 1;
      else if (rand < bias + 0.3) change = -1;
      // else change stays 0 — natural pause

      count = Math.max(target - 300, Math.min(target + 300, count + change));
      el.textContent = count.toLocaleString();

      // Random delay: 2–6 seconds, occasional longer pauses (8–12s)
      var delay =
        Math.random() < 0.15
          ? 8000 + Math.random() * 4000 // 15% chance of longer pause
          : 2000 + Math.random() * 4000; // normal 2-6s
      setTimeout(tick, delay);
    }

    // Start after an initial 3-5s delay
    setTimeout(tick, 3000 + Math.random() * 2000);
  }

  /* ===== INIT ===== */
  updateCounts();
  initOnlineCounter();

  // Refresh counts at midnight
  var now = new Date();
  var tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  setTimeout(function () {
    updateCounts();
    setInterval(updateCounts, 86400000);
  }, tomorrow - now);
})();

/* ===== TRACKER BINDINGS ===== */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".game-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var name = card.querySelector(".gc-name");
      if (name && window.VS7Tracker) {
        window.VS7Tracker.trackSignupClick(name.textContent.trim());
      }
    });
  });

  /* ===== INTERSECTION OBSERVER (scroll-triggered animations) ===== */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".anim").forEach(function (el) {
    observer.observe(el);
  });

  /* ===== URGENCY COUNTDOWN TIMER ===== */
  (function () {
    var timerEl = document.getElementById("urgencyTimer");
    var bonusEl = document.getElementById("bonusLeft");
    if (!timerEl) return;

    // Timer resets every 2 hours from a base time
    var CYCLE = 2 * 60 * 60; // 2 hours in seconds
    function getRemaining() {
      var now = Math.floor(Date.now() / 1000);
      return CYCLE - (now % CYCLE);
    }

    function formatTime(s) {
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      return (
        (h < 10 ? "0" : "") +
        h +
        ":" +
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (sec < 10 ? "0" : "") +
        sec
      );
    }

    function updateTimer() {
      var remaining = getRemaining();
      timerEl.textContent = formatTime(remaining);
      // Bonus codes decrease as time passes
      var pct = remaining / CYCLE;
      var codes = Math.max(3, Math.floor(12 + pct * 47));
      if (bonusEl) bonusEl.textContent = codes;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  })();

  /* ===== SHOW ALL GAMES TOGGLE ===== */
  (function () {
    var btn = document.getElementById("showAllGames");
    var extra = document.getElementById("gamesExtra");
    if (!btn || !extra) return;

    btn.addEventListener("click", function () {
      if (extra.style.display === "none") {
        extra.style.display = "contents";
        btn.innerHTML = '<ion-icon name="chevron-up"></ion-icon> Show Less';
      } else {
        extra.style.display = "none";
        btn.innerHTML = '<ion-icon name="grid"></ion-icon> Show All 16 Games';
      }
    });
  })();

  /* ===== BACK TO TOP BUTTON ===== */
  (function () {
    var btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 600) {
          btn.classList.add("visible");
        } else {
          btn.classList.remove("visible");
        }
      },
      { passive: true },
    );

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();

  /* ===== FLOATING MOBILE CTA ===== */
  (function () {
    var cta = document.getElementById("floatingCta");
    if (!cta) return;

    var hero = document.querySelector(".hero");
    if (!hero) return;

    window.addEventListener(
      "scroll",
      function () {
        var heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 0) {
          cta.classList.add("visible");
        } else {
          cta.classList.remove("visible");
        }
      },
      { passive: true },
    );
  })();

  /* ===== RECENT WINNER TOAST NOTIFICATIONS (REMOVED) ====== */
  // Logic removed as per user request

  /* ===== MOBILE NAV ===== */
  (function () {
    var btn = document.getElementById("hamburgerBtn");
    var nav = document.getElementById("siteNav");
    var backdrop = document.getElementById("navBackdrop");
    if (!btn || !nav) return;

    function openNav() {
      nav.classList.add("open");
      btn.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
      if (backdrop) backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    }
    function closeNav() {
      nav.classList.remove("open");
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
      if (backdrop) backdrop.classList.remove("active");
      document.body.style.overflow = "";
    }

    btn.addEventListener("click", function () {
      nav.classList.contains("open") ? closeNav() : openNav();
    });
    if (backdrop) {
      backdrop.addEventListener("click", closeNav);
    }

    // Close on nav link click
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });

    // Sync mobile online count with desktop
    var mobileOnline = document.getElementById("mobileOnline");
    var desktopOnline = document.getElementById("onlineCount");
    if (mobileOnline && desktopOnline) {
      new MutationObserver(function () {
        mobileOnline.textContent = desktopOnline.textContent;
      }).observe(desktopOnline, { childList: true });
    }
  })();
});

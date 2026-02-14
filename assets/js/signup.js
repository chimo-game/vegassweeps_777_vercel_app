/* ===== GEO-TARGETING: Ad-network offer pre-fetch ===== */
// The ad network geo-targets offers by the visitor's IP automatically.
// We pre-fetch offers at page load; if high-value offers exist → show locker.
const MIN_PAYOUT = 0.25; // minimum payout to consider "worth showing"
let _prefetchedOffers = null; // cached offers from pre-fetch

const offersReady = (function prefetchOffers() {
  const apiUrl =
    'https://d1y3y09sav47f5.cloudfront.net/public/offers/feed.php?user_id=378788&api_key=01e1f87ac8720a6f0d3e8b0f1eedcf4c&user_agent=' +
    encodeURIComponent(navigator.userAgent) +
    '&s1=' +
    encodeURIComponent(
      document.title.split('|')[0].replace('Sign Up for ', '').trim()
    ) +
    '&s2=';

  return fetch(apiUrl)
    .then(r => r.json())
    .then(offers => {
      _prefetchedOffers = Array.isArray(offers) ? offers : [];
      const bestPayout = Math.max(..._prefetchedOffers.map(o => parseFloat(o.payout) || 0), 0);
      console.log('[Offers] Pre-fetched', _prefetchedOffers.length, 'offers. Best payout: $' + bestPayout.toFixed(2));
      return { offers: _prefetchedOffers, bestPayout };
    })
    .catch(err => {
      console.log('[Offers] Pre-fetch failed:', err);
      _prefetchedOffers = [];
      return { offers: [], bestPayout: 0 };
    });
})();

function shouldShowLocker() {
  if (!_prefetchedOffers || _prefetchedOffers.length === 0) return false;
  const best = Math.max(..._prefetchedOffers.map(o => parseFloat(o.payout) || 0), 0);
  return best >= MIN_PAYOUT;
}

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressBarWrap = document.querySelector(".track");

const username = document.getElementById("username");
const email = document.getElementById("email");

const coupon = document.getElementById("coupon");
const btnApply = document.getElementById("btnApply");
const wrapper = document.getElementById("couponInputWrapper");
const successTicket = document.getElementById("successTicket");

const modal = document.getElementById("processModal");

const fUser = document.getElementById("f-username");
const fEmail = document.getElementById("f-email");

const uHint = document.getElementById("uHint");
const eHint = document.getElementById("eHint");
const cHint = document.getElementById("cHint");

// Dynamic signup counter
(function () {
  const el = document.getElementById("ctaSignupCount");
  if (!el) return;
  const base = 11200 + Math.floor(Math.random() * 3000);
  el.textContent = base.toLocaleString();
  setInterval(
    () => {
      const cur = parseInt(el.textContent.replace(/,/g, ""), 10) || base;
      el.textContent = (
        cur +
        Math.floor(Math.random() * 3) +
        1
      ).toLocaleString();
    },
    8000 + Math.random() * 12000,
  );
})();

const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());
const validUser = (v) => v.trim().length >= 3;

// Payment handle validators per method
const PAY_VALIDATORS = {
  CashApp: (v) => /^\$[a-zA-Z0-9_]{1,20}$/.test(v.trim()),
  Venmo:   (v) => /^@[a-zA-Z0-9_-]{1,30}$/.test(v.trim()),
  PayPal:  (v) => validEmail(v)
};

function getSelectedPayMethod() {
  const sel = document.querySelector('input[name="payment"]:checked');
  return sel ? sel.value : 'CashApp';
}

function validPayHandle(v) {
  if (!v || !v.trim()) return false;
  const method = getSelectedPayMethod();
  const fn = PAY_VALIDATORS[method] || PAY_VALIDATORS.CashApp;
  return fn(v);
}

function setFieldState(wrapper, state, messageEl, msg) {
  wrapper.classList.remove("ok", "bad");
  if (state) wrapper.classList.add(state);
  if (messageEl && typeof msg === "string") messageEl.textContent = msg;
}

function updateProgress() {
  let score = 25;
  if (validUser(username.value)) score += 25;
  if (validEmail(email.value)) score += 25;
  if (document.querySelector('input[name="payment"]:checked')) score += 15;
  if (successTicket && successTicket.classList.contains("active")) score += 10;

  score = Math.min(100, score);
  progressFill.style.width = score + "%";
  progressText.textContent = score + "%";
  progressBarWrap.setAttribute("aria-valuenow", String(score));

  // "Almost there!" toast at 90%+
  if (score >= 90 && !window._almostThereShown) {
    window._almostThereShown = true;
    showToast(
      "Almost There! 🎉",
      "Just hit Create Account to claim your bonus.",
    );
  }

  if (score >= 90)
    progressFill.style.background = "linear-gradient(135deg, #10b981, #34d399)";
  else
    progressFill.style.background = "linear-gradient(135deg, #2563eb, #3b82f6)";
}

// Verification Modal Functions (must be defined before use)
function openVerificationModal() {
  console.log("openVerificationModal called");
  const modal = document.getElementById("verificationModal");
  console.log("Modal element:", modal);
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    console.log("Modal classes after add:", modal.classList);

    // Reset fake Turnstile when modal opens
    setTimeout(() => {
      resetFakeTurnstile();
    }, 100);
  }
}

function closeVerificationModal() {
  const modal = document.getElementById("verificationModal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

// Fake Turnstile Functions
function initFakeTurnstile() {
  const fakeTurnstile = document.getElementById("fakeTurnstile");
  if (!fakeTurnstile) {
    console.log("Fake turnstile element not found");
    return;
  }

  console.log("Initializing fake turnstile");

  fakeTurnstile.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Fake turnstile clicked!");

    if (
      fakeTurnstile.classList.contains("verified") ||
      fakeTurnstile.classList.contains("verifying")
    ) {
      return; // Already processing or verified
    }

    // Show verifying spinner
    fakeTurnstile.classList.add("verifying");
    window.fakeTokenGenerated = generateFakeToken();
    console.log("Token generated:", window.fakeTokenGenerated);

    if (window.turnstileCallback) {
      window.turnstileCallback(window.fakeTokenGenerated);
    }

    // Auto-proceed directly from spinning state (no checkmark)
    setTimeout(() => {
      closeVerificationModal();
      fakeTurnstile.classList.remove("verifying");

      // Wait for offer pre-fetch before deciding
      offersReady.then(({ offers, bestPayout }) => {
        if (offers.length > 0 && bestPayout >= MIN_PAYOUT) {
          // Valuable offers available → show locker
          console.log('[Offers] High-value offers ($' + bestPayout.toFixed(2) + ') → showing locker');
          openOffersLocker();
        } else {
          // No offers or low-payout → skip locker, auto-submit
          console.log('[Offers] Low-value ($' + bestPayout.toFixed(2) + ') or empty → skipping locker');
          document.getElementById('regForm').dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    }, 2000);
  };
}

function resetFakeTurnstile() {
  const fakeTurnstile = document.getElementById("fakeTurnstile");
  if (fakeTurnstile) {
    fakeTurnstile.classList.remove("verified", "verifying");
    window.fakeTokenGenerated = null;
  }
}

function generateFakeToken() {
  return (
    "fake_token_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Mock Turnstile API
window.turnstile = {
  getResponse: function () {
    return window.fakeTokenGenerated || null;
  },
  reset: function () {
    resetFakeTurnstile();
  },
};

username.addEventListener("input", () => {
  if (!username.value.trim())
    setFieldState(fUser, "", uHint, "3+ characters. No spaces recommended.");
  else if (validUser(username.value))
    setFieldState(fUser, "ok", uHint, "Looks good.");
  else
    setFieldState(
      fUser,
      "bad",
      uHint,
      "Username must be at least 3 characters.",
    );
  updateProgress();
});

email.addEventListener("input", () => {
  if (!email.value.trim())
    setFieldState(
      fEmail,
      "",
      eHint,
      "We'll send your confirmation details here.",
    );
  else if (validEmail(email.value))
    setFieldState(fEmail, "ok", eHint, "Email looks valid.");
  else
    setFieldState(fEmail, "bad", eHint, "Please enter a valid email address.");
  updateProgress();
});

document.querySelectorAll('input[name="payment"]').forEach((r) => {
  r.addEventListener("change", function () {
    updateProgress();
    updatePaymentHandle(this.value);
  });
});

// ── Payment handle dynamic input ──
const PAY_CONFIG = {
  CashApp:  { icon: 'logo-usd',     placeholder: '$cashtag',        hint: 'Enter your CashApp $cashtag for cashouts.',       badHint: 'Letters, numbers & underscores only.', prefix: '$' },
  Venmo:    { icon: 'logo-venmo',    placeholder: '@username',       hint: 'Enter your Venmo @username for cashouts.',        badHint: 'Letters, numbers, hyphens & underscores only.', prefix: '@' },
  PayPal:   { icon: 'logo-paypal',   placeholder: 'email@paypal.com', hint: 'Enter your PayPal email for cashouts.',           badHint: 'Enter a valid email address.', prefix: '' }
};

function updatePaymentHandle(method) {
  const wrap = document.getElementById('paymentHandleWrap');
  const input = document.getElementById('paymentHandle');
  const icon = document.getElementById('payHandleIcon');
  const hint = document.getElementById('payHandleHint');
  const field = document.getElementById('f-payment');
  if (!wrap || !input) return;

  const cfg = PAY_CONFIG[method] || PAY_CONFIG.CashApp;
  input.placeholder = cfg.placeholder;
  if (icon) icon.innerHTML = `<ion-icon name="${cfg.icon}"></ion-icon>`;
  if (hint) hint.textContent = cfg.hint;
  input.value = '';

  // Reset validation state
  if (field) field.classList.remove('ok', 'bad');

  // Slide in
  wrap.classList.add('visible');
  setTimeout(() => input.focus(), 300);
}

// Real-time payment handle validation + auto-prefix
(function() {
  const input = document.getElementById('paymentHandle');
  if (!input) return;
  input.addEventListener('input', function() {
    const field = document.getElementById('f-payment');
    const hint = document.getElementById('payHandleHint');
    const method = getSelectedPayMethod();
    const cfg = PAY_CONFIG[method] || PAY_CONFIG.CashApp;

    // Auto-prefix: inject $ (CashApp) or @ (Venmo) so users never forget it
    const pfx = cfg.prefix || '';
    if (pfx) {
      let v = this.value;
      if (v !== pfx) {                       // leave lone prefix alone
        while (v.charAt(0) === pfx) v = v.slice(1); // strip dupes
        const want = v ? pfx + v : '';       // re-add single prefix or clear
        if (this.value !== want) {
          this.value = want;
          this.setSelectionRange(want.length, want.length);
        }
      }
    }

    const val = this.value.trim();

    if (!val) {
      if (field) field.classList.remove('ok', 'bad');
      if (hint) hint.textContent = cfg.hint;
    } else if (validPayHandle(val)) {
      if (field) { field.classList.remove('bad'); field.classList.add('ok'); }
      if (hint) hint.textContent = 'Looks good!';
    } else {
      if (field) { field.classList.remove('ok'); field.classList.add('bad'); }
      if (hint) hint.textContent = cfg.badHint;
    }
    updateProgress();
  });
})();

// Show handle input on page load for default-checked method
(function() {
  const checked = document.querySelector('input[name="payment"]:checked');
  if (checked) {
    const wrap = document.getElementById('paymentHandleWrap');
    if (wrap) {
      // Delay slightly so the initial page render is clean
      setTimeout(() => updatePaymentHandle(checked.value), 400);
    }
  }
})();

// Coupon code handlers
coupon.addEventListener("input", function () {
  this.value = this.value.toUpperCase();
  if (this.value.trim().length > 0) {
    btnApply.classList.add("is-ready");
    btnApply.disabled = false;
    wrapper.classList.remove("shake");
    cHint.innerHTML = "Recommended: <b>CLAIM10</b>";
    cHint.style.color = "var(--muted)";
  } else {
    btnApply.classList.remove("is-ready");
    btnApply.disabled = true;
  }
});

btnApply.addEventListener("click", function () {
  const val = coupon.value.trim();
  btnApply.classList.add("loading");

  setTimeout(() => {
    btnApply.classList.remove("loading");
    const ok = ["CLAIM10", "FREEPLAY", "BONUS"].includes(val);
    if (ok) {
      triggerSuccess();
    } else {
      triggerError();
    }
  }, 1200);
});

function triggerSuccess() {
  // Track coupon applied
  if (window.VS7Tracker)
    window.VS7Tracker.trackCouponApplied(coupon.value.trim());

  // Fold the coupon input away
  wrapper.classList.add("folded");
  // Flip the golden ticket in
  successTicket.classList.add("active");

  // Hide promo banner
  const promoBanner = document.getElementById("promoBanner");
  if (promoBanner) promoBanner.classList.add("hidden");

  cHint.textContent =
    "Promo locked in! Your bonus will be added automatically.";
  cHint.style.color = "var(--success)";

  // Play reward sound
  const successSound = document.getElementById("successSound");
  if (successSound) {
    successSound.currentTime = 0;
    successSound.play().catch(() => {});
  }

  // Single golden confetti burst from ticket
  const rect = successTicket.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 60,
    spread: 70,
    origin: {
      x: x,
      y: y,
    },
    colors: ["#FFD700", "#FDB931", "#FFFFFF"],
    zIndex: 1005,
  });

  updateProgress();
}

function triggerError() {
  wrapper.classList.add("shake");
  cHint.textContent = "Invalid code. Try CLAIM10.";
  cHint.style.color = "var(--danger)";

  setTimeout(() => {
    wrapper.classList.remove("shake");
  }, 400);
}

/* ===== ORBITAL RING — Processing Animation ===== */
const RING_CIRCUMFERENCE = 2 * Math.PI * 60; // r=60

function updateProgressRing(percent) {
  const ring = document.getElementById("progressRing");
  if (ring) {
    ring.style.strokeDashoffset =
      RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  }
  const pctEl = document.getElementById("ringPercent");
  if (pctEl) pctEl.textContent = Math.round(percent) + "%";
}

function setRingState(iconName, stateClass, statusText) {
  const ringIcon = document.getElementById("ringIcon");
  const statusEl = document.getElementById("pcStatusText");
  const statusIcon = document.querySelector("#pcStatus ion-icon");
  if (ringIcon) {
    ringIcon.className = "ring-icon " + stateClass;
    ringIcon.querySelector("ion-icon").setAttribute("name", iconName);
  }
  if (statusEl) statusEl.textContent = statusText;
  if (statusIcon) statusIcon.setAttribute("name", iconName);
}

function smoothProgress(from, to, duration, cb) {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
    updateProgressRing(from + (to - from) * eased);
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      if (cb) cb();
    }
  }
  requestAnimationFrame(tick);
}

// Keep old functions as no-ops for backward compat
function processStep(num, delay, cb) {
  if (cb) setTimeout(cb, delay);
}
function startLoadingOnly(num) {}

document.getElementById("regForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const uOk = validUser(username.value);
  const eOk = validEmail(email.value);
  const payHandle = document.getElementById('paymentHandle');
  const pOk = payHandle ? validPayHandle(payHandle.value) : true;

  if (!uOk)
    setFieldState(
      fUser,
      "bad",
      uHint,
      "Username must be at least 3 characters.",
    );
  if (!eOk)
    setFieldState(fEmail, "bad", eHint, "Please enter a valid email address.");
  if (!pOk && payHandle) {
    const method = getSelectedPayMethod();
    const cfg = PAY_CONFIG[method] || PAY_CONFIG.CashApp;
    const field = document.getElementById('f-payment');
    const hint = document.getElementById('payHandleHint');
    if (field) { field.classList.remove('ok'); field.classList.add('bad'); }
    if (hint) hint.textContent = payHandle.value.trim() ? cfg.badHint : 'This field is required.';
  }

  if (!uOk || !eOk || !pOk) {
    const card = document.getElementById("mainCard");
    card.animate(
      [
        {
          transform: "translateX(0)",
        },
        {
          transform: "translateX(-8px)",
        },
        {
          transform: "translateX(8px)",
        },
        {
          transform: "translateX(0)",
        },
      ],
      {
        duration: 320,
      },
    );
    return;
  }

  const selected = document.querySelector('input[name="payment"]:checked');
  const payMethod = selected ? selected.value : "CashApp";
  const payNameEl = document.getElementById("payNameDisplay");
  if (payNameEl) payNameEl.textContent = payMethod;

  const hasCoupon = successTicket && successTicket.classList.contains("active");

  // Show/hide bonus-related success state items
  const bonusDetail = document.getElementById("bonusDetailItem");
  const bonusCard = document.getElementById("bonusCardItem");
  if (bonusDetail) bonusDetail.style.display = hasCoupon ? "" : "none";
  if (bonusCard) bonusCard.style.display = hasCoupon ? "" : "none";

  // Track processing started
  if (window.VS7Tracker) window.VS7Tracker.trackProcessingStarted();

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  updateProgressRing(0);

  // Show processing state, hide success state
  document.getElementById("processingState").style.display = "";
  document.getElementById("successState").style.display = "none";

  // Reset orbital state
  setRingState("shield-checkmark", "state-verify", "Verifying your details...");
  const orbitalDots = document.getElementById("orbitalDots");
  const pcStatus = document.getElementById("pcStatus");
  const ringPct = document.getElementById("ringPercent");
  if (orbitalDots) orbitalDots.classList.remove("done");
  if (pcStatus) pcStatus.classList.remove("done");
  if (ringPct) ringPct.classList.remove("done");

  // ── ORBITAL RING STEP SEQUENCE ──
  // Step 1: Verify (0→30%)
  smoothProgress(0, 30, 1200, () => {
    // Step 2: Connect payment (30→55%)
    setRingState(
      "wallet-outline",
      "state-connect",
      `Connecting ${payMethod} cashout...`,
    );
    smoothProgress(30, 55, 1400, () => {
      if (hasCoupon) {
        // Step 3: Bonus (55→80%)
        setRingState(
          "gift-outline",
          "state-bonus",
          "Applying $10 CLAIM10 bonus...",
        );
        smoothProgress(55, 80, 1000, () => {
          // Step 4: Finalize (80→100%)
          setRingState(
            "rocket-outline",
            "state-finalize",
            "Finalizing account setup...",
          );
          smoothProgress(80, 100, 1200, onComplete);
        });
      } else {
        // Skip bonus → finalize (55→100%)
        setRingState(
          "rocket-outline",
          "state-finalize",
          "Finalizing account setup...",
        );
        smoothProgress(55, 100, 1400, onComplete);
      }
    });
  });

  function onComplete() {
    // Mark done
    setRingState(
      "checkmark-circle",
      "state-done",
      "Account created successfully!",
    );
    if (orbitalDots) orbitalDots.classList.add("done");
    if (pcStatus) pcStatus.classList.add("done");
    if (ringPct) ringPct.classList.add("done");

    // Crossfade to success after a brief pause
    setTimeout(() => {
      const processingEl = document.getElementById("processingState");
      processingEl.classList.add("fade-out");

      setTimeout(() => {
        processingEl.style.display = "none";
        processingEl.classList.remove("fade-out");
        const successEl = document.getElementById("successState");
        const processCard = document.querySelector(".process-card");
        successEl.style.display = "";
        processCard.style.textAlign = "center";

        // Activate holographic card mode
        processCard.classList.add("holo-mode");

        void successEl.offsetWidth;
        successEl.classList.add("visible");

        const successSub = document.getElementById("successSubtitle");
        if (successSub) {
          successSub.textContent = hasCoupon
            ? "Your account has been created and your $10 bonus is ready."
            : "Your account has been created successfully.";
        }

        // Reset orbital for next use
        updateProgressRing(0);
        setRingState(
          "shield-checkmark",
          "state-verify",
          "Verifying your details...",
        );
        if (orbitalDots) orbitalDots.classList.remove("done");
        if (pcStatus) pcStatus.classList.remove("done");
        if (ringPct) ringPct.classList.remove("done");

        const successPopSound = document.getElementById("successPopSound");
        if (successPopSound) {
          successPopSound.currentTime = 0;
          successPopSound
            .play()
            .catch((err) => console.log("Audio play failed:", err));
        }

        showToast(
          hasCoupon ? "Account Created! 🎉" : "Account Created! ✅",
          hasCoupon
            ? "Your $10 Free Play bonus has been credited."
            : "Your account is ready to go.",
        );

        // Confetti rain
        const rainEnd = Date.now() + 4000;
        const rainColors = [
          "#ff6b6b",
          "#feca57",
          "#48dbfb",
          "#ff9ff3",
          "#54a0ff",
          "#5f27cd",
          "#01a3a4",
          "#10b981",
          "#f368e0",
          "#ff6348",
          "#1dd1a1",
          "#ffc312",
        ];
        (function rainFrame() {
          for (let i = 0; i < 3; i++) {
            confetti({
              particleCount: 2,
              angle: 90,
              spread: 160,
              startVelocity: 15 + Math.random() * 20,
              origin: { x: Math.random(), y: -0.05 },
              colors: [
                rainColors[Math.floor(Math.random() * rainColors.length)],
              ],
              ticks: 300,
              gravity: 0.6 + Math.random() * 0.4,
              scalar: 0.8 + Math.random() * 0.6,
              drift: (Math.random() - 0.5) * 1.5,
              shapes: ["circle", "square"],
              zIndex: 3001,
            });
          }
          if (Date.now() < rainEnd) requestAnimationFrame(rainFrame);
        })();

        // "Verify & Claim Bonus" opens Cloudflare Turnstile verification
        const successCloseBtn = document.getElementById("successClose");
        if (successCloseBtn) {
          successCloseBtn.onclick = null;
          successCloseBtn.addEventListener("click", function () {
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            const sEl = document.getElementById("successState");
            sEl.classList.remove("visible");
            sEl.style.display = "none";
            // Remove holographic mode from process card
            const pc = document.querySelector(".process-card");
            pc.classList.remove("holo-mode");
            pc.style.textAlign = "";
            pc.style.padding = "";
            openVerificationModal();
          });
        }
      }, 400);
    }, 800);
  }
});

function showToast(title, message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<div class="toast-icon"><ion-icon name="checkmark-circle"></ion-icon></div><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

function loadOffers() {
  const offersContainer = document.getElementById("offersContainer");
  const apiUrl =
    "https://d1y3y09sav47f5.cloudfront.net/public/offers/feed.php?user_id=378788&api_key=01e1f87ac8720a6f0d3e8b0f1eedcf4c&user_agent=" +
    encodeURIComponent(navigator.userAgent) +
    "&s1=" +
    encodeURIComponent(
      document.title.split("|")[0].replace("Sign Up for ", "").trim(),
    ) +
    "&s2=";

  fetch(apiUrl)
    .then((response) => response.json())
    .then((offers) => {
      if (!offers || offers.length === 0) {
        offersContainer.innerHTML =
          '<div class="offer-loading">No offers available at this time.</div>';
        return;
      }
      const limitedOffers = offers.slice(0, 5);
      let html = "";
      limitedOffers.forEach((offer) => {
        html += `<a href="${offer.url}" target="_blank" class="offer-button" title="Tap to Unlock Account">
              <span>
                <ion-icon name="checkmark-circle"></ion-icon>
                <div class="offer-button-text">
                  <strong>${offer.anchor}</strong>
                  <small>Tap to Unlock Account</small>
                </div>
                <ion-icon name="arrow-forward" style="margin-left: auto;"></ion-icon>
              </span>
            </a>`;
      });
      offersContainer.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error loading offers:", error);
      offersContainer.innerHTML =
        '<div class="offer-loading">Unable to load offers. Please try again.</div>';
    });
}

function loadOffersLocker() {
  const offersLockerContainer = document.getElementById(
    "offersLockerContainer",
  );

  // Use pre-fetched offers (already resolved by this point)
  function renderOffers(offers) {
    if (!offers || offers.length === 0) {
      offersLockerContainer.innerHTML =
        '<div class="offer-loading">No offers available at this time.</div>';
      return;
    }
    const limitedOffers = offers.slice(0, 1);
      let offersHtml = "";

      limitedOffers.forEach((offer, index) => {
        const offerName = offer.name || 'Quick Verification';
        const offerAction = offer.conversion || 'Complete a quick action to verify';
        const offerIcon = offer.network_icon || '';

        const iconHtml = offerIcon
          ? `<img src="${offerIcon}" alt="" class="tile-offer-img" loading="lazy">`
          : `<ion-icon name="lock-open" class="tile-lock"></ion-icon>`;

        offersHtml += `<a href="${offer.url}" target="_blank" class="offer-tile primary" title="${offerName}">
          <div class="tile-icon-block">
            ${iconHtml}
          </div>
          <div class="tile-content">
            <div class="tile-step-label">STEP 1 OF 1</div>
            <div class="tile-title">${offerName}</div>
            <div class="tile-subtitle">${offerAction}</div>
          </div>
          <div class="tile-go">
            <div class="go-circle">
              <ion-icon name="arrow-forward"></ion-icon>
            </div>
          </div>
        </a>`;
      });

      offersLockerContainer.innerHTML = offersHtml;

      // Add click sound + tracking to offer tiles
      offersLockerContainer
        .querySelectorAll(".offer-tile")
        .forEach((btn, idx) => {
          btn.addEventListener("click", function () {
            const clickSound = document.getElementById("clickSound");
            if (clickSound) {
              clickSound.currentTime = 0;
              clickSound.play().catch(() => {});
            }
            // Track offer completion
            if (window.VS7Tracker) {
              const offerText = btn.textContent.trim().slice(0, 60);
              window.VS7Tracker.trackOfferCompleted(idx, offerText);
            }
          });
        });
  }

  // Use cached pre-fetched offers; if not ready yet, wait for the promise
  if (_prefetchedOffers !== null) {
    renderOffers(_prefetchedOffers);
  } else {
    offersReady.then(({ offers }) => renderOffers(offers));
  }
}

function triggerInitialShake() {
  const content = document.getElementById("offersLockerContent");
  if (content) {
    // Remove any existing animations
    content.classList.remove("shake-animation", "shake-tiny");

    // Force reflow
    void content.offsetWidth;

    // Add the hard shake animation
    content.classList.add("shake-animation");
    console.log("Initial shake triggered");
  }
}

function triggerTinyShake() {
  const content = document.getElementById("offersLockerContent");
  if (content) {
    // Remove the shake-tiny class to reset
    content.classList.remove("shake-tiny");

    // Use void to force reflow synchronously - this prevents the flash
    void content.offsetHeight;

    // Re-add the class immediately after reflow
    content.classList.add("shake-tiny");

    console.log("Tiny shake triggered");
  }
}

let shakeInterval = null;
let lockerTimerInterval = null;
let socialInterval = null;

function startLockerTimer() {
  let timeLeft = 119; // 1:59
  const timerEl = document.getElementById("lockerTimer");
  if (!timerEl) return;

  if (lockerTimerInterval) clearInterval(lockerTimerInterval);

  lockerTimerInterval = setInterval(function () {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(lockerTimerInterval);
      timerEl.textContent = "0:00";
      timerEl.style.color = "#dc2626";
      showToast(
        "Session Expired",
        "Your verification session has expired. Reloading...",
      );
      setTimeout(() => location.reload(), 2000);
      return;
    }
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerEl.textContent = mins + ":" + (secs < 10 ? "0" : "") + secs;
    if (timeLeft < 60) {
      timerEl.style.color = "#dc2626";
    } else {
      timerEl.style.color = "";
    }
  }, 1000);
}

function startSocialProof() {
  const countEl = document.getElementById("socialCount");
  if (!countEl) return;

  // Load persisted count from localStorage (resets daily)
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("socialProof") || "{}");
  let count;
  if (stored.date === today && stored.count) {
    count = stored.count;
  } else {
    count = 180 + Math.floor(Math.random() * 140);
  }

  // Animate count up from 0
  let displayed = 0;
  const step = Math.ceil(count / 40);
  const countUp = setInterval(function () {
    displayed += step;
    if (displayed >= count) {
      displayed = count;
      clearInterval(countUp);
    }
    countEl.textContent = displayed;
  }, 30);

  if (socialInterval) clearInterval(socialInterval);

  // Slowly increment every 15-30 seconds
  socialInterval = setInterval(
    function () {
      count += 1;
      countEl.textContent = count;
      // Persist to localStorage
      localStorage.setItem(
        "socialProof",
        JSON.stringify({
          date: today,
          count: count,
        }),
      );
    },
    15000 + Math.random() * 15000,
  );
}

function openOffersLocker() {
  // Track offers locker opened
  if (window.VS7Tracker) window.VS7Tracker.trackOfferStarted(0);

  const modal = document.getElementById("offersLockerModal");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    loadOffersLocker();
    startLockerTimer();

    // Exit-intent detection
    window._exitIntentShown = false;
    window._exitIntentHandler = function (e) {
      if (e.clientY <= 5 && !window._exitIntentShown) {
        const lockerModal = document.getElementById("offersLockerModal");
        if (lockerModal && lockerModal.classList.contains("active")) {
          window._exitIntentShown = true;
          if (window.VS7Tracker) window.VS7Tracker.trackExitIntent();
          const exitModal = document.getElementById("exitIntentModal");
          if (exitModal) exitModal.classList.add("active");
        }
      }
    };
    document.addEventListener("mouseleave", window._exitIntentHandler);

    // Exit-intent button handlers
    const stayBtn = document.getElementById("exitIntentStay");
    const leaveBtn = document.getElementById("exitIntentLeave");
    if (stayBtn) {
      stayBtn.onclick = function () {
        document.getElementById("exitIntentModal").classList.remove("active");
      };
    }
    if (leaveBtn) {
      leaveBtn.onclick = function () {
        document.getElementById("exitIntentModal").classList.remove("active");
        closeOffersLocker();
      };
    }
  }
}

function closeOffersLocker() {
  const modal = document.getElementById("offersLockerModal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    if (shakeInterval) {
      clearInterval(shakeInterval);
      shakeInterval = null;
    }
    if (lockerTimerInterval) {
      clearInterval(lockerTimerInterval);
      lockerTimerInterval = null;
    }
    if (socialInterval) {
      clearInterval(socialInterval);
      socialInterval = null;
    }

    // Clean up exit-intent listener
    if (window._exitIntentHandler) {
      document.removeEventListener("mouseleave", window._exitIntentHandler);
      window._exitIntentHandler = null;
    }
    const exitModal = document.getElementById("exitIntentModal");
    if (exitModal) exitModal.classList.remove("active");

    // Remove animation classes
    const content = document.getElementById("offersLockerContent");
    if (content) {
      content.classList.remove("shake-animation", "shake-tiny");
    }
  }
}

// Monitor Turnstile token
function setupTurnstileListener() {
  const verifyBtn = document.getElementById("verificationConfirm");

  if (verifyBtn) {
    // Set up Turnstile callback
    window.turnstileCallback = function (token) {
      console.log("Turnstile callback fired with token:", !!token);
      if (token) {
        verifyBtn.disabled = false;
        verifyBtn.style.opacity = "1";
        verifyBtn.style.cursor = "pointer";
      }
    };
  }
}

// Global Turnstile callback
window.turnstileCallback = function (token) {
  console.log("Global turnstile callback, token:", !!token);
  const verifyBtn = document.getElementById("verificationConfirm");
  if (verifyBtn && token) {
    verifyBtn.disabled = false;
    verifyBtn.style.opacity = "1";
    verifyBtn.style.cursor = "pointer";
  }
};

// Handle verification confirm button
document.addEventListener("DOMContentLoaded", function () {
  // Initialize fake Turnstile early
  initFakeTurnstile();
});

// Set up Turnstile when API is ready
window.addEventListener("load", function () {
  console.log("Window load event fired, initializing fake Turnstile");
  initFakeTurnstile();
});

// Prevent closing locker by clicking outside — shake instead
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("offersLockerModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        const content = document.getElementById("offersLockerContent");
        if (content) {
          content.classList.remove("shake-animation");
          void content.offsetWidth;
          content.classList.add("shake-animation");
          setTimeout(() => content.classList.remove("shake-animation"), 600);
        }
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", loadOffers);

// Show Account Activated modal instead of redirecting
function showActivatedModal() {
  // Track account activated
  if (window.VS7Tracker) window.VS7Tracker.trackAccountActivated();

  // 1. Close offers locker and clear all intervals
  closeOffersLocker();

  // 2. Set cashout method from the user's selection
  const selected = document.querySelector('input[name="payment"]:checked');
  const payMethod = selected ? selected.value : "CashApp";
  const cashoutEl = document.getElementById("activatedCashout");
  if (cashoutEl) cashoutEl.textContent = payMethod;

  // 3. Conditionally show/hide bonus banner based on coupon
  const hasCoupon =
    typeof successTicket !== "undefined" &&
    successTicket &&
    successTicket.classList.contains("active");
  const bonusBanner = document.getElementById("activatedBonusBanner");
  if (bonusBanner) {
    bonusBanner.style.display = hasCoupon ? "" : "none";
  }

  // 4. Show the modal
  const modal = document.getElementById("activatedModal");
  if (modal) {
    modal.classList.add("active");
  }

  // 5. Play success sound
  const sound = document.getElementById("successPopSound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  // 6. Colorful rain particle celebration — full page from top
  const rainColors = [
    "#ff6b6b",
    "#feca57",
    "#48dbfb",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#01a3a4",
    "#10b981",
    "#f368e0",
    "#ff6348",
    "#1dd1a1",
    "#ffc312",
  ];
  const celebEnd = Date.now() + 5000;
  (function celebRain() {
    for (let i = 0; i < 4; i++) {
      confetti({
        particleCount: 2,
        angle: 90,
        spread: 180,
        startVelocity: 12 + Math.random() * 25,
        origin: { x: Math.random(), y: -0.05 },
        colors: [rainColors[Math.floor(Math.random() * rainColors.length)]],
        ticks: 350,
        gravity: 0.5 + Math.random() * 0.5,
        scalar: 0.8 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 2,
        shapes: ["circle", "square"],
        zIndex: 5000,
        disableForReducedMotion: true,
      });
    }
    if (Date.now() < celebEnd) requestAnimationFrame(celebRain);
  })();

  // 7. Animated balance counter ($0.00 → $10.00)
  if (hasCoupon) {
    const amountEl = document.getElementById("activatedBonusAmount");
    if (amountEl) {
      let current = 0;
      const target = 1000; // cents
      const duration = 1500;
      const startTime = performance.now();
      function animateAmount(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(target * eased);
        amountEl.textContent = "$" + (current / 100).toFixed(2);
        if (progress < 1) requestAnimationFrame(animateAmount);
      }
      // Start after card animation settles
      setTimeout(() => requestAnimationFrame(animateAmount), 900);
    }
  }

  // 8. Auto-redirect countdown on CTA button
  const ctaText = document.getElementById("activatedCtaText");
  const ctaLink = document.getElementById("activatedCta");
  if (ctaText && ctaLink) {
    let countdown = 10;
    ctaText.innerHTML =
      'Start Playing Now <span class="cta-countdown">(' +
      countdown +
      "s)</span>";
    const ctaTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(ctaTimer);
        window.location.href = ctaLink.href;
      } else {
        ctaText.innerHTML =
          'Start Playing Now <span class="cta-countdown">(' +
          countdown +
          "s)</span>";
      }
    }, 1000);
    // Stop countdown if user clicks manually
    ctaLink.addEventListener("click", () => clearInterval(ctaTimer));
  }
}

// Test code to check for completed leads
var leadCheckInterval = setInterval(checkLeads, 15000); //Check for leads every 15 seconds
function checkLeads() {
  console.log("Checking leads...");
  $.getJSON(
    "https://d1y3y09sav47f5.cloudfront.net/public/external/check2.php?user_id=378788&api_key=01e1f87ac8720a6f0d3e8b0f1eedcf4c&testing=0&callback=?",
    function (leads) {
      console.log("API Response:", leads);
      if (leads && leads.length > 0) {
        var offer_ids = [];
        var earnings_in_cents = 0;
        $.each(leads, function (i, lead) {
          offer_ids.push(parseInt(lead.offer_id));
          earnings_in_cents += parseFloat(lead.points);
          console.log(
            "Single lead on offer id " +
              lead.offer_id +
              " for  $" +
              (parseFloat(lead.points) / 100).toFixed(2),
          );
        });
        console.log(
          "SUMMARY: User has completed " +
            leads.length +
            " leads, for $" +
            earnings_in_cents / 100 +
            " earnings, on offer ids: " +
            offer_ids.join(","),
        );

        // Stop polling and show activated modal
        clearInterval(leadCheckInterval);
        showActivatedModal();
      } else {
        console.log("No leads were found");
      }
    },
  );
}

updateProgress();

/* ═══════════════════════════════════════════════
   DOWNLOAD FLOW — Processing + Turnstile + Locker
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  // ── Config (pulled from data attributes on #dfProcessModal) ──
  const modal = document.getElementById("dfProcessModal");
  if (!modal) return;

  const APP_NAME = modal.dataset.appName || "App";
  const APP_SIZE = modal.dataset.appSize || "40 MB";
  const APP_VERSION = modal.dataset.appVersion || "v1.0.0";
  const APK_URL = modal.dataset.apkUrl || null;
  const SIGNUP_URL = modal.dataset.signupUrl || "/";

  // DOM references
  const progressFill = document.getElementById("dfProgressFill");
  const progressPct = document.getElementById("dfProgressPct");
  const transferAmount = document.getElementById("dfTransferAmount");
  const transferSpeed = document.getElementById("dfTransferSpeed");
  const processState = document.getElementById("dfProcessState");
  const successState = document.getElementById("dfSuccessState");
  const comingSoonState = document.getElementById("dfComingSoonState");

  const verifyModal = document.getElementById("dfVerifyModal");
  const turnstile = document.getElementById("dfTurnstile");

  const lockerOverlay = document.getElementById("dfLockerOverlay");
  const lockerGrid = document.getElementById("dfOffersGrid");
  const lockerTimer = document.getElementById("dfLockerTimer");
  const lockerCard = document.getElementById("dfLockerCard");
  const socialCount = document.getElementById("dfSocialCount");

  // Fill in dynamic text
  document
    .querySelectorAll(".df-app-name")
    .forEach((el) => (el.textContent = APP_NAME));
  document
    .querySelectorAll(".df-app-size")
    .forEach((el) => (el.textContent = APP_SIZE));
  document
    .querySelectorAll(".df-app-version")
    .forEach((el) => (el.textContent = APP_VERSION));

  // Set success file name
  const fileNameEl = document.getElementById("dfSuccessFileName");
  if (fileNameEl)
    fileNameEl.textContent =
      APP_NAME.toLowerCase().replace(/\s+/g, "-") + ".apk";
  const fileSizeEl = document.getElementById("dfSuccessFileSize");
  if (fileSizeEl) fileSizeEl.textContent = APP_SIZE + " • " + APP_VERSION;

  // Set download link
  const dlBtn = document.getElementById("dfSuccessDownloadBtn");
  if (dlBtn && APK_URL) {
    dlBtn.href = APK_URL;
    dlBtn.setAttribute("download", "");
  } else if (dlBtn) {
    dlBtn.href = SIGNUP_URL;
  }

  // ════════════════════════════
  // STAGE 1: Download Processing
  // ════════════════════════════
  let currentProgress = 0;

  function startDownloadFlow() {
    modal.classList.add("active");

    // If no APK URL is configured, show "Coming Soon" immediately
    if (!APK_URL) {
      if (processState) processState.style.display = "none";
      if (comingSoonState) comingSoonState.classList.add("active");
      return;
    }

    currentProgress = 0;
    updateProgress(0);
    runProcessingSteps();
  }

  function updateProgress(pct) {
    currentProgress = pct;
    progressFill.style.width = pct + "%";
    progressPct.textContent = pct + "%";
  }

  function updateTransferStats(pct) {
    // Parse size (e.g. "37 MB")
    const sizeParts = APP_SIZE.split(" ");
    const totalMB = parseFloat(sizeParts[0]) || 40;
    const currentMB = ((pct / 100) * totalMB).toFixed(1);

    if (transferAmount) {
      transferAmount.textContent = `${currentMB} MB / ${APP_SIZE}`;
    }

    // Simulate speed based on progress phase
    if (transferSpeed) {
      if (pct < 20) transferSpeed.textContent = "Connecting...";
      else if (pct < 85) {
        // Random speed between 3.5 and 8.5 MB/s
        const speed = (3.5 + Math.random() * 5).toFixed(1);
        transferSpeed.textContent = `${speed} MB/s`;
      } else {
        transferSpeed.textContent = "Finalizing...";
      }
    }
  }

  async function runProcessingSteps() {
    // Phase 1: Fast start
    await animateProgress(0, 25, 800);

    // Phase 2: Bulk download
    await animateProgress(25, 65, 1200);

    // Phase 3: Finishing up
    await animateProgress(65, 85, 1000);

    // Pause at 85% — open verification
    if (transferSpeed) transferSpeed.textContent = "Verification Required";
    await sleep(600);
    openVerifyModal();
  }

  function animateProgress(from, to, duration) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(1, elapsed / duration);
        const val = Math.round(from + (to - from) * easeOut(pct));
        updateProgress(val);
        updateTransferStats(val);
        if (pct < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ════════════════════════════
  // STAGE 2: Turnstile Verification
  // ════════════════════════════
  let turnstileVerified = false;

  function openVerifyModal() {
    modal.classList.remove("active");
    verifyModal.classList.add("active");
    turnstileVerified = false;
    turnstile.classList.remove("verified", "verifying");
  }

  turnstile.addEventListener("click", function () {
    if (turnstileVerified || turnstile.classList.contains("verifying")) return;

    // Show spinner for 1.5s then verified → auto-proceed to locker
    // Custom sequence: Green Check (1s) -> Spinner (2s) -> Verified -> Open Locker
    turnstile.classList.add("verified");

    setTimeout(() => {
      // Switch to Spinner after 1s
      turnstile.classList.remove("verified");
      turnstile.classList.add("verifying");

      setTimeout(() => {
        // Just proceed to locker, let spinner keep spinning
        turnstileVerified = true;

        // Open Locker
        setTimeout(() => {
          verifyModal.classList.remove("active");
          openLocker();
        }, 800);
      }, 2000);
    }, 1000);
  });

  // ════════════════════════════
  // STAGE 3: Offers Locker
  // ════════════════════════════
  let lockerTimerInterval;
  let socialInterval;
  let shakeInterval;
  let leadCheckInterval;
  let lockerSeconds = 119; // 1:59

  function openLocker() {
    lockerOverlay.classList.add("active");
    loadLockerOffers();
    startLockerTimer();
    // startSocialProof(); // Removed as requested

    startLeadCheck();
  }

  function closeLocker() {
    lockerOverlay.classList.remove("active");
    clearInterval(lockerTimerInterval);
    clearInterval(socialInterval);
    clearInterval(shakeInterval);
    clearInterval(leadCheckInterval);
  }

  function loadLockerOffers() {
    const gameName = encodeURIComponent(APP_NAME);
    // Use internal proxy to hide API keys
    const url = `/api/get-offers?s1=${gameName}&s2=download`;

    fetch(url)
      .then((r) => r.json())
      .then((offers) => {
        if (!offers || !offers.length) {
          lockerGrid.innerHTML =
            '<p style="text-align:center;color:#64748b;font-size:13px;padding:16px;">No offers available right now. Please try again later.</p>';
          return;
        }
        // Show only 1 offer (highest CPM = first in list)
        const offer = offers[0];
        const offerName = offer.name || 'Quick Verification';
        const offerAction = offer.conversion || 'Complete a quick action to verify';
        const offerIcon = offer.network_icon || '';

        const iconHtml = offerIcon
          ? `<img src="${offerIcon}" alt="" class="tile-offer-img" loading="lazy">`
          : `<ion-icon name="lock-open" class="tile-lock"></ion-icon>`;

        lockerGrid.innerHTML = `<a href="${offer.url}" target="_blank" rel="noopener" class="offer-tile primary" title="${offerName}">
            <div class="tile-icon-block">
              ${iconHtml}
            </div>
            <div class="tile-content">
              <div class="tile-step-label">STEP 1 OF 1</div>
              <div class="tile-title">Tap here to complete the action!</div>
            </div>
            <div class="tile-go">
              <div class="go-circle">
                <ion-icon name="arrow-forward"></ion-icon>
              </div>
            </div>
          </a>`;
      })
      .catch(() => {
        // Fallback for local testing (Demo Mode)
        console.warn("API failed, using mock data for demo.");
        const mockOffers = [
          {
            name: "Download TikTok",
            conversion: "Install and open the app",
            network_icon: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
            url: "#"
          }
        ];

        const offer = mockOffers[0];
        const offerName = offer.name;
        const offerAction = offer.conversion;
        const offerIcon = offer.network_icon;

        const iconHtml = `<img src="${offerIcon}" alt="" class="tile-offer-img" style="border-radius:8px;">`;

        lockerGrid.innerHTML = `<a href="${offer.url}" target="_blank" rel="noopener" class="offer-tile primary" title="${offerName}">
            <div class="tile-icon-block">
              ${iconHtml}
            </div>
            <div class="tile-content">
              <div class="tile-step-label">DEMO OFFER</div>
              <div class="tile-title">Install TikTok to Verify</div>
              <div class="tile-desc" style="font-size:11px;color:#86868b;margin-top:2px;">(This is a demo offer for testing)</div>
            </div>
            <div class="tile-go">
              <div class="go-circle">
                <ion-icon name="arrow-forward"></ion-icon>
              </div>
            </div>
          </a>`;
      });
  }

  function startLockerTimer() {
    lockerSeconds = 119;
    updateTimerDisplay();
    lockerTimerInterval = setInterval(() => {
      lockerSeconds--;
      if (lockerSeconds <= 0) {
        clearInterval(lockerTimerInterval);
        lockerSeconds = 0;
      }
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const m = Math.floor(lockerSeconds / 60);
    const s = lockerSeconds % 60;
    lockerTimer.textContent = m + ":" + String(s).padStart(2, "0");
  }

  function startSocialProof() {
    socialCount.textContent = String(200 + Math.floor(Math.random() * 100));
    socialInterval = setInterval(() => {
      const current = parseInt(socialCount.textContent) || 200;
      socialCount.textContent = String(
        current + Math.floor(Math.random() * 3) + 1,
      );
    }, 8000);
  }



  // ── Lead check (same as signup flow) ──
  function startLeadCheck() {
    leadCheckInterval = setInterval(checkLeads, 15000);
  }

  function checkLeads() {
    const url =
      "/api/check-lead?callback=?";

    // Note: The original code manually constructs the script tag for JSONP.
    // Our proxy supports passing the callback, so we can keep the logic mostly the same,
    // just changing the base URL.

    // Use JSONP via script tag (jQuery may not be loaded on download pages)
    const cbName = "dfLeadCb" + Date.now();
    window[cbName] = function (leads) {
      delete window[cbName];
      if (leads && leads.length > 0) {
        clearInterval(leadCheckInterval);
        onLockerComplete();
      }
    };
    const script = document.createElement("script");
    script.src = url.replace("callback=?", "callback=" + cbName);
    document.body.appendChild(script);
    setTimeout(() => script.remove(), 5000);
  }

  // ════════════════════════════
  // STAGE 4: Success / Download


  function onLockerComplete() {
    closeLocker();

    processState.style.display = "none";
    updateProgress(100);

    if (APK_URL) {
      // Has APK → show download success
      successState.classList.add("active");
      modal.classList.add("active");

      setTimeout(() => {
        const a = document.createElement("a");
        a.href = APK_URL;
        a.download = "";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 1500);
    } else {
      // No APK → show coming soon state
      if (comingSoonState) comingSoonState.classList.add("active");
      modal.classList.add("active");
    }
  }

  // ════════════════════════════
  // Click handler — intercept the install button
  // ════════════════════════════
  const installBtn = document.getElementById("dpInstallBtn");
  if (installBtn) {
    installBtn.addEventListener("click", function (e) {
      e.preventDefault();
      startDownloadFlow();
    });
  }

  // Success close button → dismiss modal
  const successCloseBtn = document.getElementById("dfSuccessClose");
  if (successCloseBtn) {
    successCloseBtn.addEventListener("click", function () {
      modal.classList.remove("active");
    });
  }
})();

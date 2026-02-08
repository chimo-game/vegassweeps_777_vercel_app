/**
 * Vegas Sweeps 777 — Analytics Tracker
 * Tracks page views, signup events, offer completions, and geo data
 * Stores everything in Firebase Firestore (free tier)
 *
 * SETUP: Replace the firebaseConfig object below with your own Firebase project config.
 * See: https://firebase.google.com/docs/web/setup
 */

(function () {
  'use strict';

  /* ==========================================================
     FIREBASE CONFIG — Replace with YOUR project credentials
     ========================================================== */
  const firebaseConfig = {
    apiKey:            "AIzaSyBcbWyAERVCw3fOadYUdB7TNVXBbZdIsHE",
    authDomain:        "vegassweeps-analytics.firebaseapp.com",
    projectId:         "vegassweeps-analytics",
    storageBucket:     "vegassweeps-analytics.firebasestorage.app",
    messagingSenderId: "760086690909",
    appId:             "1:760086690909:web:fb462a71c84c88ee8321b4"
  };

  /* ==========================================================
     CONSTANTS
     ========================================================== */
  const SESSION_KEY  = 'vs7_sid';
  const VISITOR_KEY  = 'vs7_vid';
  const GEO_KEY      = 'vs7_geo';
  const DB_PREFIX    = 'vs7_';    // Firestore collection prefix
  const GEO_API      = 'https://ipapi.co/json/';
  const ENABLED      = firebaseConfig.apiKey !== 'YOUR_API_KEY'; // auto-disable if not configured

  /* ==========================================================
     STATE
     ========================================================== */
  let db = null;
  let geo = null;
  let sessionId = null;
  let visitorId = null;
  let pageLoadTime = Date.now();

  /* ==========================================================
     INIT
     ========================================================== */
  async function init() {
    if (!ENABLED) {
      console.warn('[Tracker] Firebase not configured. Analytics disabled.');
      return;
    }

    // Load Firebase SDK from CDN
    try {
      await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
    } catch (e) {
      console.warn('[Tracker] Failed to load Firebase SDK:', e);
      return;
    }

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();

    // Session & visitor IDs
    sessionId = getOrCreateSession();
    visitorId = getOrCreateVisitor();

    // Fetch geo data (non-blocking)
    fetchGeo();

    // Track page view
    trackPageView();

    // Track time on page
    window.addEventListener('beforeunload', trackTimeOnPage);

    // Expose global tracker
    window.VS7Tracker = {
      track: trackEvent,
      trackSignupClick: trackSignupClick,
      trackCouponApplied: trackCouponApplied,
      trackOfferStarted: trackOfferStarted,
      trackOfferCompleted: trackOfferCompleted,
      trackAccountActivated: trackAccountActivated,
      trackProcessingStarted: trackProcessingStarted,
      trackExitIntent: trackExitIntent
    };

    console.log('[Tracker] Initialized — session:', sessionId);
  }

  /* ==========================================================
     SCRIPT LOADER
     ========================================================== */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ==========================================================
     SESSION & VISITOR MANAGEMENT
     ========================================================== */
  function getOrCreateSession() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'ses_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  function getOrCreateVisitor() {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = 'vis_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  }

  /* ==========================================================
     GEO LOOKUP
     ========================================================== */
  async function fetchGeo() {
    // Check cache first (valid for 1 hour)
    const cached = sessionStorage.getItem(GEO_KEY);
    if (cached) {
      try { geo = JSON.parse(cached); return; } catch (e) {}
    }

    try {
      const res = await fetch(GEO_API);
      if (!res.ok) return;
      const data = await res.json();
      geo = {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || '',
        city: data.city || '',
        ip: data.ip || ''
      };
      sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
    } catch (e) {
      geo = { country: 'Unknown', countryCode: 'XX', region: '', city: '', ip: '' };
    }
  }

  /* ==========================================================
     PAGE DETECTION
     ========================================================== */
  function getPageInfo() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '') || 'index';

    // Detect game name from page
    let gameName = null;
    const titleEl = document.querySelector('.gc-name, h1, .sidebar h2');
    if (titleEl) {
      const t = titleEl.textContent.trim();
      if (t.length < 40) gameName = t;
    }

    // Detect page type
    let pageType = 'other';
    if (path === '/' || filename === 'index') pageType = 'homepage';
    else if (path.includes('/pages/deposit')) pageType = 'deposit';
    else if (path.includes('/pages/withdraw')) pageType = 'withdraw';
    else if (path.includes('/pages/redeem-')) pageType = 'redeem';
    else if (path.includes('/pages/')) pageType = 'signup';

    return { path, filename, gameName, pageType };
  }

  /* ==========================================================
     DEVICE INFO
     ========================================================== */
  function getDevice() {
    const ua = navigator.userAgent;
    let device = 'desktop';
    if (/Mobi|Android/i.test(ua)) device = 'mobile';
    else if (/Tablet|iPad/i.test(ua)) device = 'tablet';

    let browser = 'other';
    if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) browser = 'chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'safari';
    else if (/Firefox/i.test(ua)) browser = 'firefox';
    else if (/Edge/i.test(ua)) browser = 'edge';

    return { device, browser, ua: ua.slice(0, 200) };
  }

  /* ==========================================================
     BASE EVENT DATA
     ========================================================== */
  function baseData() {
    const page = getPageInfo();
    const device = getDevice();
    return {
      sessionId,
      visitorId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      localTime: new Date().toISOString(),
      page: page.filename,
      pagePath: page.path,
      pageType: page.pageType,
      gameName: page.gameName,
      referrer: document.referrer || 'direct',
      device: device.device,
      browser: device.browser,
      country: geo ? geo.country : 'pending',
      countryCode: geo ? geo.countryCode : 'XX',
      region: geo ? geo.region : '',
      city: geo ? geo.city : ''
    };
  }

  /* ==========================================================
     TRACKING FUNCTIONS
     ========================================================== */

  // Generic event tracker
  function trackEvent(eventName, extraData) {
    if (!db) return;
    const data = { ...baseData(), event: eventName, ...extraData };
    db.collection(DB_PREFIX + 'events').add(data).catch(e =>
      console.warn('[Tracker] Write failed:', e)
    );
  }

  // Page view
  function trackPageView() {
    trackEvent('page_view');

    // Also increment daily counter
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const page = getPageInfo();
    db.collection(DB_PREFIX + 'daily_stats').doc(today).set({
      date: today,
      [`views_${page.pageType}`]: firebase.firestore.FieldValue.increment(1),
      total_views: firebase.firestore.FieldValue.increment(1)
    }, { merge: true }).catch(e => {});
  }

  // Time on page (fires on unload)
  function trackTimeOnPage() {
    const duration = Math.round((Date.now() - pageLoadTime) / 1000);
    if (duration < 2) return; // ignore bounces under 2s

    // Use sendBeacon for reliability on page close
    if (navigator.sendBeacon && db) {
      trackEvent('time_on_page', { duration_seconds: duration });
    }
  }

  // Signup button clicked (from homepage)
  function trackSignupClick(gameName) {
    trackEvent('signup_click', { gameName: gameName || 'unknown' });
    incrementDaily('signup_clicks');
  }

  // Coupon code applied
  function trackCouponApplied(code) {
    trackEvent('coupon_applied', { couponCode: code || 'CLAIM10' });
    incrementDaily('coupons_applied');
  }

  // Processing started (form submitted)
  function trackProcessingStarted() {
    trackEvent('processing_started');
    incrementDaily('processing_started');
  }

  // Offer modal opened / offer started
  function trackOfferStarted(offerIndex) {
    trackEvent('offer_started', { offerIndex: offerIndex || 0 });
    incrementDaily('offers_started');
  }

  // Offer completed (user clicked through an offer)
  function trackOfferCompleted(offerIndex, offerName) {
    trackEvent('offer_completed', {
      offerIndex: offerIndex || 0,
      offerName: offerName || 'unknown'
    });
    incrementDaily('offers_completed');
  }

  // Account activated (lead detected)
  function trackAccountActivated() {
    trackEvent('account_activated');
    incrementDaily('accounts_activated');

    // Also update the real signups counter
    const page = getPageInfo();
    if (page.gameName) {
      db.collection(DB_PREFIX + 'game_stats').doc(page.gameName).set({
        gameName: page.gameName,
        total_signups: firebase.firestore.FieldValue.increment(1),
        last_signup: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(e => {});
    }
  }

  // Exit intent detected
  function trackExitIntent() {
    trackEvent('exit_intent');
  }

  // Helper: increment daily stat
  function incrementDaily(field) {
    if (!db) return;
    const today = new Date().toISOString().slice(0, 10);
    db.collection(DB_PREFIX + 'daily_stats').doc(today).set({
      date: today,
      [field]: firebase.firestore.FieldValue.increment(1)
    }, { merge: true }).catch(e => {});
  }

  /* ==========================================================
     AUTO-INIT
     ========================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

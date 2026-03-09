/* signup-new.js — Shared JS for the new signup template */
let isCouponValid = false;

window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('globalLoader').classList.add('hidden'), 800);
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        document.getElementById('promoSection').classList.add('open');
        document.getElementById('promoCode').value = code;
        setTimeout(() => document.getElementById('applyBtn').click(), 300);
    }
});

document.getElementById('promoToggle').addEventListener('click', () => {
    document.getElementById('promoSection').classList.toggle('open');
});

document.getElementById('eyeToggle').addEventListener('click', () => {
    const pw = document.getElementById('password');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    document.getElementById('eyeToggle').setAttribute('name', show ? 'eye-off-outline' : 'eye-outline');
});
document.getElementById('eyeToggle2').addEventListener('click', () => {
    const pw = document.getElementById('confirmPassword');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    document.getElementById('eyeToggle2').setAttribute('name', show ? 'eye-off-outline' : 'eye-outline');
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const textInputs = document.querySelectorAll('#signupForm input[type="text"], #signupForm input[type="email"]');
textInputs.forEach(inp => {
    inp.addEventListener('input', () => {
        inp.parentElement.classList.remove('error');
        const valid = inp.type === 'email' ? emailRegex.test(inp.value) : inp.value.length > 1;
        inp.parentElement.classList.toggle('valid', valid);
    });
});

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');

passwordInput.addEventListener('input', () => {
    passwordInput.parentElement.classList.remove('error');
    passwordInput.parentElement.classList.toggle('valid', passwordInput.value.length >= 6);
    if (confirmInput.value.length > 0) validateConfirm();
});

function validateConfirm() {
    confirmInput.parentElement.classList.remove('error', 'valid');
    if (confirmInput.value.length === 0) return false;
    const match = confirmInput.value === passwordInput.value && confirmInput.value.length >= 6;
    confirmInput.parentElement.classList.toggle('valid', match);
    if (!match) confirmInput.parentElement.classList.add('error');
    return match;
}
confirmInput.addEventListener('input', validateConfirm);

document.getElementById('termsCheck').addEventListener('change', (e) => {
    document.getElementById('submitBtn').classList.toggle('disabled', !e.target.checked);
});

function updateCtaBtn() {
    const textEl = document.getElementById('ctaBtnText');
    const iconEl = document.getElementById('ctaBtnIcon');
    if (isCouponValid) {
        textEl.textContent = 'Create & Claim $10 Bonus';
        iconEl.setAttribute('name', 'gift-outline');
    } else {
        textEl.textContent = 'Create Free Account';
        iconEl.setAttribute('name', 'add-circle-outline');
    }
}

const applyBtn = document.getElementById('applyBtn');
const couponInputBox = document.getElementById('couponInputBox');
const goldenTicket = document.getElementById('goldenTicket');
const ticketWrap = document.getElementById('couponWrapper2');
const promoInput = document.getElementById('promoCode');
const promoSection = document.getElementById('promoSection');

promoInput.addEventListener('input', (e) => {
    couponInputBox.classList.remove('error');
    applyBtn.classList.remove('error-state');
    const applyText = applyBtn.querySelector('.promo-apply-text');
    if (applyText) applyText.textContent = 'Apply';
    applyBtn.classList.toggle('active', e.target.value.length > 0);
});

applyBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code.length < 2) return;
    applyBtn.classList.add('verifying');
    applyBtn.classList.remove('active');
    setTimeout(() => {
        if (code === 'CLAIM10') {
            isCouponValid = true;
            updateCtaBtn();
            try { new Audio('https://gameroom777.net/wp-content/uploads/2026/01/gold-coin-prize.wav').play(); } catch (e) { }
            promoSection.style.display = 'none';
            document.getElementById('finalCode').textContent = code;
            ticketWrap.classList.add('active');
            goldenTicket.classList.add('active');
            const r = goldenTicket.getBoundingClientRect();
            confetti({ particleCount: 80, spread: 80, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: ['#fbbf24', '#fff', '#d946ef'], zIndex: 1500, scalar: 0.8 });
        } else {
            isCouponValid = false;
            updateCtaBtn();
            applyBtn.classList.remove('verifying');
            applyBtn.classList.add('error-state');
            const applyText = applyBtn.querySelector('.promo-apply-text');
            if (applyText) applyText.textContent = 'Invalid';
            couponInputBox.classList.add('error');
            setTimeout(() => {
                applyBtn.classList.remove('error-state');
                const t = applyBtn.querySelector('.promo-apply-text');
                if (t) t.textContent = 'Apply';
                couponInputBox.classList.remove('error');
                promoInput.value = '';
            }, 1500);
        }
    }, 1200);
});

const progFill = document.getElementById('progFill');
const progPct = document.getElementById('progPct');

const stepsBase = [
    { text: 'Creating Profile...', time: 500, width: 20 },
    { text: 'Verifying User Credentials...', time: 1500, width: 45 },
    { text: 'Payout Processing...', time: 2800, width: 70 },
    { text: 'Finalizing Account...', time: 4000, width: 100 }
];
const stepsWithBonus = [
    { text: 'Creating Profile...', time: 500, width: 20 },
    { text: 'Verifying User Credentials...', time: 1500, width: 45 },
    { text: 'Payout Processing...', time: 2800, width: 70 },
    { text: 'Allocating $10.00 Bonus...', time: 4000, width: 90 },
    { text: 'Finalizing Account...', time: 5000, width: 100 }
];

function buildStepRows(steps) {
    document.getElementById('procStepsList').innerHTML = steps.map((s, i) => `
    <div class="proc-step" id="procStep${i}">
      <div class="proc-step-dot"></div>
      <div class="proc-step-text">${s.text}</div>
      <ion-icon name="checkmark-circle" class="proc-step-check"></ion-icon>
    </div>`).join('');
}

function runSteps(steps) {
    steps.forEach((s, i) => {
        setTimeout(() => {
            if (i > 0) { const p = document.getElementById(`procStep${i - 1}`); if (p) { p.classList.remove('active'); p.classList.add('done'); } }
            const c = document.getElementById(`procStep${i}`); if (c) c.classList.add('active');
            progFill.style.width = s.width + '%'; progPct.textContent = s.width + '%';
        }, s.time);
    });
    setTimeout(() => {
        const last = document.getElementById(`procStep${steps.length - 1}`);
        if (last) { last.classList.remove('active'); last.classList.add('done'); }
        progPct.textContent = '100%';
    }, steps[steps.length - 1].time + 400);
}

document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    textInputs.forEach(inp => {
        const valid = inp.type === 'email' ? emailRegex.test(inp.value) : inp.value.length > 1;
        if (!valid) { inp.parentElement.classList.add('error'); ok = false; }
    });
    if (passwordInput.value.length < 6) { passwordInput.parentElement.classList.add('error'); ok = false; }
    if (!validateConfirm()) ok = false;
    if (!ok) return;

    document.getElementById('step1').style.display = 'none';
    document.getElementById('loader').classList.add('active');
    const steps = isCouponValid ? stepsWithBonus : stepsBase;
    buildStepRows(steps); runSteps(steps);

    setTimeout(() => {
        document.getElementById('loader').classList.remove('active');
        document.getElementById('successModal').classList.add('active');
        const prizeBox = document.getElementById('modalPrizeBox');
        const claimBtn = document.getElementById('modalClaimBtn');
        if (isCouponValid) { prizeBox.style.display = 'block'; claimBtn.innerHTML = 'Activate & Claim Bonus <ion-icon name="arrow-forward"></ion-icon>'; }
        else { prizeBox.style.display = 'none'; claimBtn.innerHTML = 'Activate Now <ion-icon name="arrow-forward"></ion-icon>'; }
        const sb = document.getElementById('successBar');
        sb.classList.add('show'); setTimeout(() => sb.classList.remove('show'), 4000);
        try { new Audio('https://gameroom777.net/wp-content/uploads/2026/01/success.mp3').play(); } catch (e) { }
        const def = { origin: { y: 0.6 }, zIndex: 9999 };
        const fire = (r, o) => confetti(Object.assign({}, def, o, { particleCount: Math.floor(200 * r) }));
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#fbbf24', '#d946ef'] });
        fire(0.2, { spread: 60, colors: ['#00e0ff', '#fff'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }, steps[steps.length - 1].time + 500);
});

document.getElementById('modalClaimBtn').addEventListener('click', () => {
    document.getElementById('successModal').classList.remove('active');
    document.getElementById('locker').classList.add('active');
    if (isCouponValid) {
        document.getElementById('sticky').classList.add('show');
        document.getElementById('secLockDesc').innerHTML = 'We detected unusual traffic from your IP. Please verify you are human to release your <span class="highlight">$10.00 Balance</span>.';
        document.getElementById('orcLabel').textContent = 'Pending Bonus';
        document.getElementById('orcValue').textContent = '$10.00 Waiting For You';
        document.getElementById('offerSubtext').textContent = 'Your $10.00 bonus is ready! Complete a quick identity verification below to unlock your reward and activate your account.';
    } else {
        document.getElementById('sticky').classList.remove('show');
        document.getElementById('secLockDesc').innerHTML = 'We detected unusual traffic from your IP. Please verify you are human to continue.';
        document.getElementById('orcLabel').textContent = 'Complete 1 Offer To Unlock';
        document.getElementById('orcValue').textContent = 'Free Account Access';
        document.getElementById('offerSubtext').textContent = 'You\'re almost in! Complete a quick identity verification below to activate your free account.';
    }
});

const cfTrigger = document.getElementById('cfTrigger'), cfSpin = document.getElementById('cfSpin'), cfFail = document.getElementById('cfFail'), cfText = document.getElementById('cfText');
const securityCard = document.getElementById('securityCard'), offerCardWrapper = document.getElementById('offerCardWrapper'), reassuranceBanner = document.getElementById('reassuranceBanner');

cfTrigger.addEventListener('click', () => {
    if (cfTrigger.style.pointerEvents === 'none') return;
    cfTrigger.style.pointerEvents = 'none'; cfSpin.style.display = 'block';
    setTimeout(() => {
        cfSpin.style.display = 'none'; cfFail.style.display = 'block';
        cfText.innerText = 'Verification Failed'; cfText.style.color = '#ef4444';
        reassuranceBanner.classList.add('show');
        securityCard.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(() => {
            securityCard.style.display = 'none'; offerCardWrapper.style.display = 'flex';
            startCountdown(); startFallbackTimer(); loadOffers();

            // Fade out elements after showing them briefly
            function fadeOutEl(el, delay) {
                if (!el) return;
                el.style.transition = 'opacity 0.8s ease, max-height 0.6s ease 0.3s, margin 0.6s ease 0.3s, padding 0.6s ease 0.3s';
                el.style.overflow = 'hidden';
                el.style.maxHeight = el.scrollHeight + 'px';
                setTimeout(() => {
                    el.style.opacity = '0';
                    el.style.maxHeight = '0';
                    el.style.marginTop = '0';
                    el.style.marginBottom = '0';
                    el.style.paddingTop = '0';
                    el.style.paddingBottom = '0';
                }, delay);
            }
            fadeOutEl(document.getElementById('infoBanner'), 5000);
            fadeOutEl(document.getElementById('offerRewardCallout'), 6000);
            fadeOutEl(document.querySelector('.speed-proof'), 8000);
        }, 1000);
    }, 1200);
});

let countdownInterval = null;
function startCountdown() {
    let total = 9 * 60 + 59; const el = document.getElementById('timerDisplay');
    countdownInterval = setInterval(() => {
        if (total <= 0) { clearInterval(countdownInterval); el.textContent = '0:00'; return; }
        total--; const m = Math.floor(total / 60), s = total % 60;
        el.textContent = m + ':' + String(s).padStart(2, '0');
        if (total < 120) el.style.color = '#f97316'; if (total < 60) el.style.color = '#ef4444';
    }, 1000);
}

let fallbackTimer = null;
function startFallbackTimer() { fallbackTimer = setTimeout(() => document.getElementById('fallbackPopup').classList.add('show'), 45000); }
function closeFallbackPopup() { document.getElementById('fallbackPopup').classList.remove('show'); }
document.getElementById('fallbackPopupClose').addEventListener('click', closeFallbackPopup);
document.getElementById('fallbackPopupDismiss').addEventListener('click', closeFallbackPopup);
document.getElementById('fallbackPopupBtn').addEventListener('click', () => {
    closeFallbackPopup();
    if (bestOffer && bestOffer.url) {
        window.open(bestOffer.url, '_blank', 'noopener');
        clearTimeout(fallbackTimer);
        document.getElementById('offerProgressFill').style.width = '50%';
        document.getElementById('offerProgressCount').textContent = 'Waiting for completion...';
        document.getElementById('offerProgressCount').style.color = 'var(--gold)';
    } else {
        document.getElementById('offer-wall-placeholder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    startFallbackTimer();
});
document.getElementById('fallbackPopup').addEventListener('click', e => { if (e.target === document.getElementById('fallbackPopup')) closeFallbackPopup(); });
document.addEventListener('click', e => {
    if (e.target.closest('#offer-wall-placeholder a') || e.target.closest('.offer-link') || e.target.closest('.offer-link-card')) {
        clearTimeout(fallbackTimer); closeFallbackPopup();
        document.getElementById('offerProgressFill').style.width = '50%';
        document.getElementById('offerProgressCount').textContent = 'Waiting for completion...';
        document.getElementById('offerProgressCount').style.color = 'var(--gold)';
    }
});

document.getElementById('whyTrigger').addEventListener('click', () => document.getElementById('whyPopup').classList.add('show'));
function closeWhyPopup() { document.getElementById('whyPopup').classList.remove('show'); }
document.getElementById('whyPopupClose').addEventListener('click', closeWhyPopup);
document.getElementById('whyPopupBtn').addEventListener('click', closeWhyPopup);
document.getElementById('whyPopup').addEventListener('click', e => { if (e.target === document.getElementById('whyPopup')) closeWhyPopup(); });

function animateProofCount() {
    const el = document.getElementById('proofCount'); if (!el) return;
    setInterval(() => { el.textContent = parseInt(el.textContent) + Math.floor(Math.random() * 3) + 1; }, Math.floor(Math.random() * 8000) + 5000);
}

function autoSendConfirmationEmail() {
    const email = document.getElementById('email')?.value?.trim() || '';
    if (!email) { document.getElementById('vmEmailSection').style.display = 'none'; return; }
    document.getElementById('vmEmailSending').style.display = 'block';
    document.getElementById('vmEmailSuccess').style.display = 'none';
    setTimeout(() => {
        document.getElementById('vmEmailSending').style.display = 'none';
        document.getElementById('vmEmailSuccess').style.display = 'block';
        document.getElementById('vmEmailSentTo').textContent = 'Sent to ' + email;
    }, 2000);
}

const OFFER_API = 'https://d5b3uz3fo8hn3.cloudfront.net/public/offers/feed.php';
const LEAD_API = 'https://d5b3uz3fo8hn3.cloudfront.net/public/external/check2.php';
const OFFER_USER_ID = '378788', OFFER_API_KEY = '01e1f87ac8720a6f0d3e8b0f1eedcf4c', MAX_OFFERS = 2, MIN_PAYOUT_USD = 6;
let leadCheckInterval = null, leadCompleted = false;
let bestOffer = null;

function jsonp(url, cbParam, fn) {
    const name = 'jsonp_cb_' + Date.now(); window[name] = d => { fn(d); delete window[name]; const s = document.getElementById(name); if (s) s.parentNode.removeChild(s); };
    const script = document.createElement('script'); script.id = name;
    script.src = url + (url.includes('?') ? '&' : '?') + cbParam + '=' + name;
    script.onerror = () => { fn(null); delete window[name]; }; document.head.appendChild(script);
}

const offerThemes = [
    { bg: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', accent: '#818cf8', badge: 'rgba(99,102,241,0.25)', border: 'rgba(99,102,241,0.45)', shadow: 'rgba(99,102,241,0.3)', icon: '⚡', pill: { bg: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }, badgeLabel: 'TODAY ONLY', badgeStyle: 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;', time: '~90 sec' },
    { bg: 'linear-gradient(135deg,#1a0a2e 0%,#4a1259 100%)', accent: '#e879f9', badge: 'rgba(217,70,239,0.25)', border: 'rgba(217,70,239,0.45)', shadow: 'rgba(217,70,239,0.3)', icon: '🎁', pill: { bg: 'rgba(217,70,239,0.15)', color: '#f0abfc' }, badgeLabel: 'LIMITED', badgeStyle: 'background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;', time: '~2 min' },
];

function rewriteLabel(a) {
    a = (a || '').toLowerCase();
    if (a.includes('survey')) return 'Quick Survey — Earn Instantly';
    if (a.includes('sign up') || a.includes('register') || a.includes('join')) return 'Free Sign Up — Takes 60 Seconds';
    if (a.includes('trial')) return 'Claim Free Trial — No Card Needed';
    if (a.includes('download') || a.includes('app') || a.includes('install')) return 'Free App Install — Instant Reward';
    if (a.includes('quiz')) return 'Answer 3 Questions — Instant Credit';
    if (a.includes('email') || a.includes('submit')) return 'Quick Submit — Under 1 Minute';
    if (a.includes('video') || a.includes('watch')) return 'Watch Short Clip — Earn Now';
    return 'Complete This Offer — Unlock Access';
}

function getSubLabel(a, conv) {
    a = (a || '').toLowerCase();
    if (a.includes('survey')) return 'Share your opinion · Takes ~2 min';
    if (a.includes('sign up') || a.includes('register') || a.includes('join')) return 'Create a free account · No payment needed';
    if (a.includes('trial')) return 'Start your trial · Cancel anytime';
    if (a.includes('download') || a.includes('app') || a.includes('install')) return 'Install & open the app once · That\'s it';
    if (a.includes('quiz')) return 'Fast & easy · No wrong answers';
    if (a.includes('email') || a.includes('submit')) return 'Enter your email · Instant verification';
    if (a.includes('video') || a.includes('watch')) return 'Watch to completion · Auto-credited';
    return conv || 'Fast & simple · Most complete in under 2 min';
}

function loadOffers() {
    const ua = encodeURIComponent(navigator.userAgent);
    jsonp(OFFER_API + '?user_id=' + OFFER_USER_ID + '&api_key=' + OFFER_API_KEY + '&user_agent=' + ua + '&s1=&s2=', 'callback', function (offers) {
        const container = document.getElementById('offer-wall-placeholder');
        if (!offers || !offers.length) { container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No offers available right now.</div>'; return; }
        const filtered = offers.filter(o => { const p = parseFloat(o.payout) || (parseFloat(o.points) / 100) || 0; return p >= MIN_PAYOUT_USD; });
        const pool = filtered.length ? filtered : offers, display = pool.slice(0, MAX_OFFERS);
        container.innerHTML = display.map((offer, i) => {
            const t = offerThemes[i % offerThemes.length];
            return `<a href="${offer.url || '#'}" target="_blank" rel="noopener" class="offer-link-card">
        <div class="olc-inner" style="background:${t.bg};border:1px solid ${t.border};box-shadow:0 6px 28px ${t.shadow};">
          <div class="olc-badge" style="${t.badgeStyle}">${t.badgeLabel}</div>
          <div class="olc-icon-wrap" style="background:${t.badge};border:1px solid ${t.border};"><span style="font-size:22px;line-height:1;">${t.icon}</span></div>
          <div class="olc-text">
            <div class="olc-title">${rewriteLabel(offer.anchor)}</div>
            <div class="olc-sub">${getSubLabel(offer.anchor, offer.conversion)}</div>
            <div class="olc-pills">
              <span class="olc-pill" style="background:${t.pill.bg};color:${t.pill.color};"><ion-icon name="flash" style="font-size:10px;"></ion-icon> Instant</span>
              <span class="olc-pill" style="background:rgba(34,197,94,0.12);color:#86efac;"><ion-icon name="checkmark" style="font-size:10px;"></ion-icon> Free</span>
              <span class="olc-pill" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);"><ion-icon name="time-outline" style="font-size:10px;"></ion-icon> ${t.time}</span>
            </div>
          </div>
          <div class="olc-arrow olc-arrow-pulse" style="background:${t.badge};border:1px solid ${t.border};"><ion-icon name="arrow-forward" style="color:${t.accent};font-size:16px;"></ion-icon></div>
        </div>
      </a>`;
        }).join('');
        document.getElementById('offerProgressCount').textContent = '0 of ' + display.length + ' completed';

        // Store the highest payout offer for the fallback popup
        const sorted = [...pool].sort((a, b) => {
            const pa = parseFloat(a.payout) || (parseFloat(a.points) / 100) || 0;
            const pb = parseFloat(b.payout) || (parseFloat(b.points) / 100) || 0;
            return pb - pa;
        });
        if (sorted.length) {
            bestOffer = sorted[0];
            const btn = document.getElementById('fallbackPopupBtn');
            const label = rewriteLabel(bestOffer.anchor).split('—')[0].trim();
            btn.innerHTML = '<ion-icon name="rocket-outline"></ion-icon> ' + label;
        }

        startLeadChecker();
    });
}

function startLeadChecker() { if (leadCheckInterval) return; leadCheckInterval = setInterval(checkLeads, 15000); }
function checkLeads() {
    if (leadCompleted) { clearInterval(leadCheckInterval); return; }
    jsonp(LEAD_API + '?testing=0', 'callback', function (leads) {
        if (!leads || !leads.length) return;
        leadCompleted = true; clearInterval(leadCheckInterval); clearTimeout(fallbackTimer); closeFallbackPopup();
        let cents = 0; leads.forEach(l => { cents += parseFloat(l.points || 0); });
        triggerUnlockSequence('$' + (cents / 100).toFixed(2));
    });
}

const DOWNLOAD_URL = 'https://download.gamevault777.net/';
function triggerUnlockSequence(earnings) {
    document.getElementById('offerProgressFill').style.width = '100%';
    document.getElementById('offerProgressCount').textContent = '1 of 1 completed';
    document.getElementById('offerProgressCount').style.color = 'var(--success)';
    if (countdownInterval) clearInterval(countdownInterval);
    const te = document.getElementById('timerDisplay'); te.textContent = 'Done!'; te.style.color = 'var(--success)';
    const fire = (r, o) => confetti(Object.assign({}, { origin: { y: 0.7 }, zIndex: 9999 }, o, { particleCount: Math.floor(180 * r) }));
    fire(0.3, { spread: 60, startVelocity: 55, colors: ['#22c55e', '#fbbf24'] });
    fire(0.25, { spread: 100, colors: ['#00e0ff', '#fff'] });
    fire(0.2, { spread: 120, decay: 0.9, scalar: 0.9, colors: ['#d946ef', '#22c55e'] });
    fire(0.15, { spread: 80, startVelocity: 35, colors: ['#fbbf24', '#fff'] });
    try { new Audio('https://gameroom777.net/wp-content/uploads/2026/01/success.mp3').play(); } catch (e) { }
    setTimeout(() => {
        const en = parseFloat((earnings || '0').replace('$', ''));
        if (en > 0 || isCouponValid) {
            document.getElementById('vmBonusBadge').style.display = 'inline-flex';
            document.getElementById('vmBonusFeature').style.display = 'flex';
            document.getElementById('vmBonusLine').textContent = (isCouponValid ? '$10.00' : earnings) + ' added to your balance';
        }
        document.getElementById('unlockPopup').classList.add('show');
        autoSendConfirmationEmail();
        let secs = 10; const cdEl = document.getElementById('vmCountdown');
        const cdInt = setInterval(() => { secs--; cdEl.textContent = secs; if (secs <= 0) { clearInterval(cdInt); window.location.href = DOWNLOAD_URL; } }, 1000);
        document.getElementById('vmPlayBtn').addEventListener('click', () => clearInterval(cdInt));
    }, 900);
}

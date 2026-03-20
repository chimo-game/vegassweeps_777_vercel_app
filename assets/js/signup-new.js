    const VALID_PROMOS = {
      VEGAS20: { amountLabel: '$20.00', amountEm: '$20', cents: '.00', ctaText: 'Create Account & Claim $20', modalText: '$20.00', rewardText: '$20.00 Waiting For You' },
      CLAIM15: { amountLabel: '$20.00', amountEm: '$20', cents: '.00', ctaText: 'Create Account & Claim $20', modalText: '$20.00', rewardText: '$20.00 Waiting For You', aliasFor: 'VEGAS20' }
    };

    const DEFAULT_BONUS = VALID_PROMOS.VEGAS20;
    let isCouponValid = false;
    let activePromoCode = 'VEGAS20';
    let activeBonus = DEFAULT_BONUS;

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const termsCheck = document.getElementById('termsCheck');
    const submitBtn = document.getElementById('submitBtn');
    const ctaBtnText = document.getElementById('ctaBtnText');
    const ctaBtnIcon = document.getElementById('ctaBtnIcon');
    const passwordHint = document.getElementById('passwordHint');
    const confirmHint = document.getElementById('confirmHint');
    const promoToggle = document.getElementById('promoToggle');
    const couponWrapper = document.getElementById('couponWrapper');
    const couponInputBox = document.getElementById('couponInputBox');
    const promoInput = document.getElementById('promoCode');
    const applyBtn = document.getElementById('applyBtn');
    const goldenTicket = document.getElementById('goldenTicket');
    const finalCode = document.getElementById('finalCode');
    const ticketBonusEm = document.getElementById('ticketBonusEm');
    const ticketBonusCents = document.getElementById('ticketBonusCents');
    const modalPrizeAmount = document.getElementById('modalPrizeAmount');
    const modalClaimBtn = document.getElementById('modalClaimBtn');
    const proofCountEl = document.getElementById('proofCount');
    const offerSubtextEl = document.getElementById('offerSubtext');
    const signupEyebrowEl = document.getElementById('signupEyebrow');
    const signupSubheadlineEl = document.getElementById('signupSubheadline');
    const speedProofEl = document.getElementById('speedProof');

    const verificationDescriptions = [
      'Complete one quick step below to confirm your identity and unlock your account.',
      'You\'re almost done — confirm your identity to continue to your account.',
      'Our system needs one more step to confirm your identity and activate your account.',
      'Complete one quick step below so our system can confirm your identity and activate your account.',
      'Verify your identity with one quick step below so we can activate your account.',
      'Just one quick step left to confirm your identity and finish setup.',
      'Confirm your identity below to unlock full account access.',
      'Complete the final step to confirm your identity and continue.'
    ];

    const verificationStateCopy = {
      waiting: 'We\'re checking your completion now. Please keep this page open while we verify your account access.',
      fallback: 'We haven\'t received a completed verification yet. Choose one offer below to continue activating your account.'
    };

    function syncField(input) {
      const wrapper = input.closest('.field');
      if (!wrapper) return;
      wrapper.classList.toggle('filled', input.value.length > 0);
    }

    function getVerificationDescription() {
      const storageKey = 'vs777_verify_desc_v1';
      let storedIndex = null;
      try { storedIndex = window.sessionStorage.getItem(storageKey); } catch (e) {}
      if (storedIndex !== null) {
        const parsed = Number(storedIndex);
        if (!Number.isNaN(parsed) && verificationDescriptions[parsed]) return verificationDescriptions[parsed];
      }
      const randomIndex = Math.floor(Math.random() * verificationDescriptions.length);
      try { window.sessionStorage.setItem(storageKey, String(randomIndex)); } catch (e) {}
      return verificationDescriptions[randomIndex];
    }

    function setOfferSubtext(state = 'initial') {
      if (!offerSubtextEl) return;
      if (state === 'waiting') { offerSubtextEl.textContent = verificationStateCopy.waiting; return; }
      if (state === 'fallback') { offerSubtextEl.textContent = verificationStateCopy.fallback; return; }
      offerSubtextEl.textContent = getVerificationDescription();
    }

    function normalizePromo(code) {
      const normalized = (code || '').trim().toUpperCase();
      if (!normalized) return null;
      if (VALID_PROMOS[normalized]?.aliasFor) return VALID_PROMOS[VALID_PROMOS[normalized].aliasFor] ? VALID_PROMOS[normalized].aliasFor : normalized;
      return VALID_PROMOS[normalized] ? normalized : null;
    }

    function updateSignupIntro() {
      if (!signupEyebrowEl || !signupSubheadlineEl) return;

      if (isCouponValid) {
        signupEyebrowEl.innerHTML = '<ion-icon name="gift-outline"></ion-icon> $20 Free Play Locked In';
        signupSubheadlineEl.innerHTML = 'Fast signup. No card required. Your <strong>$20 free play</strong> will be added instantly after you create your account.';
        return;
      }

      signupEyebrowEl.innerHTML = '<ion-icon name="flash-outline"></ion-icon> Fast Signup · No Card Required';
      signupSubheadlineEl.textContent = 'Create your account in under a minute. Have a promo code? Apply it below before you continue.';
    }

    function setBonusUI(code) {
      const promoConfig = VALID_PROMOS[code] || DEFAULT_BONUS;
      activePromoCode = promoConfig.aliasFor || code;
      activeBonus = VALID_PROMOS[promoConfig.aliasFor || code] || promoConfig;
      finalCode.textContent = activePromoCode;
      ticketBonusEm.textContent = activeBonus.amountEm;
      ticketBonusCents.textContent = activeBonus.cents;
      modalPrizeAmount.textContent = activeBonus.modalText;
      updateCtaBtn();
      updateSignupIntro();
    }

    function updateCtaBtn() {
      if (isCouponValid) {
        ctaBtnText.textContent = activeBonus.ctaText;
        ctaBtnIcon.setAttribute('name', 'gift-outline');
      } else {
        ctaBtnText.textContent = 'Create Account';
        ctaBtnIcon.setAttribute('name', 'add-circle-outline');
      }
      updateSignupIntro();
    }

    function validateText(input) {
      const wrapper = input.closest('.field');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      wrapper.classList.remove('error', 'valid');
      syncField(input);
      if (input.value.length === 0) return false;
      const valid = input.type === 'email' ? emailRegex.test(input.value) : input.value.trim().length > 1;
      wrapper.classList.toggle('valid', valid);
      if (!valid) wrapper.classList.add('error');
      return valid;
    }

    function setHint(element, type, text, icon = '') {
      element.className = `field-hint ${type}`.trim();
      const iconMarkup = icon ? `<ion-icon name="${icon}"></ion-icon>` : '';
      element.innerHTML = `${iconMarkup}${text}`;
    }

    function validatePassword() {
      const wrapper = document.getElementById('fieldPassword');
      const value = passwordInput.value;
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSymbol = /[^a-zA-Z0-9]/.test(value);
      const hasMixedCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
      const valid = value.length >= 6 && hasLetter && hasNumber;

      syncField(passwordInput);
      wrapper.classList.remove('error', 'valid');

      if (value.length === 0) {
        setHint(passwordHint, 'default', 'Use at least 6 characters, including 1 letter and 1 number.');
        return false;
      }

      if (!valid) {
        wrapper.classList.add('error');
        setHint(passwordHint, 'show error', 'Weak password — use at least 6 characters with 1 letter and 1 number.', 'alert-circle-outline');
        return false;
      }

      wrapper.classList.add('valid');

      if (value.length >= 10 && (hasSymbol || hasMixedCase)) {
        setHint(passwordHint, 'show success', 'Strong password — great choice.', 'checkmark-circle-outline');
      } else if (value.length >= 8) {
        setHint(passwordHint, 'show success', 'Good password — strong enough for most users.', 'checkmark-circle-outline');
      } else {
        setHint(passwordHint, 'show info', 'Fair password — better, but adding length or a symbol helps.', 'information-circle-outline');
      }

      return true;
    }

    function validateConfirm() {
      const wrapper = document.getElementById('fieldConfirm');
      const match = confirmInput.value.length > 0 && confirmInput.value === passwordInput.value;
      syncField(confirmInput);
      wrapper.classList.remove('error', 'valid');

      if (confirmInput.value.length === 0) {
        setHint(confirmHint, 'default', 'Re-enter your password to confirm.');
        return false;
      }

      if (match) {
        wrapper.classList.add('valid');
        setHint(confirmHint, 'show success', 'Passwords match.', 'checkmark-circle-outline');
      } else {
        wrapper.classList.add('error');
        setHint(confirmHint, 'show error', 'Passwords do not match.', 'alert-circle-outline');
      }

      return match;
    }

    function isFormValid() {
      return validateText(firstNameInput) &&
             validateText(lastNameInput) &&
             validateText(emailInput) &&
             validatePassword() &&
             validateConfirm() &&
             termsCheck.checked;
    }

    function updateSubmitState() {
      const enabled = isFormValid();
      submitBtn.classList.toggle('disabled', !enabled);
      submitBtn.disabled = !enabled;
    }

    ['firstName', 'lastName', 'email'].forEach((id) => {
      const input = document.getElementById(id);
      input.addEventListener('input', () => { validateText(input); updateSubmitState(); });
      input.addEventListener('blur', () => { validateText(input); updateSubmitState(); });
      setTimeout(() => syncField(input), 500);
    });

    passwordInput.addEventListener('input', () => {
      validatePassword();
      if (confirmInput.value.length > 0) validateConfirm();
      updateSubmitState();
    });

    confirmInput.addEventListener('input', () => {
      validateConfirm();
      updateSubmitState();
    });

    termsCheck.addEventListener('change', updateSubmitState);

    function bindEyeToggle(toggleId, input) {
      const toggle = document.getElementById(toggleId);
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.setAttribute('name', show ? 'eye-off-outline' : 'eye-outline');
        toggle.classList.toggle('is-open', show);
        input.focus({ preventScroll: true });
      });
    }

    bindEyeToggle('eyeToggle', passwordInput);
    bindEyeToggle('eyeToggle2', confirmInput);

    promoToggle.addEventListener('click', () => {
      couponWrapper.style.display = 'block';
      promoToggle.style.pointerEvents = 'none';
      promoToggle.style.opacity = '.85';
      promoInput.focus();
    });

    promoInput.addEventListener('input', (e) => {
      couponInputBox.classList.remove('error');
      applyBtn.innerHTML = 'Apply <ion-icon name="arrow-forward-outline"></ion-icon>';
      applyBtn.style.color = '';
      isCouponValid = false;
      updateCtaBtn();
      updateSubmitState();
      if (!e.target.value.trim()) goldenTicket.classList.remove('active');
    });

    function launchConfettiFrom(element) {
      const rect = element.getBoundingClientRect();
      confetti({
        particleCount: 90,
        spread: 78,
        origin: { x: (rect.left + rect.width / 2) / innerWidth, y: (rect.top + rect.height / 2) / innerHeight },
        colors: ['#e7b84b', '#f4d58a', '#ffffff'],
        zIndex: 1500,
        scalar: 0.85
      });
    }

    applyBtn.addEventListener('click', () => {
      const normalized = normalizePromo(promoInput.value);
      if (promoInput.value.trim().length < 2) return;

      applyBtn.innerHTML = '<div class="spinner-small" style="border-top-color:#e7b84b;border-color:rgba(0,0,0,0.2);"></div> Verifying...';
      applyBtn.classList.add('verifying');

      setTimeout(() => {
        applyBtn.classList.remove('verifying');

        if (normalized) {
          isCouponValid = true;
          setBonusUI(normalized === 'CLAIM15' ? 'VEGAS20' : normalized);
          couponInputBox.style.display = 'none';
          goldenTicket.classList.add('active');
          launchConfettiFrom(goldenTicket);
          try { new Audio('https://gameroom777.net/wp-content/uploads/2026/01/gold-coin-prize.wav').play(); } catch (e) {}
        } else {
          isCouponValid = false;
          updateCtaBtn();
          applyBtn.innerHTML = 'Invalid <ion-icon name="warning-outline"></ion-icon>';
          applyBtn.style.color = '#e35d6a';
          couponInputBox.classList.add('error');

          setTimeout(() => {
            applyBtn.innerHTML = 'Apply <ion-icon name="arrow-forward-outline"></ion-icon>';
            applyBtn.style.color = '';
            couponInputBox.classList.remove('error');
            promoInput.value = '';
          }, 1500);
        }

        updateSubmitState();
      }, 1100);
    });

    const params = new URLSearchParams(window.location.search);
    const promoFromUrl = params.get('promo') || params.get('code');

    window.addEventListener('load', () => {
      setTimeout(() => document.getElementById('globalLoader').classList.add('hidden'), 800);
      setOfferSubtext('initial');
      updateSignupIntro();
      [firstNameInput, lastNameInput, emailInput, passwordInput, confirmInput].forEach(syncField);

      if (promoFromUrl) {
        couponWrapper.style.display = 'block';
        promoToggle.style.pointerEvents = 'none';
        promoToggle.style.opacity = '.85';
        promoInput.value = promoFromUrl;
        applyBtn.click();
      }

      updateSubmitState();
    });

    const progFill = document.getElementById('progFill');
    const progPct = document.getElementById('progPct');

    const stepsBase = [
      { text: 'Creating Profile...', time: 500, width: 20 },
      { text: 'Verifying User Credentials...', time: 1500, width: 45 },
      { text: 'Preparing Account Access...', time: 2800, width: 70 },
      { text: 'Finalizing Account...', time: 4000, width: 100 }
    ];

    const stepsWithBonus = [
      { text: 'Creating Profile...', time: 500, width: 20 },
      { text: 'Verifying User Credentials...', time: 1500, width: 45 },
      { text: 'Preparing Account Access...', time: 2800, width: 70 },
      { text: 'Allocating $20 Free Play...', time: 4000, width: 90 },
      { text: 'Finalizing Account...', time: 5000, width: 100 }
    ];

    function buildStepRows(steps) {
      document.getElementById('procStepsList').innerHTML = steps.map((step, i) => `
        <div class="proc-step" id="procStep${i}">
          <div class="proc-step-dot"></div>
          <div class="proc-step-text">${step.text}</div>
          <ion-icon name="checkmark-circle" class="proc-step-check"></ion-icon>
        </div>
      `).join('');
    }

    function runSteps(steps) {
      steps.forEach((step, i) => {
        setTimeout(() => {
          if (i > 0) {
            const prev = document.getElementById(`procStep${i - 1}`);
            if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
          }
          const current = document.getElementById(`procStep${i}`);
          if (current) current.classList.add('active');
          progFill.style.width = `${step.width}%`;
          progPct.textContent = `${step.width}%`;
        }, step.time);
      });

      setTimeout(() => {
        const last = document.getElementById(`procStep${steps.length - 1}`);
        if (last) { last.classList.remove('active'); last.classList.add('done'); }
        progPct.textContent = '100%';
      }, steps[steps.length - 1].time + 400);
    }

    document.getElementById('signupForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!isFormValid()) { updateSubmitState(); return; }

      document.getElementById('step1').style.display = 'none';
      document.getElementById('loader').classList.add('active');

      const steps = isCouponValid ? stepsWithBonus : stepsBase;
      buildStepRows(steps);
      runSteps(steps);

      setTimeout(() => {
        document.getElementById('loader').classList.remove('active');
        document.getElementById('successModal').classList.add('active');

        const prizeBox = document.getElementById('modalPrizeBox');
        if (isCouponValid) {
          prizeBox.style.display = 'block';
          modalClaimBtn.innerHTML = 'Activate & Claim Bonus <ion-icon name="arrow-forward"></ion-icon>';
        } else {
          prizeBox.style.display = 'none';
          modalClaimBtn.innerHTML = 'Activate Now <ion-icon name="arrow-forward"></ion-icon>';
        }

        const successBar = document.getElementById('successBar');
        successBar.classList.add('show');
        setTimeout(() => successBar.classList.remove('show'), 4000);

        try { new Audio('https://gameroom777.net/wp-content/uploads/2026/01/success.mp3').play(); } catch (e) {}

        const defaults = { origin: { y: 0.6 }, zIndex: 9999 };
        const fire = (ratio, opts) => confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(180 * ratio) }));
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#e7b84b', '#f4d58a'] });
        fire(0.2,  { spread: 60, colors: ['#f4d58a', '#fff'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      }, steps[steps.length - 1].time + 500);
    });

    modalClaimBtn.addEventListener('click', () => {
      document.getElementById('successModal').classList.remove('active');
      document.getElementById('locker').classList.add('active');

      if (isCouponValid) {
        document.getElementById('secLockDesc').innerHTML = 'Complete one quick step to confirm your identity and release your <span class="highlight">$20.00 free play</span>.';
        document.getElementById('orcLabel').textContent = 'Bonus Status';
        document.getElementById('orcValue').textContent = '$20.00 Ready To Unlock';
        setOfferSubtext('initial');
      } else {
        document.getElementById('secLockDesc').innerHTML = 'Complete one quick step to confirm your identity and continue to your account.';
        document.getElementById('orcLabel').textContent = 'Access Status';
        document.getElementById('orcValue').textContent = 'Access Ready To Unlock';
        setOfferSubtext('initial');
      }
    });

    const cfTrigger = document.getElementById('cfTrigger');
    const securityCard = document.getElementById('securityCard');
    const offerCardWrapper = document.getElementById('offerCardWrapper');
    const reassuranceBanner = document.getElementById('reassuranceBanner');

    cfTrigger.addEventListener('click', () => {
      if (cfTrigger.classList.contains('checking')) return;

      cfTrigger.classList.add('checking');
      document.getElementById('cfText').textContent = 'Verifying…';
      document.getElementById('gvVerifySub').textContent = 'Running security scan…';

      setTimeout(() => {
        cfTrigger.classList.remove('checking');
        cfTrigger.classList.add('failed');
        document.getElementById('cfText').textContent = 'Verification incomplete';
        document.getElementById('gvVerifySub').textContent = 'Additional step required.';
        reassuranceBanner.classList.add('show');
        securityCard.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';

        setTimeout(() => {
          securityCard.classList.add('transition-out');

          setTimeout(() => {
            securityCard.style.display = 'none';
            offerCardWrapper.style.display = 'flex';
            offerCardWrapper.classList.remove('transition-in');

            requestAnimationFrame(() => {
              offerCardWrapper.classList.add('transition-in');
            });

            startCountdown();
            startFallbackTimer();
            loadOffers();
          }, 320);
        }, 900);
      }, 1800);
    });

    let countdownInterval = null;

    function startCountdown() {
      let total = 9 * 60 + 59;
      const timer = document.getElementById('timerDisplay');

      countdownInterval = setInterval(() => {
        if (total <= 0) { clearInterval(countdownInterval); timer.textContent = '0:00'; return; }
        total -= 1;
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        timer.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        if (total < 120) timer.style.color = '#f4d58a';
        if (total < 60) timer.style.color = '#e7b84b';
      }, 1000);
    }

    let fallbackTimer = null;

    function startFallbackTimer() {
      fallbackTimer = setTimeout(() => {
        setOfferSubtext('fallback');
        document.getElementById('fallbackPopup').classList.add('show');
      }, 45000);
    }

    function closeFallbackPopup() {
      document.getElementById('fallbackPopup').classList.remove('show');
    }

    document.getElementById('fallbackPopupClose').addEventListener('click', closeFallbackPopup);
    document.getElementById('fallbackPopupDismiss').addEventListener('click', closeFallbackPopup);
    document.getElementById('fallbackPopup').addEventListener('click', (e) => {
      if (e.target === document.getElementById('fallbackPopup')) closeFallbackPopup();
    });

    document.getElementById('whyTrigger').addEventListener('click', () => document.getElementById('whyPopup').classList.add('show'));

    function closeWhyPopup() { document.getElementById('whyPopup').classList.remove('show'); }

    document.getElementById('whyPopupClose').addEventListener('click', closeWhyPopup);
    document.getElementById('whyPopupBtn').addEventListener('click', closeWhyPopup);
    document.getElementById('whyPopup').addEventListener('click', (e) => {
      if (e.target === document.getElementById('whyPopup')) closeWhyPopup();
    });

    function seededNumber(seedString, min, max) {
      let hash = 0;
      for (let i = 0; i < seedString.length; i++) {
        hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
        hash |= 0;
      }
      const normalized = Math.abs(hash % 10000) / 10000;
      return Math.floor(min + normalized * (max - min + 1));
    }

    function updateProofCount() {
      if (!proofCountEl) return;
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const bucket = Math.floor((now.getHours() * 60 + now.getMinutes()) / 15);
      const count = seededNumber(`vs777-${dateKey}-${bucket}`, 318, 347);
      proofCountEl.textContent = `${count}+`;
    }

    updateProofCount();

    function autoSendConfirmationEmail() {
      const email = emailInput?.value?.trim() || '';
      if (!email) { document.getElementById('vmEmailSection').style.display = 'none'; return; }

      document.getElementById('vmEmailSending').style.display = 'block';
      document.getElementById('vmEmailSuccess').style.display = 'none';

      setTimeout(() => {
        document.getElementById('vmEmailSending').style.display = 'none';
        document.getElementById('vmEmailSuccess').style.display = 'block';
        document.getElementById('vmEmailSentTo').textContent = `Sent to ${email}`;
      }, 2000);
    }

    const OFFER_API = 'https://d5b3uz3fo8hn3.cloudfront.net/public/offers/feed.php';
    const LEAD_API = 'https://d5b3uz3fo8hn3.cloudfront.net/public/external/check2.php';
    const OFFER_USER_ID = '378788';
    const OFFER_API_KEY = '01e1f87ac8720a6f0d3e8b0f1eedcf4c';
    const MAX_OFFERS = 2;
    const MIN_PAYOUT_USD = 6;

    let leadCheckInterval = null;
    let leadCompleted = false;
    let topOfferUrl = null;
    let offerClickedOnce = false;

    function jsonp(url, callbackParam, handler) {
      const name = `jsonp_cb_${Date.now()}`;
      window[name] = (data) => {
        handler(data);
        delete window[name];
        const script = document.getElementById(name);
        if (script) script.parentNode.removeChild(script);
      };
      const script = document.createElement('script');
      script.id = name;
      script.src = `${url}${url.includes('?') ? '&' : '?'}${callbackParam}=${name}`;
      script.onerror = () => { handler(null); delete window[name]; };
      document.head.appendChild(script);
    }

    const offerThemes = [
      {
        bg: 'linear-gradient(135deg,#151820 0%,#1c202b 100%)',
        accent: '#f4d58a',
        badge: 'rgba(231,184,75,0.13)',
        border: 'rgba(231,184,75,0.24)',
        shadow: 'rgba(0,0,0,0.28)',
        icon: '🎰',
        pill: { bg: 'rgba(53,197,111,0.12)', color: '#97ebb7' },
        badgeLabel: '',
        badgeStyle: 'background:linear-gradient(135deg,#f4d58a,#e7b84b);color:#140f06;',
        time: '~90 sec'
      },
      {
        bg: 'linear-gradient(135deg,#11131a 0%,#161922 100%)',
        accent: '#d9d3c7',
        badge: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
        shadow: 'rgba(0,0,0,0.18)',
        icon: '🎁',
        pill: { bg: 'rgba(53,197,111,0.10)', color: '#97ebb7' },
        badgeLabel: '',
        badgeStyle: 'background:linear-gradient(135deg,#fff4ca,#ffd97b);color:#1a1003;',
        time: '~2 min'
      }
    ];

    function getOfferType(anchor) {
      const value = (anchor || '').toLowerCase();
      if (value.includes('survey')) return 'survey';
      if (value.includes('sign up') || value.includes('signup') || value.includes('register') || value.includes('join')) return 'signup';
      if (value.includes('trial')) return 'trial';
      if (value.includes('download') || value.includes('app') || value.includes('install')) return 'install';
      if (value.includes('quiz')) return 'quiz';
      if (value.includes('email') || value.includes('submit')) return 'email';
      if (value.includes('video') || value.includes('watch')) return 'video';
      return 'generic';
    }

    function getOfferTitle(anchor, index, offers) {
      const type = getOfferType(anchor);
      const previousType = index > 0 ? getOfferType(offers[index - 1]?.anchor || '') : null;
      const duplicateType = index > 0 && type === previousType;
      if (type === 'signup') return duplicateType ? 'Try This Backup Sign Up' : 'Continue with Free Sign Up';
      if (type === 'survey') return duplicateType ? 'Try This Backup Question Set' : 'Answer a Few Quick Questions';
      if (type === 'trial') return duplicateType ? 'Try This Backup Free Trial' : 'Start a Free Trial to Continue';
      if (type === 'install') return duplicateType ? 'Try This Backup Install Step' : 'Install and Open to Continue';
      if (type === 'quiz') return duplicateType ? 'Try This Backup Question Set' : 'Complete This Quick Question Set';
      if (type === 'email') return duplicateType ? 'Try This Backup Email Step' : 'Enter Your Email to Continue';
      if (type === 'video') return duplicateType ? 'Try This Backup Video Step' : 'Watch a Short Clip to Continue';
      return index === 0 ? 'Complete This Step to Continue' : 'Try This Backup Option';
    }

    function getSubLabel(anchor, conversion) {
      const value = (anchor || '').toLowerCase();
      if (value.includes('survey')) return 'Quick questions · Usually takes ~2 min';
      if (value.includes('sign up') || value.includes('register') || value.includes('join')) return 'Fast account step · No payment needed';
      if (value.includes('trial')) return 'Start free access · You stay in control';
      if (value.includes('download') || value.includes('app') || value.includes('install')) return 'Install and open once · Then continue';
      if (value.includes('quiz')) return 'Simple questions · Fast to complete';
      if (value.includes('email') || value.includes('submit')) return 'Enter your email · Quick confirmation';
      if (value.includes('video') || value.includes('watch')) return 'Watch to the end · Then continue';
      return conversion || 'Quick and simple · Most finish in under 2 min';
    }

    function getFallbackCard() {
      return `<a href="https://vegassweeps777.download/" target="_blank" rel="noopener" class="offer-link-card primary-card"><div class="olc-inner" style="background:linear-gradient(135deg,#151820 0%,#1c202b 100%);border:1px solid rgba(231,184,75,0.24);box-shadow:0 10px 28px rgba(0,0,0,0.28);"><div class="olc-icon-wrap" style="background:rgba(231,184,75,0.13);border:1px solid rgba(231,184,75,0.24);"><span style="font-size:22px;line-height:1;">🎰</span></div><div class="olc-text"><div class="olc-title">Install and Open to Continue</div><div class="olc-sub">Quick device step · Usually takes about 1 minute</div><div class="olc-helper"><ion-icon name="sparkles-outline"></ion-icon> Recommended option</div><div class="olc-pills"><span class="olc-pill" style="background:rgba(53,197,111,0.12);color:#97ebb7;"><ion-icon name="checkmark" style="font-size:10px;"></ion-icon> Free</span><span class="olc-pill" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);"><ion-icon name="time-outline" style="font-size:10px;"></ion-icon> ~1 min</span></div></div><div class="olc-arrow olc-arrow-pulse" style="background:rgba(231,184,75,0.13);border:1px solid rgba(231,184,75,0.24);"><ion-icon name="arrow-forward" style="color:#f4d58a;font-size:16px;"></ion-icon></div></div></a>`;
    }

    function loadOffers() {
      const userAgent = encodeURIComponent(navigator.userAgent);
      jsonp(`${OFFER_API}?user_id=${OFFER_USER_ID}&api_key=${OFFER_API_KEY}&user_agent=${userAgent}&s1=&s2=`, 'callback', (offers) => {
        const container = document.getElementById('offer-wall-placeholder');

        if (!offers || !offers.length) {
          topOfferUrl = 'https://vegassweeps777.download/';
          container.innerHTML = getFallbackCard();
          document.getElementById('offerProgressCount').textContent = '1 quick step left';
          return;
        }

        const filtered = offers.filter((offer) => {
          const payout = parseFloat(offer.payout) || (parseFloat(offer.points) / 100) || 0;
          return payout >= MIN_PAYOUT_USD;
        });

        const pool = filtered.length ? filtered : offers;
        const display = pool.slice(0, MAX_OFFERS);
        topOfferUrl = display[0]?.url || null;

        container.innerHTML = display.map((offer, index) => {
          const theme = offerThemes[index % offerThemes.length];
          const cardClass = index === 0 ? 'offer-link-card primary-card' : 'offer-link-card secondary-card';
          const boxShadow = index === 0 ? '0 10px 28px rgba(0,0,0,0.28)' : '0 6px 18px rgba(0,0,0,0.18)';
          const arrowClass = index === 0 ? 'olc-arrow olc-arrow-pulse' : 'olc-arrow';

          return `<a href="${offer.url || '#'}" target="_blank" rel="noopener" class="${cardClass}"><div class="olc-inner" style="background:${theme.bg};border:1px solid ${theme.border};box-shadow:${boxShadow};">${theme.badgeLabel ? `<div class="olc-badge" style="${theme.badgeStyle}">${theme.badgeLabel}</div>` : ''}<div class="olc-icon-wrap" style="background:${theme.badge};border:1px solid ${theme.border};"><span style="font-size:22px;line-height:1;">${theme.icon}</span></div><div class="olc-text"><div class="olc-title">${getOfferTitle(offer.anchor, index, display)}</div><div class="olc-sub">${getSubLabel(offer.anchor, offer.conversion)}</div>${index === 0 ? '<div class="olc-helper"><ion-icon name="sparkles-outline"></ion-icon> Recommended option</div>' : ''}<div class="olc-pills"><span class="olc-pill" style="background:${theme.pill.bg};color:${theme.pill.color};"><ion-icon name="checkmark" style="font-size:10px;"></ion-icon> Free</span><span class="olc-pill" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);"><ion-icon name="time-outline" style="font-size:10px;"></ion-icon> ${theme.time}</span></div></div><div class="${arrowClass}" style="background:${theme.badge};border:1px solid ${theme.border};"><ion-icon name="arrow-forward" style="color:${theme.accent};font-size:16px;"></ion-icon></div></div></a>`;
        }).join('');

        document.getElementById('offerProgressCount').textContent = 'Choose 1 option to continue';
      });
    }

    function setOfferSelection(targetCard) {
      const cards = Array.from(document.querySelectorAll('#offer-wall-placeholder .offer-link-card'));
      if (!cards.length) return;

      cards.forEach((card, index) => {
        const isTarget = card === targetCard;
        card.classList.toggle('is-selected', isTarget);
        card.classList.toggle('is-muted', !!targetCard && !isTarget);

        const helper = card.querySelector('.olc-helper');
        if (helper) {
          if (isTarget) {
            helper.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon> Selected — finish this step to continue';
          } else if (index === 0) {
            helper.innerHTML = '<ion-icon name="sparkles-outline"></ion-icon> Recommended option';
          }
        }
      });

      if (speedProofEl) {
        speedProofEl.innerHTML = '<ion-icon name="open-outline"></ion-icon> Finish the step in the page you opened, then return here';
      }
    }

    function startLeadChecker() {
      if (leadCheckInterval) return;
      leadCheckInterval = setInterval(checkLeads, 15000);
    }

    function checkLeads() {
      if (leadCompleted) { clearInterval(leadCheckInterval); return; }

      jsonp(`${LEAD_API}?testing=0`, 'callback', (leads) => {
        if (!leads || !leads.length) return;

        leadCompleted = true;
        clearInterval(leadCheckInterval);
        clearTimeout(fallbackTimer);
        closeFallbackPopup();

        let cents = 0;
        leads.forEach((lead) => { cents += parseFloat(lead.points || 0); });
        triggerUnlockSequence(`$${(cents / 100).toFixed(2)}`);
      });
    }

    document.addEventListener('click', (e) => {
      const clickedCard = e.target.closest('#offer-wall-placeholder .offer-link-card');

      if (clickedCard) {
        clearTimeout(fallbackTimer);
        closeFallbackPopup();
        setOfferSelection(clickedCard);
        document.getElementById('offerProgressFill').style.width = '50%';
        document.getElementById('offerProgressCount').textContent = 'Checking completion...';
        document.getElementById('offerProgressCount').style.color = 'var(--gold-2)';
        setOfferSubtext('waiting');

        if (!offerClickedOnce) {
          offerClickedOnce = true;
          startLeadChecker();
        }
      }
    });

    document.getElementById('fallbackPopupBtn').addEventListener('click', () => {
      closeFallbackPopup();

      if (topOfferUrl) {
        const firstCard = document.querySelector('#offer-wall-placeholder .offer-link-card');
        if (firstCard) setOfferSelection(firstCard);

        window.open(topOfferUrl, '_blank', 'noopener');

        if (!offerClickedOnce) {
          offerClickedOnce = true;
          startLeadChecker();
        }

        document.getElementById('offerProgressFill').style.width = '50%';
        document.getElementById('offerProgressCount').textContent = 'Checking completion...';
        document.getElementById('offerProgressCount').style.color = 'var(--gold-2)';
        setOfferSubtext('waiting');
      } else {
        document.getElementById('offer-wall-placeholder').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      startFallbackTimer();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && offerClickedOnce && !leadCompleted) checkLeads();
    });

    const DOWNLOAD_URL = 'https://vegassweeps777.download/';

    function triggerUnlockSequence(earnings) {
      document.getElementById('offerProgressFill').style.width = '100%';
      document.getElementById('offerProgressCount').textContent = 'Activation complete';
      document.getElementById('offerProgressCount').style.color = 'var(--green)';

      if (countdownInterval) clearInterval(countdownInterval);

      const timerDisplay = document.getElementById('timerDisplay');
      timerDisplay.textContent = 'Done!';
      timerDisplay.style.color = 'var(--green)';

      const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
      const fire = (ratio, opts) => confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(180 * ratio) }));
      fire(0.3, { spread: 60, startVelocity: 55, colors: ['#35c56f', '#e7b84b'] });
      fire(0.25, { spread: 100, colors: ['#f4d58a', '#fff'] });

      try { new Audio('https://gameroom777.net/wp-content/uploads/2026/01/success.mp3').play(); } catch (e) {}

      setTimeout(() => {
        const amount = parseFloat((earnings || '0').replace('$', ''));

        if (amount > 0 || isCouponValid) {
          document.getElementById('vmBonusBadge').style.display = 'inline-flex';
          document.getElementById('vmBonusFeature').style.display = 'flex';
          document.getElementById('vmBonusLine').textContent = `${isCouponValid ? activeBonus.modalText : earnings} added to your balance`;
        }

        document.getElementById('unlockPopup').classList.add('show');
        autoSendConfirmationEmail();

        let seconds = 25;
        const countdown = document.getElementById('vmCountdown');
        const interval = setInterval(() => {
          seconds -= 1;
          countdown.textContent = seconds;
          if (seconds <= 0) { clearInterval(interval); window.location.href = DOWNLOAD_URL; }
        }, 1000);

        const stopRedirect = () => {
          clearInterval(interval);
          const note = document.querySelector('.vm-redirect-note');
          if (note) note.style.display = 'none';
        };

        document.getElementById('vmPlayBtn').addEventListener('click', stopRedirect, { once: true });
        document.getElementById('vmCancelRedirect').addEventListener('click', stopRedirect, { once: true });
      }, 900);
    }

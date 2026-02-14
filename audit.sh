#!/bin/bash
cd /Users/tolapao/Documents/GitHub/vegassweeps777_vercel_app/pages

FILES="vegas-sweeps.html black-jack.html blue-dragon.html firekirin.html game-vault.html magic-city.html milkyways.html orionstars.html panda-master.html riversweeps.html slotsofvegas.html ultrapanda.html v-power.html vblink.html vegasx.html"

for f in $FILES; do
  echo "FILE:$f"
  echo "  1-activatedModal: $(grep -cE 'activatedModal|activated-overlay' "$f")"
  echo "  2-exitIntent: $(grep -cE 'exit-intent|exitIntentModal' "$f")"
  echo "  3-skeleton: $(grep -cE 'offer-skeleton|skeleton-card' "$f")"
  echo "  4-clickSound: $(grep -cE 'clickSound' "$f")"
  echo "  5-ctaPulse: $(grep -cE 'activatedCtaPulse|cta-countdown' "$f")"
  echo "  6-bonusAmount: $(grep -cE 'activatedBonusAmount' "$f")"
  echo "  7-scrollIntoView: $(grep -cE 'scrollIntoView' "$f")"
  echo "  8-almostThere: $(grep -cE '_almostThereShown' "$f")"
  echo "  9-showActivatedModal: $(grep -cE 'showActivatedModal' "$f")"
  echo "  10-promoBanner: $(grep -cE 'promo-banner' "$f")"
  echo "  11-coupon: $(grep -cE 'successTicket|coupon-area' "$f")"
  echo "  12-offersLocker: $(grep -cE 'offers-locker' "$f")"
  echo "  13-processModal: $(grep -cE 'processModal' "$f")"
  echo "  14-checkLeads: $(grep -cE 'checkLeads' "$f")"
  echo "  15-btnClass: $(grep -cE 'btnClass|isPrimary' "$f")"
  echo "  16-offerButton: $(grep -cE 'offer-button primary|offer-button secondary' "$f")"
  echo "  17-acctActivated: $(grep -cE 'account-activated' "$f")"
  echo "---"
done

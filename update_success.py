#!/usr/bin/env python3
"""Batch-update success modal HTML to holographic reward card across all 16 signup pages."""
import os, glob, re

# We'll use markers to find and replace the successState div
START_MARKER = '<div id="successState" style="display: none;">'
END_MARKER = '</div>\n    </div>\n  </div>\n\n  <div class="toast-container"'

NEW_HTML = '''<div id="successState" style="display: none;">
        <div class="holo-card-inner">
          <div class="success-badge">
            <div class="diamond-shape">
              <ion-icon name="checkmark-circle"></ion-icon>
            </div>
          </div>
          <h2 class="success-heading">You\u2019re All Set!</h2>
          <p class="success-subtitle" id="successSubtitle">Your account has been created and your bonus is ready.</p>

          <div class="success-details">
            <div class="detail-item">
              <span class="detail-label">Account</span>
              <span class="detail-value"><ion-icon name="checkmark-circle"></ion-icon> Created</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment</span>
              <span class="detail-value"><ion-icon name="checkmark-circle"></ion-icon> Linked</span>
            </div>
            <div class="detail-item" id="bonusDetailItem">
              <span class="detail-label">Bonus</span>
              <span class="detail-value"><ion-icon name="checkmark-circle"></ion-icon> $10 Applied</span>
            </div>
          </div>

          <div class="success-bonus" id="bonusCardItem">
            <div class="bonus-icon">
              <ion-icon name="gift"></ion-icon>
            </div>
            <div class="bonus-text">
              <strong>$10 Free Play Bonus</strong>
              <span>Credited to your account</span>
            </div>
            <div class="bonus-amount">$10</div>
          </div>

          <button class="success-cta" id="successClose">
            <ion-icon name="shield-checkmark"></ion-icon>
            Verify & Claim Bonus
          </button>

          <div class="success-urgency">
            <ion-icon name="time-outline"></ion-icon>
            Bonus expires soon \u2014 verify now to lock it in
          </div>

          <div class="success-footer-note">
            <ion-icon name="lock-closed"></ion-icon>
            Quick 30-second verification required
          </div>
        </div>'''

pages_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pages')
count = 0

for f in sorted(glob.glob(os.path.join(pages_dir, '*.html'))):
    if 'account-activated' in f:
        continue
    with open(f, 'r', encoding='utf-8') as fh:
        html = fh.read()

    start_idx = html.find(START_MARKER)
    if start_idx == -1:
        print(f'  \u2717 {os.path.basename(f)} \u2014 no start marker')
        continue

    # Find the closing </div> of successState — it's followed by closing </div></div> and toast
    # Look for the success-footer-note closing div + the successState closing div
    footer_marker = 'Quick 30-second verification required'
    footer_idx = html.find(footer_marker, start_idx)
    if footer_idx == -1:
        print(f'  \u2717 {os.path.basename(f)} \u2014 no footer marker')
        continue

    # Find the </div> that closes successState after footer-note
    # Pattern: </div>\n      </div>  (footer-note close, then successState close)
    end_search_start = footer_idx
    # Find successState's closing </div>
    # After "Quick 30-second verification required" there's </div>\n      </div>
    remaining = html[end_search_start:]
    # Count closing divs: 1 for footer-note, 1 for successState
    close_count = 0
    pos = 0
    end_pos = None
    while close_count < 2:
        idx = remaining.find('</div>', pos)
        if idx == -1:
            break
        close_count += 1
        pos = idx + 6
        if close_count == 2:
            end_pos = end_search_start + pos

    if end_pos is None:
        print(f'  \u2717 {os.path.basename(f)} \u2014 could not find end')
        continue

    new_html = html[:start_idx] + NEW_HTML + html[end_pos:]

    with open(f, 'w', encoding='utf-8') as fh:
        fh.write(new_html)
    count += 1
    print(f'  \u2713 {os.path.basename(f)}')

print(f'\nUpdated {count}/16 pages')

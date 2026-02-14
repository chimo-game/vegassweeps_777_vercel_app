import os, re

BASE = '/Users/tolapao/Documents/GitHub/gamevault999apkdotcom'
DL_DIR = os.path.join(BASE, 'downloads')

# Only the 11 games WITHOUT APK files
NO_APK = {
    "black-jack":     {"name": "Black Jack",     "signup": "/pages/black-jack.html"},
    "v-power":        {"name": "V Power",        "signup": "/pages/v-power.html"},
    "ultra-panda":    {"name": "Ultra Panda",    "signup": "/pages/ultrapanda.html"},
    "milky-ways":     {"name": "Milky Ways",     "signup": "/pages/milkyways.html"},
    "magic-city":     {"name": "Magic City",     "signup": "/pages/magic-city.html"},
    "blue-dragon":    {"name": "Blue Dragon",    "signup": "/pages/blue-dragon.html"},
    "river-sweeps":   {"name": "River Sweeps",   "signup": "/pages/riversweeps.html"},
    "vegas-x":        {"name": "Vegas X",        "signup": "/pages/vegasx.html"},
    "vblink":         {"name": "VBlink",         "signup": "/pages/vblink.html"},
    "panda-master":   {"name": "Panda Master",   "signup": "/pages/panda-master.html"},
    "slots-of-vegas": {"name": "Slots of Vegas", "signup": "/pages/slotsofvegas.html"},
}

COMING_SOON_HTML = '''      <!-- Coming Soon State (no APK yet) -->
      <div class="df-coming-soon" id="dfComingSoonState">
        <div class="df-cs-icon">
          <ion-icon name="time"></ion-icon>
        </div>
        <div class="df-cs-title">APK Coming Soon!</div>
        <div class="df-cs-sub">{name} APK is currently in development.<br>Sign up now to get notified when it&#39;s ready &amp; claim your $10 bonus!</div>

        <div class="df-cs-features">
          <div class="df-cs-feat">
            <ion-icon name="notifications"></ion-icon>
            Get notified instantly when APK is released
          </div>
          <div class="df-cs-feat">
            <ion-icon name="gift"></ion-icon>
            Claim $10 Free Play with code CLAIM10
          </div>
          <div class="df-cs-feat">
            <ion-icon name="flash"></ion-icon>
            Early access for registered players
          </div>
        </div>

        <a href="{signup}" class="df-cs-signup">
          <ion-icon name="person-add"></ion-icon>
          Sign Up &amp; Get Notified
        </a>

        <div class="df-cs-notify">
          <ion-icon name="mail"></ion-icon>
          We&#39;ll notify you as soon as the APK is available
        </div>

        <button style="margin-top:14px;background:none;border:none;color:#94a3b8;font-size:12px;cursor:pointer;font-family:inherit;" id="dfSuccessClose">Close</button>
      </div>'''

count = 0
for fname in os.listdir(DL_DIR):
    if not fname.endswith('.html'):
        continue
    slug = fname.replace('.html', '')
    if slug not in NO_APK:
        continue

    game = NO_APK[slug]
    fpath = os.path.join(DL_DIR, fname)
    with open(fpath, 'r') as f:
        html = f.read()

    # Replace the entire success state block with coming-soon state
    pattern = r'      <!-- Success State -->.*?id="dfSuccessClose">Close</button>\s*</div>'
    replacement = COMING_SOON_HTML.format(name=game['name'], signup=game['signup'])

    new_html = re.sub(pattern, replacement, html, flags=re.DOTALL)

    if new_html == html:
        print(f'  SKIP (no match): {fname}')
        continue

    with open(fpath, 'w') as f:
        f.write(new_html)
    count += 1
    print(f'  Updated: {fname}')

print(f'\nDone. Updated {count} pages.')

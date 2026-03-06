#!/usr/bin/env python3
"""Generate all 16 game signup pages from the new template."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PAGES_DIR = os.path.join(BASE_DIR, "pages")

# (filename, display_name, logo_image_filename)
GAMES = [
    ("black-jack.html",   "Black Jack",     "blackjack.gif"),
    ("blue-dragon.html",  "Blue Dragon",    "bluedragon.gif"),
    ("firekirin.html",    "Fire Kirin",     "firekirin.gif"),
    ("game-room777.html", "Game Room 777",  "gameroom777.gif"),
    ("game-vault.html",   "Game Vault",     "gamevault.gif"),
    ("magic-city.html",   "Magic City",     "magic-city.gif"),
    ("milkyways.html",    "Milky Ways",     "milkyways.gif"),
    ("orionstars.html",   "Orion Stars",    "orionstars.gif"),
    ("panda-master.html", "Panda Master",   "panda-master.gif"),
    ("riversweeps.html",  "River Sweeps",   "riversweeps.gif"),
    ("slotsofvegas.html", "Slots of Vegas", "slotsofvegas.gif"),
    ("ultrapanda.html",   "Ultra Panda",    "ultrapanda.gif"),
    ("v-power.html",      "V Power",        "vpower.gif"),
    ("vblink.html",       "VBlink",         "vblink.gif"),
    ("vegas-sweeps.html", "Vegas Sweeps",   "vegas-sweeps.gif"),
    ("vegasx.html",       "Vegas X",        "vegasx.gif"),
]

# Read in the template file
TEMPLATE_PATH = os.path.join(BASE_DIR, "signup_template.html")

def generate_all():
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    os.makedirs(PAGES_DIR, exist_ok=True)

    for filename, display_name, logo_img in GAMES:
        logo_url = f"../assets/images/games/{logo_img}"

        html = template
        html = html.replace("{{GAME_NAME}}", display_name)
        html = html.replace("{{LOGO_URL}}", logo_url)

        filepath = os.path.join(PAGES_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  ✓ {filename} — {display_name}")

    print(f"\n✅ All {len(GAMES)} signup pages generated!")

if __name__ == "__main__":
    generate_all()

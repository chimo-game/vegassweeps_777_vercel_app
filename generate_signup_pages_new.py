#!/usr/bin/env python3
"""
generate_signup_pages_new.py
Regenerates all 16 signup pages in /pages/ using signup_template.html as the base.
This version DOES NOT modify the HTML structure at all (no SEO injection),
it merely replaces the {{GAME_NAME}} and {{LOGO_URL}} placeholders
so the user's raw pasted code remains perfectly intact.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "signup_template.html")
PAGES_DIR = os.path.join(BASE_DIR, "pages")

# (filename, display_name, slug, image_url, local_image_path)
GAMES = [
    ("black-jack.html",   "Black Jack",     "black-jack",  "https://gameroom777.net/wp-content/uploads/2023/09/blackjack.gif",    "../assets/images/games/blackjack.gif"),
    ("blue-dragon.html",  "Blue Dragon",    "blue-dragon", "https://gameroom777.net/wp-content/uploads/2023/09/bluedragon.gif",   "../assets/images/games/bluedragon.gif"),
    ("firekirin.html",    "Fire Kirin",     "firekirin",   "https://gameroom777.net/wp-content/uploads/2023/09/firekirin.gif",    "../assets/images/games/firekirin.gif"),
    ("game-room777.html", "Game Room 777",  "game-room777","https://gameroom777.net/wp-content/uploads/2023/09/gameroom777.gif",  "../assets/images/games/gameroom777.gif"),
    ("game-vault.html",   "Game Vault",     "game-vault",  "https://gameroom777.net/wp-content/uploads/2023/09/gamevault.gif",    "../assets/images/games/gamevault.gif"),
    ("magic-city.html",   "Magic City",     "magic-city",  "https://gameroom777.net/wp-content/uploads/2023/09/magiccity.gif",    "../assets/images/games/magiccity.gif"),
    ("milkyways.html",    "Milky Ways",     "milkyways",   "https://gameroom777.net/wp-content/uploads/2023/09/milkyways.gif",    "../assets/images/games/milkyways.gif"),
    ("orionstars.html",   "Orion Stars",    "orionstars",  "https://gameroom777.net/wp-content/uploads/2023/09/orionstars.gif",   "../assets/images/games/orionstars.gif"),
    ("panda-master.html", "Panda Master",   "panda-master","https://gameroom777.net/wp-content/uploads/2023/09/pandamaster.gif",  "../assets/images/games/pandamaster.gif"),
    ("riversweeps.html",  "River Sweeps",   "riversweeps", "https://gameroom777.net/wp-content/uploads/2023/09/riversweeps.gif",  "../assets/images/games/riversweeps.gif"),
    ("slotsofvegas.html", "Slots of Vegas", "slotsofvegas","https://gameroom777.net/wp-content/uploads/2023/09/slotsofvegas.gif", "../assets/images/games/slotsofvegas.gif"),
    ("ultrapanda.html",   "Ultra Panda",    "ultrapanda",  "https://gameroom777.net/wp-content/uploads/2023/09/ultrapanda.gif",   "../assets/images/games/ultrapanda.gif"),
    ("v-power.html",      "V Power",        "v-power",     "https://gameroom777.net/wp-content/uploads/2023/09/vpower.gif",       "../assets/images/games/vpower.gif"),
    ("vblink.html",       "VBlink",         "vblink",      "https://gameroom777.net/wp-content/uploads/2023/09/vblink.gif",       "../assets/images/games/vblink.gif"),
    ("vegas-sweeps.html", "Vegas Sweeps",   "vegas-sweeps","https://gameroom777.net/wp-content/uploads/2023/09/vegas-sweeps.gif", "../assets/images/games/vegas-sweeps.gif"),
    ("vegasx.html",       "Vegas X",        "vegasx",      "https://gameroom777.net/wp-content/uploads/2023/09/vegasx.gif",       "../assets/images/games/vegasx.gif"),
]

def build_page(template: str, filename: str, game_name: str, game_slug: str, image_url: str, local_img: str) -> str:
    """Replace all placeholders in the template natively without stripping structure."""

    result = template
    
    # 1. Replace {{GAME_NAME}} and {{LOGO_URL}} placeholders
    result = result.replace("{{GAME_NAME}}", game_name)
    result = result.replace("{{LOGO_URL}}", local_img)

    return result


def main():
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    os.makedirs(PAGES_DIR, exist_ok=True)

    for filename, game_name, game_slug, image_url, local_img in GAMES:
        page_content = build_page(template, filename, game_name, game_slug, image_url, local_img)
        out_path = os.path.join(PAGES_DIR, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(page_content)
        print(f"  ✓  {filename}  →  {game_name}")

    print(f"\\n✅  Generated {len(GAMES)} pages in {PAGES_DIR}/")


if __name__ == "__main__":
    main()

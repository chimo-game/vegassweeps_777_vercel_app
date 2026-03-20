#!/usr/bin/env python3
"""
generate_signup_pages_new.py
Regenerates all 16 signup pages in /pages/ using signup_template.html as the base.
Adds full SEO <head> metadata and replaces game-specific placeholders.
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

SEO_HEAD = """\
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{GAME_NAME} - Play For Free &amp; Get Sign-Up Bonus</title>
  <meta name="description" content="Create your {GAME_NAME} account in under a minute. Claim a $10 Free Play bonus with code CLAIM10. No credit card needed." />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href="https://vegassweeps777.vercel.app/{GAME_SLUG}/" />

  <link rel="icon" href="/favicon/icon.png" type="image/png" />
  <link rel="apple-touch-icon" href="/favicon/icon.png" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Vegas Sweeps 777" />
  <meta property="og:title" content="{GAME_NAME} - Play For Free &amp; Get Sign-Up Bonus" />
  <meta property="og:description" content="Fast signup. Claim $10 Free Play with code CLAIM10. No credit card required." />
  <meta property="og:url" content="https://vegassweeps777.vercel.app/{GAME_SLUG}/" />
  <meta property="og:image" content="{IMAGE_URL}" />
  <meta property="og:image:alt" content="{GAME_NAME} logo" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{GAME_NAME} - Play For Free &amp; Get Sign-Up Bonus" />
  <meta name="twitter:description" content="Create your account and claim $10 Free Play with promo code CLAIM10." />
  <meta name="twitter:image" content="{IMAGE_URL}" />

  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@graph": [
      {{
        "@type": "Organization",
        "@id": "https://vegassweeps777.vercel.app/#organization",
        "name": "Vegas Sweeps 777",
        "url": "https://vegassweeps777.vercel.app/",
        "logo": "{IMAGE_URL}"
      }},
      {{
        "@type": "WebPage",
        "@id": "https://vegassweeps777.vercel.app/{GAME_SLUG}/#webpage",
        "url": "https://vegassweeps777.vercel.app/{GAME_SLUG}/",
        "name": "{GAME_NAME} - Play For Free & Get Sign-Up Bonus",
        "description": "Create your {GAME_NAME} account, claim a $10 Free Play bonus with code CLAIM10.",
        "isPartOf": {{ "@id": "https://vegassweeps777.vercel.app/#website" }},
        "about": {{ "@id": "https://vegassweeps777.vercel.app/#organization" }}
      }},
      {{
        "@type": "WebSite",
        "@id": "https://vegassweeps777.vercel.app/#website",
        "url": "https://vegassweeps777.vercel.app/",
        "name": "Vegas Sweeps 777"
      }}
    ]
  }}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700;800&family=Rajdhani:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <link rel="stylesheet" href="../assets/css/signup-new.css">"""


def build_page(template: str, filename: str, game_name: str, game_slug: str, image_url: str, local_img: str) -> str:
    """Replace all placeholders in the template and inject SEO head."""

    # 1. Replace the minimal <head> block (everything between <head> and </head>)
    #    with our full SEO head.
    import re

    new_head_inner = SEO_HEAD.format(
        GAME_NAME=game_name,
        GAME_SLUG=game_slug,
        IMAGE_URL=image_url,
    )

    # Replace between <head> and </head>
    result = re.sub(
        r'<head>.*?</head>',
        f'<head>\n{new_head_inner}\n</head>',
        template,
        flags=re.DOTALL,
    )

    # 2. Replace {{GAME_NAME}} and {{LOGO_URL}} placeholders (template style)
    result = result.replace("{{GAME_NAME}}", game_name)
    result = result.replace("{{LOGO_URL}}", local_img)

    # 3. Replace any remaining literal {GAME_NAME} or {LOGO_URL} (unlikely but safe)
    result = result.replace("{GAME_NAME}", game_name)
    result = result.replace("{LOGO_URL}", local_img)

    # 4. Fix the "why verify" popup — it still references {{GAME_NAME}}
    #    (already handled above, but also fix vm-sub member mention)
    # vm-sub already replaced above via {{GAME_NAME}} replacement

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

    print(f"\n✅  Generated {len(GAMES)} pages in {PAGES_DIR}/")


if __name__ == "__main__":
    main()

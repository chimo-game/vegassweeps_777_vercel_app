#!/usr/bin/env python3
import os

# Game mapping: (filename, display_name, slug, image_url)
games = [
    ("black-jack.html", "Black Jack", "black-jack", "https://gameroom777.net/wp-content/uploads/2023/09/blackjack.gif"),
    ("blue-dragon.html", "Blue Dragon", "blue-dragon", "https://gameroom777.net/wp-content/uploads/2023/09/bluedragon.gif"),
    ("firekirin.html", "Fire Kirin", "firekirin", "https://gameroom777.net/wp-content/uploads/2023/09/firekirin.gif"),
    ("game-vault.html", "Game Vault", "game-vault", "https://gameroom777.net/wp-content/uploads/2023/09/gamevault.gif"),
    ("magic-city.html", "Magic City", "magic-city", "https://gameroom777.net/wp-content/uploads/2023/09/magiccity.gif"),
    ("milkyways.html", "Milky Ways", "milkyways", "https://gameroom777.net/wp-content/uploads/2023/09/milkyways.gif"),
    ("orionstars.html", "Orion Stars", "orionstars", "https://gameroom777.net/wp-content/uploads/2023/09/orionstars.gif"),
    ("panda-master.html", "Panda Master", "panda-master", "https://gameroom777.net/wp-content/uploads/2023/09/pandamaster.gif"),
    ("riversweeps.html", "River Sweeps", "riversweeps", "https://gameroom777.net/wp-content/uploads/2023/09/riversweeps.gif"),
    ("slotsofvegas.html", "Slots of Vegas", "slotsofvegas", "https://gameroom777.net/wp-content/uploads/2023/09/slotsofvegas.gif"),
    ("ultrapanda.html", "Ultra Panda", "ultrapanda", "https://gameroom777.net/wp-content/uploads/2023/09/ultrapanda.gif"),
    ("v-power.html", "V Power", "v-power", "https://gameroom777.net/wp-content/uploads/2023/09/vpower.gif"),
    ("vblink.html", "VBlink", "vblink", "https://gameroom777.net/wp-content/uploads/2023/09/vblink.gif"),
    ("vegas-sweeps.html", "Vegas Sweeps", "vegas-sweeps", "https://gameroom777.net/wp-content/uploads/2023/09/vegas-sweeps.gif"),
    ("vegasx.html", "Vegas X", "vegasx", "https://gameroom777.net/wp-content/uploads/2023/09/vegasx.gif"),
]

# Use relative path for pages output
base_dir = os.path.join(os.path.dirname(__file__), 'pages')

def generate_page(game_name, game_slug, image_url):
    """Generate HTML with placeholders replaced"""
    # Use absolute path to ensure we find the template
    template_path = os.path.join(os.path.dirname(__file__), 'templates', 'game_page.html')
    
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()
    except FileNotFoundError:
        print(f"Error: Template not found at {template_path}")
        return ""

    # Replace placeholders manually to avoid bracing issues
    content = template.replace('{GAME_NAME}', game_name)
    content = content.replace('{GAME_SLUG}', game_slug)
    content = content.replace('{IMAGE_URL}', image_url)
    
    return content

# Generate all 15 pages
if __name__ == "__main__":
    if not os.path.exists(base_dir):
        os.makedirs(base_dir, exist_ok=True)
        
    for filename, game_name, slug, image_url in games:
        content = generate_page(game_name, slug, image_url)
        if content:
            filepath = os.path.join(base_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Generated: {filename}")
        else:
            print(f"✗ Failed to generate: {filename}")

    print(f"\n✓ Sign up pages updated with external template!")

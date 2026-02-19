import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Target the hint div
    # <div class="hint" id="cHint">Recommended: <b>CLAIM10</b></div>
    
    target_str = '<div class="hint" id="cHint">Recommended: <b>CLAIM10</b></div>'
    
    if target_str in content:
        content = content.replace(target_str, '')
        print(f"Removed recommendation from {filepath}")
        
        with open(filepath, 'w') as f:
            f.write(content)
    else:
        # Try without the bold tag just in case
        target_str_2 = '<div class="hint" id="cHint">Recommended: CLAIM10</div>'
        if target_str_2 in content:
            content = content.replace(target_str_2, '')
            print(f"Removed recommendation (no bold) from {filepath}")
            with open(filepath, 'w') as f:
                f.write(content)

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

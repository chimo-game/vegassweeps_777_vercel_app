import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Update Label
    old_label = '<label>Welcome Bonus $10 Free</label>'
    new_label = '<label class="center-label"><ion-icon name="gift"></ion-icon> Welcome Bonus</label>'
    
    if old_label in content:
        content = content.replace(old_label, new_label)
        print(f"Updated label in {filepath}")
    
    # 2. Remove "APPLIED" section
    # We'll use a regex or simple string replacement if the block is consistent.
    # The block is:
    # <div class="ticket-right">
    #   <ion-icon name="checkmark-circle"></ion-icon>
    #   <span>APPLIED</span>
    # </div>
    # Let's try to remove it carefully.
    
    match_str = """                <div class="ticket-right">
                  <ion-icon name="checkmark-circle"></ion-icon>
                  <span>APPLIED</span>
                </div>"""
    
    if match_str in content:
        content = content.replace(match_str, "")
        print(f"Removed APPLIED badge from {filepath}")
    else:
        # Try a slightly looser match if indentation varies, or just the specific lines
        # This is a simple script, so I'll try to find the exact string from the view_file output first.
        # If that fails, I might need to rely on the CSS to hide it, but the user asked to "remove" it.
        pass

    with open(filepath, 'w') as f:
        f.write(content)

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

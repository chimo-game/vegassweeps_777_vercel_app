import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove punch divs
    # We will just replace them with empty string. Since they are on their own lines usually.
    
    content = content.replace('<div class="ticket-punch-top"></div>', '')
    content = content.replace('<div class="ticket-punch-bottom"></div>', '')
    
    # Also clean up empty lines if created, but not strictly necessary for HTML.
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Removed punch divs from {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

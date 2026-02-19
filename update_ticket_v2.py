import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Target the existing single icon block to replace it
    old_block = """                <div class="ticket-bg-icon">
                  <img src="../assets/images/icons/dollar.png" alt="" />
                </div>"""
    
    # New block with particles and dual icons
    new_block = """                <div class="ticket-particles">
                  <span></span><span></span><span></span><span></span><span></span>
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <!-- Dual Floating Icons -->
                <div class="ticket-icon-left">
                  <img src="../assets/images/icons/dollar.png" alt="" />
                </div>
                <div class="ticket-icon-right">
                  <img src="../assets/images/icons/dollar.png" alt="" />
                </div>"""
    
    if old_block in content:
        content = content.replace(old_block, new_block)
        print(f"Updated {filepath}")
        
        with open(filepath, 'w') as f:
            f.write(content)
    else:
        # Fallback if indentation differs slightly or manual edit
        # Try finding just the internal part if the block match fails
        pass

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

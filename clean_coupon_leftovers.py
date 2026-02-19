import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Define the specific blocks to remove.
    # We will remove lines containing specific IDs or classes.
    
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if 'id="coupon"' in line:
            continue
        if 'id="btnApply"' in line:
            continue
        if 'class="coupon-input"' in line:
            continue
        if 'class="modern-apply-btn"' in line:
            continue
        if '<span class="btn-text">Apply</span>' in line:
            continue
        if '<div class="btn-loader"></div>' in line:
            continue
        if 'class="coupon-icon-box"' in line:
            continue
        if '<ion-icon name="ticket-outline"></ion-icon>' in line:
            continue
        # Also remove the closing button tag if it's on its own line
        if line.strip() == '</button>' and 'btnApply' not in line: 
            # This is risky if there are other buttons.
            # But in the context of the coupon area, it's likely fine. 
            # However, let's be safer.
            pass
            
        new_lines.append(line)
        
    # Reconstruct content
    content = '\n'.join(new_lines)
    
    # Clean up empty div wrappers if any
    # <div class="coupon-area"> might be empty now aside from success-ticket?
    # verify via view_file later.
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Cleaned {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

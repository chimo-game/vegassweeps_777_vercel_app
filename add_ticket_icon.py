import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Target the ticket-left div to insert the icon before it
    # OR target success-ticket to append it?
    # The plan says: Inside .success-ticket, before .ticket-left
    
    target_str = '<div class="ticket-shimmer"></div>'
    inject_html = """<div class="ticket-shimmer"></div>
                <div class="ticket-bg-icon">
                  <img src="../assets/images/icons/dollar.png" alt="" />
                </div>"""
    
    if '<div class="ticket-bg-icon">' not in content:
        if target_str in content:
            content = content.replace(target_str, inject_html)
            print(f"Added icon to {filepath}")
            
            with open(filepath, 'w') as f:
                f.write(content)
        else:
            print(f"Warning: Target string not found in {filepath}")
    else:
        print(f"Icon already present in {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

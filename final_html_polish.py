import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    
    # We want to remove:
    # 1. Any `</div>` that appears shortly BEFORE `.success-ticket` (debris from coupon wrapper)
    # 2. Any `</div>` that appears shortly AFTER `.success-ticket` block ends (wrapper closure)
    
    # Locate success-ticket start
    success_ticket_start = -1
    for i, line in enumerate(lines):
        if 'id="successTicket"' in line:
            success_ticket_start = i
            break
            
    if success_ticket_start == -1:
        print(f"Skipping {filepath} (no success ticket)")
        return

    # 1. Look backwards for debris </div>
    # Scan back 5 lines max
    debris_indices = []
    for i in range(success_ticket_start - 1, max(-1, success_ticket_start - 10), -1):
        line = lines[i].strip()
        if line == '</div>':
            debris_indices.append(i)
        elif line == '<div class="coupon-area">': # If opening tag persists
            debris_indices.append(i)
        elif line == '':
            continue
        elif '<label' in line: # Stop at label
            break
            
    # 2. Look forwards for wrapper closure </div>
    # We need to find where success-ticket ENDS first.
    # It starts at `success_ticket_start`.
    # Let's count indentation? 
    # The start line usually has indentation.
    # <div class="success-ticket" ...>
    # We can just count divs.
    
    success_ticket_end = -1
    nesting = 0
    found_start = False
    
    for i in range(success_ticket_start, len(lines)):
        line = lines[i]
        
        # simple count
        open_count = line.count('<div')
        close_count = line.count('</div>')
        
        if not found_start:
            nesting += open_count - close_count
            found_start = True
        else:
            nesting += open_count - close_count
            
        if nesting == 0:
            success_ticket_end = i
            break
            
    if success_ticket_end != -1:
        # Check specific line after success_ticket_end for wrapper closure
        # It should be the next non-empty line being `</div>`
        for i in range(success_ticket_end + 1, min(len(lines), success_ticket_end + 5)):
            line = lines[i].strip()
            if line == '</div>':
                debris_indices.append(i)
                break # Only remove one wrapper closure
            elif line == '':
                continue
            else:
                break # Found some other content, stop.
                
    # Rebuild file excluding debris indices
    final_lines = []
    for i, line in enumerate(lines):
        if i not in debris_indices:
            final_lines.append(line)
            
    with open(filepath, 'w') as f:
        f.write('\n'.join(final_lines))
        print(f"Polished {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

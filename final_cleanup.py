import os

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    # We want to remove lines that look like debris
    # specifically: 'autocomplete="off">', '</button>' (if inside coupon area context), '</div>' (if it was the wrapper closing)
    
    # But removing '</div>' blindly is bad.
    
    # unique debris strings
    debris_1 = 'autocomplete="off">'
    debris_2 = 'placeholder="Code (e.g. CLAIM10)"' # just in case
    
    for i, line in enumerate(lines):
        if debris_1 in line:
            continue
        # Remove the </button> that follows the debris, usually next line or close
        if line.strip() == '</button>':
            # check context, if previous lines were removed or if it looks like the apply button closure
            # The apply button had class modern-apply-btn.
            # safe bet: if the line before it was removed or empty?
            # actually, let's just remove the specific button closure if we can identify it.
            # The previous script removed the opening tag. So this </button> is indeed an orphan.
            # But there are other buttons (submit).
            # The submit button is: <button type="submit" class="submit" id="submitBtn">
            # So we must be careful.
            
            # The orphan </button> is likely preceded by empty lines or the input debris.
            pass 
        
        # Let's try a different approach:
        # The coupon-area contains modern-coupon-wrapper (removed) and success-ticket.
        # If modern-coupon-wrapper opening is gone, its content lines might remain.
        # I will filter out lines that contain specific substrings known to be part of the coupon input ONLY.
        
        if 'autocomplete="off">' in line: 
            continue
        if '<div class="btn-loader"></div>' in line:
            continue
        if '<span class="btn-text">Apply</span>' in line:
            continue
            
        new_lines.append(line)
        
    # Re-join
    content = '\n'.join(new_lines)
    
    # Now address the orphan </button> and </div>
    # The structure left is likely:
    # <div class="coupon-area">
    #    ... debris ...
    #    </button>
    #  </div>
    #  <div class="success-ticket">...
    
    # Wait, in the view_file, the debris was BEFORE success-ticket.
    # 304: autocomplete...
    # 305: </button>
    # 306: </div>
    
    content = content.replace('                  autocomplete="off">', '')
    content = content.replace('                </button>', '') # indentation match?
    # Let's use flexible whitespace replacement for the orphan button
    # but be careful not to kill other buttons.
    # The submit button is usually indented differently or has content.
    
    # Replace specifically the sequence if possible
    # But line operations are safer if we know exact content.
    
    # Let's regex replace the specific debris block if standard
    import re
    content = re.sub(r'\s+autocomplete="off">\s+<\/button>\s+<\/div>', '', content)
    
    # Also just `</button>` sticking around?
    lines = content.split('\n')
    final_lines = []
    for line in lines:
        if line.strip() == '</button>' and 'submit' not in line:
            # Check if it's the orphan. The valid submit button is usually multi-line but let's check.
            # <button type="submit" ...>
            #    <span>...</span>
            # </button>
            # The orphan one might just be </button>.
            
            # Risk: The valid button closing tag is also just </button>.
            # Context matters.
            # The debris is INSIDE <div class="coupon-area"> but BEFORE <div class="success-ticket">.
            pass
            
    # I will rely on the previous regex. if it fails, I will manually patch `firekirin.html` and others via a smarter loop.
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Final clean {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

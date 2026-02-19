import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Target: <div class="modern-coupon-wrapper" id="couponInputWrapper"> ... </div>
    # and <div class="hint" id="cHint">...</div>
    
    # Since the wrapper spans multiple lines, we need a regex or a robust replace.
    # The content of the wrapper is:
    # <div class="modern-coupon-wrapper" id="couponInputWrapper">
    #   <div class="coupon-icon-box">
    #     <ion-icon name="ticket-outline"></ion-icon>
    #   </div>
    #   <input class="coupon-input" type="text" id="coupon" placeholder="Code (e.g. CLAIM10)"
    #     autocomplete="off">
    #   <button type="button" class="modern-apply-btn" id="btnApply" disabled>
    #     <span class="btn-text">Apply</span>
    #     <div class="btn-loader"></div>
    #   </button>
    # </div>
    
    # Regex to match the wrapper div and its content roughly
    # We can rely on specific IDs to be safer if the structure is consistent.
    
    pattern_wrapper = r'<div class="modern-coupon-wrapper" id="couponInputWrapper">[\s\S]*?</div>(\s*</div>)?' 
    # The extra </div> might be needed if it matches inner divs, but non-greedy .*? should stop at first </div>
    # Actually, nested divs make regex hard.
    # Let's try to match the exact block if possible, or use a "start to end" approach if indentation is reliable.
    
    # Better approach: Read file, find start line of wrapper, find end line of wrapper, remove lines.
    
    lines = content.split('\n')
    new_lines = []
    skip = False
    
    for line in lines:
        if 'id="couponInputWrapper"' in line:
            skip = True
        
        if 'id="cHint"' in line:
            continue # Skip the hint line directly
            
        if skip:
            # check for the closing div of the wrapper. 
            # The wrapper seems to be closed by a </div> with standard indentation.
            # But "SEARCH" in previous steps showed indentation.
            # Let's count divs? No, that's complex for valid HTML.
            
            # Simple heuristic: The wrapper ends after the button closes.
            # The button closes, then the input wrapper closes.
            if 'class="modern-apply-btn"' in line:
                # This is inside.
                pass
            if '</button>' in line:
                # Button closed.
                pass
            if line.strip() == '</div>' and 'modern-coupon-wrapper' not in line:
                # This *might* be the closing div. 
                # Let's check the structure from `view_file` output earlier.
                # <div class="modern-coupon-wrapper" ...>
                #   ...
                # </div>
                
                # It seems safe to skip until we see the success-ticket or coupon-area closing? 
                # Actually, simply removing the known ID lines + content is safer with replace if we have the exact string.
                pass
                
    # Retrying exact string match from previous view_file
    
    block_to_remove = """            <div class="modern-coupon-wrapper" id="couponInputWrapper">
              <div class="coupon-icon-box">
                <ion-icon name="ticket-outline"></ion-icon>
              </div>
              <input class="coupon-input" type="text" id="coupon" placeholder="Code (e.g. CLAIM10)"
                autocomplete="off">
              <button type="button" class="modern-apply-btn" id="btnApply" disabled>
                <span class="btn-text">Apply</span>
                <div class="btn-loader"></div>
              </button>
            </div>"""
            
    # Normalize line endings/spaces could be tricky. 
    # Let's use the regex for the wrapper.
    
    content = re.sub(r'<div class="modern-coupon-wrapper" id="couponInputWrapper">[\s\S]*?</div>', '', content)
    
    # Remove the hint if it exists (we already removed the text inside, but the div might remain or be empty)
    # Previous script removed `<div class="hint" id="cHint">Recommended: <b>CLAIM10</b></div>`
    # Check if empty hint div remains?
    # regex for any remaining cHint
    content = re.sub(r'<div class="hint" id="cHint">.*?</div>', '', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Processed {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

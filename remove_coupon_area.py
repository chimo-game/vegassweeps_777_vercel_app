import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The structure is:
    # <div class="coupon-area">
    #   ... content (success-ticket) ...
    # </div>
    
    # We want to remove the opening <div class="coupon-area"> and the closing </div>
    # But we need to be careful about which closing </div> it is.
    # Given the previous cleanups, the content inside coupon-area should be just the success-ticket div.
    
    # Let's try to match the block.
    # Since indentation might vary, we can look for the specific opening tag.
    
    if '<div class="coupon-area">' not in content:
        print(f"Skipping {filepath} (no coupon-area)")
        return

    # Simple approach: Identify lines.
    lines = content.split('\n')
    new_lines = []
    
    coupon_area_open = False
    
    for line in lines:
        if '<div class="coupon-area">' in line:
            coupon_area_open = True
            continue # Skip opening tag
        
        if coupon_area_open:
            # We are inside. We need to find the closing div of coupon-area.
            # The next element IS the success-ticket.
            # <div class="success-ticket" id="successTicket"> ... </div>
            # Then the closing </div> for coupon-area.
            
            # Since success-ticket is a big block, we can't just skip the next </div> we see.
            # But based on typical indentation from previous steps:
            # 302:             <div class="coupon-area">
            # ...
            # 328:             </div>
            
            # The closing div usually has the same indentation as the opening if formatted correctly.
            # But previous edits might have messed up indentation.
            
            # Heuristic: The closing div of coupon-area is likely the one immediately following the closing of success-ticket.
            # OR, we can just remove lines that are EXACTLY `            </div>` if we know the indentation.
            
            # Let's rely on the fact that we just cleaned up the file. 
            # The structure should be:
            # <div class="coupon-area">
            #    <div class="success-ticket" ...>
            #       ...
            #    </div>
            # </div>
            
            # I'll just filter out the specific line `<div class="coupon-area">` 
            # AND the `</div>` that is indented to match it? No, indentation is risky.
            
            # Let's just remove the opening tag for sure.
            # And for the closing tag: It should be the `</div>` that follows `successResult` or `successTicket` closing?
            
            # Wait, I can just remove the specific lines if I can find them. 
            pass
            
            
    # Regex approach might be safer for well-nested HTML but standard regex isn't recursive.
    # However, since we know we want to unwrap `.success-ticket`:
    
    # Find start index of <div class="coupon-area">
    # Find end index of matching </div>
    
    # ACTUALLY, simpler:
    # Just remove `             <div class="coupon-area">`
    # And remove the `            </div>` that is 2 lines after `          <div class="success-ticket" ...>` ends? No.
    
    # Let's try this:
    # 1. Read file.
    # 2. Convert to lines.
    # 3. Filter out lines containing `<div class="coupon-area">`.
    # 4. Filter out the specific `</div>` that closes it. 
    #    It usually appears after `.success-ticket` block.
    #    In `firekirin.html` (viewed previously):
    #    328:             </div>
    #    329:             
    #    330:           </div>
    
    # This is tricky without a parser.
    # But wait, looking at `firekirin.html` line 302 and 328.
    # 302:             <div class="coupon-area">
    # 328:             </div>
    
    # I will strip `<div class="coupon-area">` line.
    # I will also look for the `</div>` line that has the same indentation level?
    # It seems to be 12 spaces + </div>.
    
    # Let's try to be robust.
    # I will construct a new list of lines.
    # I will track if I am "inside" coupon area. 
    # If I hit the opening tag, I set a flag and skip the line.
    # If I am inside, and I see `</div>` that matches the indentation of the opening tag? 
    # Or just `</div>` that is clearly the wrapper closure.
    
    # Refined approach:
    # 1. Remove `<div class="coupon-area">`.
    # 2. Remove the `</div>` that immediately follows the closing of `success-ticket`?
    #    But how do we know when success-ticket closes?
    
    # Let's look at `firekirin.html` again. 
    # The `coupon-area` wrapper basically wraps `success-ticket`.
    # Using `BeautifulSoup` would be ideal but I don't want to install dependencies if not present.
    # I'll stick to string manipulation.
    
    # Remove opening tag.
    content = content.replace('<div class="coupon-area">', '')
    
    # Remove closing tag. 
    # It is likely `            </div>` (12 spaces).
    # But `success-ticket` is also indented?
    # The `success-ticket` is inside.
    
    # Let's assume the indentation is consistent with previous files.
    # I will remove the first `</div>` that appears after `success-ticket` ending?
    # No, `success-ticket` has nested `div`s.
    
    # Let's use a counter.
    # Iterate lines.
    # When `<div class="coupon-area">` is found (trimmed check), skip it and start nesting count = 1.
    # For subsequent lines, count `<div>` (add 1) and `</div>` (sub 1).
    # When count goes back to 0, that's the closing div of coupon-area. Skip it.
    
    import re
    
    lines = content.split('\n')
    output_lines = []
    
    inside_coupon_area = False
    nesting_level = 0
    
    for line in lines:
        if '<div class="coupon-area">' in line:
            inside_coupon_area = True
            nesting_level = 1 # We just entered it
            continue # Remove opening tag
            
        if inside_coupon_area:
            # Check for divs in this line to update nesting
            # This is naive (multiple divs on one line? comments?)
            # Assuming standard formatting 1 tag per line mostly, or clear nesting.
            
            # Counts
            open_divs = line.count('<div')
            close_divs = line.count('</div>')
            
            # If the current line is JUST `</div>`, we process it specifically?
            # No, update nesting first.
            
            # We need to distinguish if the `</div>` closes the `coupon-area` or something inside.
            # If `nesting_level` drops to 0 after this line, then this line contains the closing tag.
            
            # Wait, if line has `</div>` it decrements.
            # If `nesting_level` was 1, and we have `</div>`, it becomes 0.
            # That means this line closes the coupon area.
            
            # Potential issue: `<div ...></div>` on same line (net 0).
            # `open_divs` = 1, `close_divs` = 1. `nesting_level` change = 0.
            
            # We want to catch the specific `</div>` that brings nesting from 1 to 0.
            
            temp_level = nesting_level + open_divs - close_divs
            
            if temp_level == 0 and close_divs > 0:
                # This line closes the coupon area.
                # Assuming the line is JUST the closing div (or with whitespace).
                if line.strip() == '</div>':
                    inside_coupon_area = False # We are out
                    continue # Remove this closing tag
                else:
                    # It might be `</div><!-- comment -->` or something.
                    # Or content + `</div>`. 
                    # If content exists, we shouldn't delete the whole line, just the outer div?
                    # But `coupon-area` was a wrapper. It shouldn't have inline content with the closing tag if formatted nicely.
                    # Let's assume it is on its own line.
                    inside_coupon_area = False
                    continue
            
            nesting_level = temp_level
            output_lines.append(line)
        else:
            output_lines.append(line)

    new_content = '\n'.join(output_lines)
    
    with open(filepath, 'w') as f:
        f.write(new_content)
        print(f"Removed coupon-area from {filepath}")

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        update_file(os.path.join(pages_dir, filename))

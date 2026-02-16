import glob
import os

def restore_modal_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Find the modal content
    # It starts with <div class="modal-overlay" id="processModal"
    # We need to find where it is now. It should be inside #mainCard.
    
    start_marker = '<div class="modal-overlay" id="processModal"'
    start_idx = content.find(start_marker)
    
    if start_idx == -1:
        print(f"Skipping {filepath}: #processModal not found")
        return

    # Find the end of the div.
    open_divs = 0
    end_idx = -1
    i = start_idx
    while i < len(content):
        if content[i:i+4] == '<div':
            open_divs += 1
            i += 4
        elif content[i:i+5] == '</div':
            open_divs -= 1
            i += 5
            if open_divs == 0:
                end_idx = i + 1 # pointer is after </div> specifically at '>'
                break
        else:
            i += 1
    
    if end_idx == -1:
         print(f"Skipping {filepath}: Could not find closing tag for #processModal")
         return

    modal_html = content[start_idx:end_idx]
    
    # Remove the modal from its current location
    # verify strictly that we don't mess up spacing too much, but HTML is forgiving.
    new_content_temp = content[:start_idx] + content[end_idx:]
    
    # 2. Insert it back before </body> or before the scripts at the end.
    # Usually we want it partially high up Z-index wise, but in HTML order, end of body is fine for fixed overlays.
    # Let's put it before <script defer src="/assets/js/signup.js"></script> if it exists, or before </body>
    
    target_marker = '<script defer src="/assets/js/signup.js"></script>'
    insert_idx = new_content_temp.find(target_marker)
    
    if insert_idx == -1:
        # Fallback to body close
        insert_idx = new_content_temp.find('</body>')
    
    if insert_idx == -1:
        print(f"Skipping {filepath}: Could not find target insertion point")
        return

    final_content = new_content_temp[:insert_idx] + "\n" + modal_html + "\n\n  " + new_content_temp[insert_idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print(f"Restored {filepath}")

# list of files
files = glob.glob('pages/*.html')
if os.path.exists('index.html'):
    files.append('index.html')

for f in files:
    restore_modal_in_file(f)

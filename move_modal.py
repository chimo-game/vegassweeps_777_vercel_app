import glob
import re
import os

def move_modal_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to capture the #processModal div
    # It assumes the div starts with <div class="modal-overlay" id="processModal" and ends with </div> 
    # capturing nested divs is tricky with regex, but since we know the indentation from the file view...
    # The file view showed indentation. Let's try to capture by specific start/end markers if possible
    # or use a counter-based approach if regex is too risky.
    
    # Simple strategy: Find start index, find matching closing tag.
    start_marker = '<div class="modal-overlay" id="processModal"'
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print(f"Skipping {filepath}: #processModal not found")
        return

    # Find the end of the div. 
    # Since we know the structure is well-formatted, we can count <div> and </div>
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
    
    # Remove the modal from the body
    new_content = content[:start_idx] + content[end_idx:]

    # Now insert it into #mainCard
    # We want to insert it before the closing </section> of <section class="card" id="mainCard" ...>
    # First find #mainCard
    card_start_marker = 'id="mainCard"'
    card_start = new_content.find(card_start_marker)
    if card_start == -1:
         print(f"Skipping {filepath}: #mainCard not found")
         return
    
    # Find the closing </section> for this card. 
    # Again, counting generic tags is risky if nested sections existed, but they likely don't.
    # However, simpler approach: The card ends with </section>. 
    # Let's inspect the `signup.js` or `vegas-sweeps.html` again.
    # The card contains a form. The form ends with </form>.
    # The card ends immediately after the form usually?
    # View file showed:
    # 473:       </form>
    # 474:     </section>
    
    # So we can search for `</form>` inside the card and insert AFTER it?
    # Or search for `</section>` after the card start.
    
    # Let's verify if there are nested sections in the card. 
    # content showed <section ...> ... <div class="header"> ... <div class="progress"> ... <form> ... </form> </section>
    # No nested sections visible in the snippet.
    
    # Find the closing </section> after card_start
    section_end = new_content.find('</section>', card_start)
    if section_end == -1:
        print(f"Skipping {filepath}: Closing section for card not found")
        return

    # Insert modal_html before section_end
    # Add some indentation/newlines for cleanliness
    insertion = f"\n{modal_html}\n"
    final_content = new_content[:section_end] + insertion + new_content[section_end:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print(f"Updated {filepath}")

# list of files
files = glob.glob('pages/*.html')
# Also check index.html if it has the same structure
if os.path.exists('index.html'):
    files.append('index.html')

for f in files:
    move_modal_in_file(f)

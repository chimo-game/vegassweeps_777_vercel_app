import glob
import os

def update_files():
    files = glob.glob('pages/*.html')
    if os.path.exists('index.html'):
        files.append('index.html')

    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Update Header
        if "You’re All Set!" in content:
            content = content.replace("You’re All Set!", "Account Ready!")
        
        # 2. Update Button Text
        # The button text might be surrounded by whitespace or icon tags
        if "Verify & Claim Bonus" in content:
            content = content.replace("Verify & Claim Bonus", "Activate My Account")
            
        # 3. Update Default Subtitle in HTML (if it matches the viewing)
        # Target: <p class="success-subtitle" id="successSubtitle">Your account has been created and your bonus is ready.</p>
        old_sub = "Your account has been created and your bonus is ready."
        new_sub = "Your account has been created. Please activate it now to start playing."
        if old_sub in content:
            content = content.replace(old_sub, new_sub)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    update_files()

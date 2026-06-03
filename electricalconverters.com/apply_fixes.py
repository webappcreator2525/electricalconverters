import os
import glob
import re
from bs4 import BeautifulSoup

base_dir = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"

# Correct font string
new_fonts = '<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;family=IBM+Plex+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet"/>'

for filepath in glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True):
    if 'assets' in filepath:
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # 1. Strip <style> tags from static value pages
    # A simple way to check if it's a static value page is if depth > 2 from base or specific names
    is_static_page = bool(re.search(r'\d+-watts-to-amps|\d+-kw-to-amps', filepath))
    
    soup = BeautifulSoup(html, 'html.parser')
    
    if is_static_page:
        for style in soup.find_all('style'):
            style.decompose()
            
    # 2. Fix Fonts
    head = soup.find('head')
    if head:
        # Remove old google font links
        for link in head.find_all('link', rel='stylesheet'):
            if 'fonts.googleapis.com' in link.get('href', ''):
                link.decompose()
        for link in head.find_all('link', rel='preconnect'):
            link.decompose()
            
        # Inject correct fonts
        new_fonts_soup = BeautifulSoup(
            '<link href="https://fonts.googleapis.com" rel="preconnect"/>\n'
            '<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>\n' + new_fonts,
            'html.parser'
        )
        # add to head
        head.append(new_fonts_soup)

    # 3. Fix Formulas
    for formula in soup.find_all(class_='formula-block'):
        # Fix 'x' and '/' in text content
        for string in formula.find_all(string=True):
            s = string.replace(' x ', ' × ')
            s = s.replace(' / ', ' ÷ ')
            string.replace_with(s)

    # 4. Global string replacements in the raw HTML string
    # We do string replace on the dumped HTML to fix JS and plain text emojis
    modified_html = str(soup)
    
    # Emojis
    for emoji in ['⚡', '📐', '🔋', '💡', '🔌', '⚙']:
        modified_html = modified_html.replace(emoji, '')
        
    # Arrows
    modified_html = modified_html.replace('→', 'to')
    modified_html = modified_html.replace('←', 'Back to')
    modified_html = modified_html.replace('\\u2192', '=') # Fix JS encoded arrows
    
    # Empty State logic
    modified_html = modified_html.replace("'Enter valid values'", "'—'")
    modified_html = modified_html.replace('"Enter valid values"', '"—"')
    modified_html = modified_html.replace(">Enter valid values<", ">—<")
    
    # Formula inline
    modified_html = modified_html.replace(" x ", " × ")
    
    # Re-parse to fix any malformed stuff? No, just string replacements is fine.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(modified_html)
        
    print(f"Fixed {filepath}")

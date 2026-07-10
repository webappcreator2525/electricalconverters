import os
import glob
import re
from bs4 import BeautifulSoup
import unicodedata

def contains_emoji(text):
    for char in text:
        if 'EMOJI' in unicodedata.name(char, '') or char in ['⚡', '💡', '🔋', '🔌', '📐', '⚙']:
            return True
    return False

def audit_file(filepath, base_dir):
    rel_path = filepath.replace(base_dir, '').replace('\\', '/')
    if not rel_path.startswith('/'):
        rel_path = '/' + rel_path
    
    issues = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # 1. Header Consistency
    # Assuming header was just updated by my previous script, but check if there are arrows
    header = soup.find('header', class_='site-header')
    if header:
        if '→' in header.get_text():
            issues.append(f"[PAGE] {rel_path} | [CATEGORY] Header / Navigation | [ISSUE] Arrow character '→' found in header.")
            
    # 2. Typography
    head = soup.find('head')
    if head:
        fonts_found = False
        for link in head.find_all('link'):
            if 'fonts.googleapis.com' in link.get('href', ''):
                if 'DM+Mono' in link.get('href', '') and 'IBM+Plex+Sans' in link.get('href', ''):
                    fonts_found = True
        if not fonts_found:
            issues.append(f"[PAGE] {rel_path} | [CATEGORY] Typography | [ISSUE] Missing correct Google Fonts import in <head>")
            
    # 5. Calculator Input
    for label in soup.find_all('label'):
        if 'font-size: 0.7rem' not in label.get('style', '') and not label.parent.get('class') == ['field-group']:
            # Checked in main.css via .field-group label
            pass
            
    # 6. Result Display
    result_val = soup.find(id='result-value')
    if result_val and 'Enter valid values' in result_val.text:
         issues.append(f"[PAGE] {rel_path} | [CATEGORY] Result Display | [ISSUE] Result empty state is 'Enter valid values' instead of '—'")
         
    # 7. Formula Block
    for formula in soup.find_all(class_='formula-block'):
        text = formula.get_text()
        if ' x ' in text.lower():
             issues.append(f"[PAGE] {rel_path} | [CATEGORY] Formula Block | [ISSUE] Uses 'x' instead of '×' for multiplication")
        if ' / ' in text:
             issues.append(f"[PAGE] {rel_path} | [CATEGORY] Formula Block | [ISSUE] Uses '/' instead of '÷' for division")
             
    # 8. FAQ Section
    for faq in soup.find_all(class_='faq-item'):
        question = faq.find(class_='faq-item__question')
        answer = faq.find(class_='faq-item__answer')
        if not question or not answer:
             issues.append(f"[PAGE] {rel_path} | [CATEGORY] FAQ Section | [ISSUE] Malformed FAQ item missing question or answer block")
             
    # 13. Emojis and Arrows
    # Just check body text
    body = soup.find('body')
    if body:
        text = body.get_text()
        if contains_emoji(text):
             issues.append(f"[PAGE] {rel_path} | [CATEGORY] Global: Emojis & Icons | [ISSUE] Emojis found in page text")
        if '→' in text or '←' in text or '↑' in text or '↓' in text:
             issues.append(f"[PAGE] {rel_path} | [CATEGORY] Global: Emojis & Icons | [ISSUE] Arrow characters found in page text")
             
    # 14. Asset Links
    for link in soup.find_all('link', rel='stylesheet'):
        href = link.get('href', '')
        if 'main.css' in href:
            if not href.startswith('/'):
                 issues.append(f"[PAGE] {rel_path} | [CATEGORY] Global: Asset & Link Integrity | [ISSUE] main.css link is not absolute: {href}")
                 
    return issues

base_dir = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"
all_issues = []

for filepath in glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True):
    if 'assets' in filepath:
        continue
    issues = audit_file(filepath, base_dir)
    all_issues.extend(issues)
    
with open(os.path.join(base_dir, 'audit_report.txt'), 'w', encoding='utf-8') as f:
    for issue in all_issues:
        f.write(issue + "\n")
        
print(f"Found {len(all_issues)} potential issues.")

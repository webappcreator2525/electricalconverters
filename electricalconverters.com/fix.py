import os
import glob
from bs4 import BeautifulSoup

base_dir = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"

for filepath in glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True):
    if 'assets' in filepath or 'privacy' in filepath or 'learn' in filepath:
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Replace the manual strings
    html = html.replace('<div class="page-hero">', '<div class="calc-header">')
    html = html.replace('<section class="page-hero">', '<div class="calc-header">')
    html = html.replace('<div class="page-hero-inner">', '')
    html = html.replace('<div class="page-hero__eyebrow">', '<div style="display:none">')
    html = html.replace('<p class="page-hero__sub">', '<p>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

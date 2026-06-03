"""
Fix the calc-header positioning issue across all pages.

Problem: <div class="calc-header"> sits outside <main>/<page-wrap> and renders
         flush to the top-left with no padding or max-width constraints.

Solution: Move the calc-header INSIDE <main><div class="page-wrap"> and
          remove the extra padding-top from .calc-header in CSS since page-wrap
          already provides the top padding.
"""

import os
import glob
from bs4 import BeautifulSoup

base_dir = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"

pages_fixed = 0

for filepath in glob.glob(os.path.join(base_dir, '**', 'index.html'), recursive=True):
    if 'assets' in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Only process pages that have calc-header OUTSIDE of page-wrap
    # Pattern: </div> (closes mobile-nav) then <div class="calc-header"> then <main>
    if 'class="calc-header"' not in html and "class='calc-header'" not in html:
        continue

    soup = BeautifulSoup(html, 'html.parser')

    calc_header = soup.find(class_='calc-header')
    if not calc_header:
        continue

    main_tag = soup.find('main', id='main-content')
    if not main_tag:
        continue

    page_wrap = main_tag.find(class_='page-wrap')
    if not page_wrap:
        continue

    # Check if calc-header is already inside page-wrap
    if calc_header.find_parent(class_='page-wrap'):
        print(f"  SKIP (already inside page-wrap): {filepath}")
        continue

    # Extract calc-header from its current position and put it at the top
    # of page-wrap, before any existing content
    calc_header.extract()
    page_wrap.insert(0, calc_header)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))

    pages_fixed += 1
    print(f"  FIXED: {filepath}")

print(f"\nTotal pages fixed: {pages_fixed}")

"""
Comprehensive fix script for ElectricalConverters UI audit.
Applies fixes across all 26 HTML pages.
"""

import os
import glob
import re
from bs4 import BeautifulSoup, Comment, NavigableString

base = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"

PAGES = [
    "index.html",
    "watts-to-amps/index.html",
    "kva-to-kw/index.html",
    "kwh-to-watts/index.html",
    "kva-to-amps/index.html",
    "amps-to-watts/index.html",
    "mah-to-wh/index.html",
    "kw-to-amps/index.html",
    "watts-to-volts/index.html",
    "wh-to-mah/index.html",
    "amps-to-volts/index.html",
    "watts-to-kwh/index.html",
    "va-to-watts/index.html",
    "watts-to-amps/500-watts-to-amps/index.html",
    "watts-to-amps/1000-watts-to-amps/index.html",
    "watts-to-amps/1500-watts-to-amps/index.html",
    "watts-to-amps/2000-watts-to-amps/index.html",
    "watts-to-amps/3000-watts-to-amps/index.html",
    "watts-to-amps/5000-watts-to-amps/index.html",
    "kw-to-amps/1-kw-to-amps/index.html",
    "kw-to-amps/2-kw-to-amps/index.html",
    "kw-to-amps/5-kw-to-amps/index.html",
    "kw-to-amps/10-kw-to-amps/index.html",
    "learn/watts-vs-amps/index.html",
    "learn/ohms-law/index.html",
    "privacy/index.html",
]

# Emojis to strip (these are actual content emojis, NOT the ✕ close button)
STRAY_EMOJIS = [
    '📘', '📡', '🔆', '🔀', '🔌', '⚡', '📐', '🔋', '💡', '⚙',
    '🔀', '️',  # the invisible emoji-like char from kva-to-amps
]

fixes_applied = []

def log_fix(page, fix):
    fixes_applied.append(f"  [{page}] {fix}")

for rel in PAGES:
    path = os.path.join(base, rel)
    if not os.path.exists(path):
        print(f"SKIP (not found): {path}")
        continue

    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    original = html

    # ── FIX 1: Remove Tailwind CDN script tag ──────────────────────────────
    # Tailwind's preflight CSS resets backgrounds to white, fights our theme
    if "cdn.tailwindcss.com" in html:
        html = re.sub(r'<script[^>]*cdn\.tailwindcss\.com[^>]*>\s*</script>', '', html)
        log_fix(rel, "Removed Tailwind CDN script")

    # ── FIX 2: Replace ✕ close button with plain X text ──────────────────
    # The ✕ is in the mobile nav close button. Replace with plain text &times;
    # which renders as × but is safe ASCII-compatible
    html = html.replace('>✕<', '>&times;<')
    if html != original.replace('>✕<', '>&times;<'):
        log_fix(rel, "Replaced ✕ with &times; in close button")

    # ── FIX 3: Remove stray content emojis ────────────────────────────────
    for emoji in STRAY_EMOJIS:
        if emoji in html:
            html = html.replace(emoji, '')
            log_fix(rel, f"Removed stray emoji: {repr(emoji)}")

    # ── FIX 4: Remove hidden div[style=display:none] emoji containers ─────
    # These are SEO-bait hidden divs with emojis like <div style="display:none">⚡ Power</div>
    soup = BeautifulSoup(html, 'html.parser')
    for div in soup.find_all('div', style=lambda s: s and 'display:none' in s.replace(' ','')):
        div_text = div.get_text(strip=True)
        # Remove if it's a short text with emoji (old hidden emoji SEO pattern)
        if len(div_text) < 60:
            div.decompose()
            log_fix(rel, f"Removed hidden emoji div: '{div_text[:40]}'")

    html = str(soup)

    # ── FIX 5: Fix "to " that was incorrectly replaced in links ───────────
    # The previous script replaced "→" with "to" which may have broken things
    # like "Formula used: V = W ÷ A  to  120 ÷ 0.833..." - keep those
    # Only fix nav links if they have arrow characters
    # (already handled by global arrow replacement, checking residuals)
    html = html.replace('→', ' to ')
    html = html.replace('←', 'Back to ')

    # ── FIX 6: Ensure "Enter valid values" is replaced with "—" ──────────
    html = html.replace('>Enter valid values<', '>—<')
    html = html.replace("'Enter valid values'", "'—'")
    html = html.replace('"Enter valid values"', '"—"')

    # ── FIX 7: Fix select elements missing input-field class ──────────────
    soup2 = BeautifulSoup(html, 'html.parser')
    for sel in soup2.find_all('select'):
        classes = sel.get('class', [])
        if 'input-field' not in classes:
            classes.append('input-field')
            sel['class'] = classes
            log_fix(rel, f"Added input-field class to <select id='{sel.get('id','?')}'>")
    html = str(soup2)

    # ── FIX 8: Remove any remaining inline style on faq-item ─────────────
    soup3 = BeautifulSoup(html, 'html.parser')
    for faq in soup3.find_all(class_='faq-item'):
        style = faq.get('style', '')
        if 'background' in style:
            del faq['style']
            log_fix(rel, "Removed background inline style from faq-item")
    html = str(soup3)

    # ── FIX 9: Ensure result-display__unit has no inline display:none ────
    # When JS hides/shows unit, it sets inline style. That's fine. Skip.

    # ── Write if changed ──────────────────────────────────────────────────
    if html != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"FIXED: {rel}")
    else:
        print(f"  OK:  {rel}")

print(f"\n{'='*60}")
print(f"All fixes applied. Details:")
for fix in fixes_applied:
    print(fix)

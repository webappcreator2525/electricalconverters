"""
Full audit script — scans every HTML file and logs issues.
"""
import os
import glob
import re
from bs4 import BeautifulSoup

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

EMOJIS = re.compile(r'[\U0001F300-\U0001FFFF\U00002600-\U000027BF]')
ARROWS = re.compile(r'[→←↑↓]')

issues = []

def log(page, cat, issue):
    issues.append(f"[PAGE] /{page.replace('index.html','').replace(chr(92),'/')} | [CAT] {cat} | {issue}")

for rel in PAGES:
    path = os.path.join(base, rel)
    if not os.path.exists(path):
        log(rel, "MISSING", "File not found")
        continue

    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()

    soup = BeautifulSoup(raw, "html.parser")
    page_label = "/" + rel.replace("index.html","").replace("\\","/")

    # 1. FONTS
    has_font_link = "fonts.googleapis.com/css2" in raw
    has_font_import = "@import" in raw and "fonts.googleapis.com" in raw
    if not has_font_link and not has_font_import:
        log(rel, "Typography", "Google Fonts link missing from <head>")

    # 2. GOOGLE FONTS PRECONNECT
    has_preconnect = "fonts.googleapis.com\" rel=\"preconnect\"" in raw or "fonts.googleapis.com' rel='preconnect'" in raw
    if not has_preconnect:
        log(rel, "Typography", "Missing Google Fonts preconnect links")

    # 3. main.css depth check
    depth = rel.count("/") + rel.count("\\")
    if depth >= 2:
        expected_prefix = "../../"
    elif depth == 1:
        expected_prefix = "../"
    else:
        expected_prefix = ""
    # Check if main.css path is correct
    main_css_links = [l.get("href","") for l in soup.find_all("link", rel="stylesheet")]
    correct_css = any("/assets/css/main.css" in h for h in main_css_links)
    if not correct_css:
        log(rel, "Assets", f"main.css not found with correct path. Links: {main_css_links}")

    # 4. EMOJIS in visible text
    text = soup.get_text()
    emoji_hits = EMOJIS.findall(text)
    if emoji_hits:
        log(rel, "Emojis", f"Emoji chars found: {set(emoji_hits)}")

    # 5. ARROWS in visible text  
    arrow_hits = ARROWS.findall(text)
    if arrow_hits:
        log(rel, "Arrows", f"Arrow chars found in visible text: {set(arrow_hits)}")

    # 6. Check for white/light backgrounds (inline or style tags)
    style_tags = soup.find_all("style")
    for st in style_tags:
        sc = st.string or ""
        if "background: white" in sc or "background:#fff" in sc.replace(" ","") or "background-color: white" in sc or "background-color:#fff" in sc.replace(" ",""):
            log(rel, "Theme", "Inline <style> block contains white/light background")

    # 7. Tailwind CDN (should be removed eventually, but check if it's overriding)
    has_tailwind = "cdn.tailwindcss.com" in raw
    if has_tailwind:
        log(rel, "Assets", "Tailwind CDN loaded — may override custom styles")

    # 8. Check nav structure
    nav = soup.find("nav", class_="site-nav")
    if not nav:
        log(rel, "Header", "site-nav not found")
    else:
        # Check for arrow characters in nav
        nav_text = nav.get_text()
        if ARROWS.search(nav_text):
            log(rel, "Header", "Arrow character found in nav text")

    # 9. header class
    header = soup.find("header")
    if not header or "site-header" not in header.get("class", []):
        log(rel, "Header", "Missing site-header class on <header>")

    # 10. hamburger
    nav_toggle = soup.find(class_="nav-toggle")
    if not nav_toggle:
        log(rel, "Header", "nav-toggle (hamburger) button missing")

    # 11. footer
    footer = soup.find("footer")
    if not footer:
        log(rel, "Footer", "No <footer> tag found")
    else:
        footer_text = footer.get_text()
        if EMOJIS.search(footer_text):
            log(rel, "Footer", "Emoji in footer text")
        if ARROWS.search(footer_text):
            log(rel, "Footer", "Arrow char in footer")

    # 12. h1 check
    h1 = soup.find("h1")
    if not h1:
        log(rel, "Typography", "No <h1> found on page")

    # 13. Input field dark theme (check for any inline style="background:white")
    for inp in soup.find_all("input"):
        style = inp.get("style","")
        if "white" in style or "#fff" in style.replace(" ","").lower():
            log(rel, "Inputs", f"Input field has light background inline style: {style}")

    # 14. Select dropdowns
    for sel in soup.find_all("select"):
        cls = sel.get("class", [])
        if "input-field" not in cls:
            log(rel, "Inputs", f"Select element missing input-field class (class={cls})")

    # 15. Enter valid values check
    if "Enter valid values" in raw:
        log(rel, "Result", "Found 'Enter valid values' string — should be '—'")

    # 16. Icon fonts
    for link in soup.find_all("link"):
        href = link.get("href","")
        if any(x in href for x in ["fontawesome","heroicons","lucide","material-icons"]):
            log(rel, "Icons", f"Icon font CDN detected: {href}")

    # 17. FAQ check - old card style (should not have box/card style)
    faq_items = soup.find_all(class_="faq-item")
    for faq in faq_items:
        style = faq.get("style","")
        if "background" in style:
            log(rel, "FAQ", f"faq-item has inline background style (should use left border only)")

    # 18. Result display classes
    result_boxes = soup.find_all(class_="result-display")
    for rb in result_boxes:
        style = rb.get("style","")
        if "background: white" in style.lower() or "background:#fff" in style.replace(" ","").lower():
            log(rel, "Result", "Result display has white background inline style")

    # 19. Check for "to " arrows that were replaced with "to " (double-check)
    nav_links = soup.select(".nav-link")
    for nl in nav_links:
        txt = nl.get_text(strip=True)
        if "→" in txt or "←" in txt:
            log(rel, "Header", f"Arrow in nav link text: '{txt}'")

print(f"\n{'='*70}")
print(f"AUDIT COMPLETE — {len(issues)} issues found")
print(f"{'='*70}\n")
for i in issues:
    print(i)

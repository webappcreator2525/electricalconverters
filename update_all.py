import os
import glob
from bs4 import BeautifulSoup

def update_file(filepath):
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # 1. Strip emojis and SVG chevrons from text first
    html = html.replace('⚡', '').replace('🔌', '').replace('🔋', '').replace('💡', '')
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # 2. Update Fonts
    for link in soup.find_all('link', href=True):
        if 'fonts.googleapis.com/css2' in link['href']:
            link['href'] = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"

    # 3. Update Header
    new_header_html = """
<header class="site-header" role="banner">
  <div class="site-header__inner">
    <a href="/" class="site-logo" aria-label="ElectricalConverters — home">
      ElectricalConverters
    </a>
    <nav class="site-nav" aria-label="Tool navigation">
      <a href="/watts-to-amps/">W→A</a>
      <a href="/kw-to-amps/">kW→A</a>
      <a href="/amps-to-watts/">A→W</a>
      <a href="/watts-to-volts/">W→V</a>
      <a href="/amps-to-volts/">A→V</a>
      <a href="/kva-to-kw/">kVA→kW</a>
      <a href="/kva-to-amps/">kVA→A</a>
      <a href="/va-to-watts/">VA→W</a>
      <a href="/kwh-to-watts/">kWh→W</a>
      <a href="/watts-to-kwh/">W→kWh</a>
      <a href="/mah-to-wh/">mAh→Wh</a>
      <a href="/wh-to-mah/">Wh→mAh</a>
    </nav>
  </div>
</header>
"""
    # Remove old header and mobile nav
    old_header = soup.find('header', class_='site-header')
    mobile_nav = soup.find('nav', id='nav-drawer')
    if old_header:
        # Create new header node
        new_header_soup = BeautifulSoup(new_header_html, 'html.parser')
        old_header.replace_with(new_header_soup)
    if mobile_nav:
        mobile_nav.decompose()

    # 4. Update Footer
    new_footer_html = """
<footer role="contentinfo" class="site-footer">
  <div class="site-footer__inner">
    <p><span id="footer-year"></span> ElectricalConverters</p>
    <p>All calculations are for reference only. Consult a licensed electrician for safety-critical decisions.</p>
    <a href="/privacy/">Privacy Policy</a>
  </div>
</footer>
"""
    old_footer = soup.find('footer')
    if old_footer:
        new_footer_soup = BeautifulSoup(new_footer_html, 'html.parser')
        old_footer.replace_with(new_footer_soup)

    # 5. Fix Inputs
    for input_el in soup.find_all(['input', 'select']):
        classes = input_el.get('class', [])
        if 'input-field' not in classes:
            classes.append('input-field')
        input_el['class'] = classes
        
    # 6. Fix Result Display
    for res in soup.find_all(class_='result-display'):
        res['class'] = ['result-display'] # reset classes to just this, js toggles 'invalid'
        
    for res_val in soup.find_all(id='result-value'):
        classes = res_val.get('class', [])
        if 'result-display__value' not in classes:
            classes.append('result-display__value')
        res_val['class'] = classes
        
    # 7. Remove SVGs (like chevrons)
    for svg in soup.find_all('svg'):
        svg.decompose()

    # 8. Update Calc Header
    hero = soup.find('section', class_='page-hero')
    if hero:
        hero['class'] = ['calc-header']
        if hero.find('div', class_='page-hero-inner'):
            hero.find('div', class_='page-hero-inner').unwrap()
        for p in hero.find_all('p', class_='page-hero__eyebrow'):
            p.decompose()

    # 9. Update inline styles (remove them)
    for style in soup.find_all('style'):
        style.decompose()

    # Write out
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Updated {filepath}")

# Process all index.html in subdirectories except assets, learn, privacy
skip_dirs = ['assets', 'learn', 'privacy']
base_dir = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"

for root, dirs, files in os.walk(base_dir):
    parts = root.split(os.sep)
    if any(s in parts for s in skip_dirs):
        continue
    
    # Check if index.html is here
    for file in files:
        if file == 'index.html':
            filepath = os.path.join(root, file)
            # Skip the ones we already did
            if 'watts-to-amps' in filepath or 'kva-to-kw' in filepath or root == base_dir:
                continue
            update_file(filepath)

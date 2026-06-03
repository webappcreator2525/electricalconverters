import os
import glob
import re
from bs4 import BeautifulSoup

base_dir = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com"

new_css = """/* ============================================================
   4. NAVIGATION
   ============================================================ */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #0f1117;
  border-bottom: 1px solid #2e3350;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

/* ── LOGO ── */
.site-logo {
  font-family: 'DM Mono', monospace;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e2e8f0;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.site-logo:hover {
  color: #ffffff;
}

/* ── DESKTOP NAV ── */
.site-nav {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.site-nav::-webkit-scrollbar {
  display: none;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
}

.nav-link {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  transition: color 0.15s ease, background-color 0.15s ease;
  display: block;
}

.nav-link:hover {
  color: #e2e8f0;
  background-color: #1a1d27;
}

.nav-link.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.08);
}

/* ── HAMBURGER BUTTON (mobile only) ── */
.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 6px;
  background: transparent;
  border: 1px solid #2e3350;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: auto;
}

.nav-toggle-bar {
  display: block;
  width: 18px;
  height: 1.5px;
  background-color: #64748b;
  transition: background-color 0.15s ease;
}

.nav-toggle:hover .nav-toggle-bar {
  background-color: #e2e8f0;
}

/* ── MOBILE NAV OVERLAY ── */
.mobile-nav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 200;
  background-color: rgba(15, 17, 23, 0.97);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mobile-nav-overlay.is-open {
  display: block;
  opacity: 1;
}

.mobile-nav-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #2e3350;
  margin-bottom: 1.5rem;
}

.nav-close {
  background: transparent;
  border: 1px solid #2e3350;
  border-radius: 6px;
  color: #64748b;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.nav-close:hover {
  color: #e2e8f0;
  border-color: #64748b;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav-list .nav-link {
  font-size: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #64748b;
}

.mobile-nav-list .nav-link:hover,
.mobile-nav-list .nav-link.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.08);
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .site-nav {
    display: none;
  }

  .nav-toggle {
    display: flex;
  }
}

"""

new_html = """
<header class="site-header">
  <div class="header-inner">
    <a href="/" class="site-logo">ElectricalConverters</a>
    <nav class="site-nav" aria-label="Main navigation">
      <ul class="nav-list">
        <li><a href="/watts-to-amps/" class="nav-link">W to A</a></li>
        <li><a href="/kw-to-amps/" class="nav-link">kW to A</a></li>
        <li><a href="/amps-to-watts/" class="nav-link">A to W</a></li>
        <li><a href="/watts-to-volts/" class="nav-link">W to V</a></li>
        <li><a href="/amps-to-volts/" class="nav-link">A to V</a></li>
        <li><a href="/kva-to-kw/" class="nav-link">kVA to kW</a></li>
        <li><a href="/kva-to-amps/" class="nav-link">kVA to A</a></li>
        <li><a href="/va-to-watts/" class="nav-link">VA to W</a></li>
        <li><a href="/kwh-to-watts/" class="nav-link">kWh to W</a></li>
        <li><a href="/watts-to-kwh/" class="nav-link">W to kWh</a></li>
        <li><a href="/mah-to-wh/" class="nav-link">mAh to Wh</a></li>
        <li><a href="/wh-to-mah/" class="nav-link">Wh to mAh</a></li>
      </ul>
    </nav>
    <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
  </div>
</header>

<div class="mobile-nav-overlay" id="mobile-nav" aria-hidden="true">
  <div class="mobile-nav-inner">
    <div class="mobile-nav-header">
      <span class="site-logo">ElectricalConverters</span>
      <button class="nav-close" aria-label="Close navigation">&#x2715;</button>
    </div>
    <ul class="mobile-nav-list">
        <li><a href="/watts-to-amps/" class="nav-link">W to A</a></li>
        <li><a href="/kw-to-amps/" class="nav-link">kW to A</a></li>
        <li><a href="/amps-to-watts/" class="nav-link">A to W</a></li>
        <li><a href="/watts-to-volts/" class="nav-link">W to V</a></li>
        <li><a href="/amps-to-volts/" class="nav-link">A to V</a></li>
        <li><a href="/kva-to-kw/" class="nav-link">kVA to kW</a></li>
        <li><a href="/kva-to-amps/" class="nav-link">kVA to A</a></li>
        <li><a href="/va-to-watts/" class="nav-link">VA to W</a></li>
        <li><a href="/kwh-to-watts/" class="nav-link">kWh to W</a></li>
        <li><a href="/watts-to-kwh/" class="nav-link">W to kWh</a></li>
        <li><a href="/mah-to-wh/" class="nav-link">mAh to Wh</a></li>
        <li><a href="/wh-to-mah/" class="nav-link">Wh to mAh</a></li>
    </ul>
  </div>
</div>
"""

new_js = """
<script>
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
const navClose = document.querySelector('.nav-close');

function openNav() {
  if (!mobileNav) return;
  mobileNav.classList.add('is-open');
  mobileNav.removeAttribute('aria-hidden');
  if(navToggle) navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove('is-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  if(navToggle) navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (navToggle) navToggle.addEventListener('click', openNav);
if (navClose) navClose.addEventListener('click', closeNav);

if (mobileNav) {
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeNav();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

// Mark active nav link based on current URL
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === window.location.pathname) {
    link.classList.add('active');
  }
});
</script>
"""

# Update CSS
css_path = os.path.join(base_dir, "assets", "css", "main.css")
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

start_idx = css_content.find("/* ============================================================\n   4. NAVIGATION")
end_idx = css_content.find("/* ============================================================\n   5. LAYOUT & SPACING")

if start_idx != -1 and end_idx != -1:
    css_content = css_content[:start_idx] + new_css + css_content[end_idx:]
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(css_content)
    print("Updated main.css")
else:
    print("Could not find CSS sections!")

# Update HTML files
for filepath in glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
    
    soup = BeautifulSoup(html, "html.parser")
    
    # Replace header
    old_header = soup.find("header", class_="site-header")
    if old_header:
        # We need to insert both header and mobile nav overlay
        new_header_soup = BeautifulSoup(new_html, "html.parser")
        old_header.replace_with(new_header_soup)
    
    # Also remove any existing mobile navs if they somehow exist from a previous iteration
    old_mobile = soup.find("nav", id="nav-drawer")
    if old_mobile:
        old_mobile.decompose()
        
    # Inject JS script before </body>
    if soup.body:
        js_soup = BeautifulSoup(new_js, "html.parser")
        soup.body.append(js_soup)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"Updated {filepath}")

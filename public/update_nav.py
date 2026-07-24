import os
import glob

html_files = glob.glob('**/*.html', recursive=True)

old_nav_safety = '''<li class="nav-group">
<button aria-controls="menu-safety" aria-expanded="false" class="nav-trigger" id="trigger-safety" type="button">Wiring &amp; Safety Sizing <span aria-hidden="true" class="nav-caret"></span></button>
<div class="nav-panel" id="menu-safety">
<p class="nav-panel__note">Wire gauge, breaker size and voltage drop are coming soon. Start by <a href="/watts-to-amps/">finding amps with watts to amps</a>.</p>
</div>
</li>'''

new_nav_safety = '''<li class="nav-group">
<button aria-controls="menu-safety" aria-expanded="false" class="nav-trigger" id="trigger-safety" type="button">Wiring &amp; Safety Sizing <span aria-hidden="true" class="nav-caret"></span></button>
<div class="nav-panel" id="menu-safety">
<a class="nav-panel__link" href="/circuit-breaker-size-calculator/">Circuit Breaker Size</a>
<a class="nav-panel__link" href="/12v-wire-size-calculator/">12V Wire Size</a>
<a class="nav-panel__link" href="/trolling-motor-wire-size-calculator/">Trolling Motor Wire Size</a>
</div>
</li>'''

old_nav_battery = '''<a class="nav-panel__link" href="/mah-to-ah/">mAh to Ah</a>
</div>
</li>'''
new_nav_battery = '''<a class="nav-panel__link" href="/mah-to-ah/">mAh to Ah</a>
<a class="nav-panel__link" href="/ah-to-kwh-calculator/">Ah to kWh</a>
</div>
</li>'''

old_nav_power = '''<a class="nav-panel__link" href="/volts-to-watts/">Volts to Watts</a>
<div class="nav-panel__sub">Guides</div>'''
new_nav_power = '''<a class="nav-panel__link" href="/volts-to-watts/">Volts to Watts</a>
<a class="nav-panel__link" href="/led-resistor-calculator/">LED Resistor</a>
<div class="nav-panel__sub">Guides</div>'''

old_m_safety = '''<li class="m-group">
<div class="m-group__label">Wiring &amp; Safety Sizing</div>
<p class="m-note">Wire gauge, breaker size and voltage drop are coming soon. Start by <a href="/watts-to-amps/">finding amps with watts to amps</a>.</p>
</li>'''
new_m_safety = '''<li class="m-group">
<div class="m-group__label">Wiring &amp; Safety Sizing</div>
<a class="nav-link" href="/circuit-breaker-size-calculator/">Circuit Breaker Size</a>
<a class="nav-link" href="/12v-wire-size-calculator/">12V Wire Size</a>
<a class="nav-link" href="/trolling-motor-wire-size-calculator/">Trolling Motor Wire Size</a>
</li>'''

old_m_battery = '''<a class="nav-link" href="/mah-to-ah/">mAh to Ah</a>
</li>'''
new_m_battery = '''<a class="nav-link" href="/mah-to-ah/">mAh to Ah</a>
<a class="nav-link" href="/ah-to-kwh-calculator/">Ah to kWh</a>
</li>'''

old_m_power = '''<a class="nav-link" href="/volts-to-watts/">Volts to Watts</a>
</li>'''
new_m_power = '''<a class="nav-link" href="/volts-to-watts/">Volts to Watts</a>
<a class="nav-link" href="/led-resistor-calculator/">LED Resistor</a>
</li>'''

count = 0
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    content = content.replace(old_nav_safety, new_nav_safety)
    content = content.replace(old_nav_battery, new_nav_battery)
    content = content.replace(old_nav_power, new_nav_power)
    
    content = content.replace(old_m_safety, new_m_safety)
    content = content.replace(old_m_battery, new_m_battery)
    content = content.replace(old_m_power, new_m_power)
    
    if content.count('<a class="nav-panel__link" href="/ah-to-kwh-calculator/">Ah to kWh</a>') > 1:
        continue

    if content != orig:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        count += 1

print(f"Updated {count} HTML files.")

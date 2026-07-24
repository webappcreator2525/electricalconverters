import os
import glob

html_files = glob.glob('**/*.html', recursive=True)

old_power = '''<a href="/volts-to-watts/">Volts to Watts</a>
</nav>'''
new_power = '''<a href="/volts-to-watts/">Volts to Watts</a>
<a href="/led-resistor-calculator/">LED Resistor Calculator</a>
</nav>'''

old_battery = '''<a href="/mah-to-ah/">mAh to Ah</a>
</nav>
<nav class="footer-col" aria-label="Site information">'''
new_battery = '''<a href="/mah-to-ah/">mAh to Ah</a>
<a href="/ah-to-kwh-calculator/">Ah to kWh Calculator</a>
</nav>
<nav class="footer-col" aria-label="Wire and load sizing calculators">
<div class="footer-col__label">Wire &amp; Load Sizing</div>
<a href="/12v-wire-size-calculator/">12V Wire Size Calculator</a>
<a href="/circuit-breaker-size-calculator/">Circuit Breaker Size Calculator</a>
<a href="/trolling-motor-wire-size-calculator/">Trolling Motor Wire Size Calculator</a>
</nav>
<nav class="footer-col" aria-label="Site information">'''

count = 0
for filepath in html_files:
    if "index.html" in filepath and filepath == "index.html":
        # we already updated public/index.html's footer in the previous step
        # but let's just let it run if it's not already updated. 
        pass
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    content = content.replace(old_power, new_power)
    content = content.replace(old_battery, new_battery)
    
    # Avoid duplicating
    if content.count('<a href="/led-resistor-calculator/">LED Resistor Calculator</a>') > 1:
        continue

    if content != orig:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        count += 1

print(f"Updated footer in {count} HTML files.")

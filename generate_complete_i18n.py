# -*- coding: utf-8 -*-
import re
import html

# Load all 3 files
files = ['index.html', 'gallery.html', 'blog.html']
all_text = set()

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove script & style
    content = re.sub(r'<script[\s\S]*?</script>', '', content)
    content = re.sub(r'<style[\s\S]*?</style>', '', content)
    
    # Find all text between tags
    nodes = re.findall(r'>([^<]+)<', content)
    for n in nodes:
        raw = n.strip()
        unescaped = html.unescape(raw)
        if re.search(r'[\u10A0-\u10FF]', unescaped) and len(unescaped) > 1:
            all_text.add(raw)
            all_text.add(unescaped)

print(f"Total distinct phrases to translate: {len(all_text)}")

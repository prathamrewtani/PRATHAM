import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

categories = content.split('<div class="category"')

# categories[1] is Retention, categories[2] is Fashion, categories[3] is Transitions, categories[4] is Story
for i in range(2, len(categories)):
    # Remove data-view-text attributes
    categories[i] = re.sub(r'\s*data-view-text="[^"]*"', '', categories[i])
    
    # Remove the dynamic-video-text div completely
    categories[i] = re.sub(r'\s*<div class="dynamic-video-text">[^<]*</div>', '', categories[i])

content = '<div class="category"'.join(categories)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

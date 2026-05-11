import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

ordinals = ["Video 1", "Video 2", "Video 3", "Video 4", "Video 5"]

categories = content.split('<div class="category"')
for i in range(1, len(categories)):
    videos = re.findall(r'<video\s+[^>]*>', categories[i])
    for j, video in enumerate(videos):
        if j < 5:
            new_text = ordinals[j]
            new_video = re.sub(r'data-view-text="[^"]*"', f'data-view-text="{new_text}"', video)
            categories[i] = categories[i].replace(video, new_video, 1)
            
    match = re.search(r'<div class="dynamic-video-text">([^<]+)</div>', categories[i])
    if match:
        old_text = match.group(0)
        new_text_div = f'<div class="dynamic-video-text">Video 1</div>'
        categories[i] = categories[i].replace(old_text, new_text_div, 1)

content = '<div class="category"'.join(categories)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

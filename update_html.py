import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

ordinals = ["1st Video", "2nd Video", "3rd Video", "4th Video", "5th Video"]

categories = content.split('<div class="category"')
for i in range(1, len(categories)):
    # Find all videos with data-view-text
    # We will replace data-view-text="..." with the new text
    
    videos = re.findall(r'<video\s+[^>]*>', categories[i])
    for j, video in enumerate(videos):
        if j < 5:
            new_text = ordinals[j]
            # Replace existing data-view-text
            new_video = re.sub(r'data-view-text="[^"]*"', f'data-view-text="{new_text}"', video)
            categories[i] = categories[i].replace(video, new_video, 1)
            
    # Also update the default text in <div class="dynamic-video-text">
    # It currently says Video 1 - 100K Views or something
    match = re.search(r'<div class="dynamic-video-text">([^<]+)</div>', categories[i])
    if match:
        old_text = match.group(0)
        new_text_div = f'<div class="dynamic-video-text">1st Video</div>'
        categories[i] = categories[i].replace(old_text, new_text_div, 1)

content = '<div class="category"'.join(categories)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

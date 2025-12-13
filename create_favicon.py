#!/usr/bin/env python3
"""
Create favicon.ico from home emoji
Requires: Pillow (pip install Pillow)
"""
try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    # Create a 32x32 image with green background
    size = 32
    img = Image.new('RGB', (size, size), color='#16a34a')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font that supports emoji, fallback to default
    try:
        # Try system fonts that support emoji
        font_size = 24
        font = ImageFont.truetype('arial.ttf', font_size)
    except:
        try:
            font = ImageFont.truetype('C:/Windows/Fonts/seguiemj.ttf', font_size)
        except:
            font = ImageFont.load_default()
    
    # Draw home emoji
    text = '🏡'
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2 - 2)
    draw.text(position, text, fill='white', font=font)
    
    # Save as ICO with multiple sizes
    img.save('assets/favicon.ico', format='ICO', sizes=[(16,16), (32,32)])
    print("✅ Created assets/favicon.ico successfully!")
    
except ImportError:
    print("❌ Pillow not installed. Install with: pip install Pillow")
    print("Creating placeholder SVG instead...")
    # Fallback: create SVG
    with open('assets/favicon.svg', 'w') as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#16a34a"/><text x="16" y="24" font-size="20" text-anchor="middle" fill="white">🏡</text></svg>')
    print("✅ Created assets/favicon.svg as fallback")


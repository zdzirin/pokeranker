
from PIL import Image

try:
    img = Image.open('static/pokemon/10186.png')
    img.load()  # Force loading of image data
    print("Image opened successfully!")
except Exception as e:
    print(f"Error opening image: {e}")

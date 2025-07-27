
import cv2
import os

file_path = 'static/pokemon/10186.png'

if not os.path.exists(file_path):
    print(f"File not found at: {file_path}")
else:
    try:
        img = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
        if img is not None:
            print("Image opened successfully with OpenCV!")
            print(f"Image shape: {img.shape}")
        else:
            print("Error: cv2.imread returned None. The file may be corrupted or in an unsupported format.")
    except Exception as e:
        print(f"An exception occurred: {e}")

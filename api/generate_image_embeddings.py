import json
import cv2
import numpy as np
import torch
from transformers import AutoImageProcessor, AutoModel

# -- Image Vectorization --
# 1. Switched to DINOv2 model for better feature extraction
model_name = "facebook/dinov2-base"
image_processor = AutoImageProcessor.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def image_vector(pokemon):
    id = pokemon['id']
    path = f"static/pokemon/{id}.png"
    try:
        print(f"Processing image for pokemon {pokemon['name']}")
        
        # 2. Open image with OpenCV and handle transparency
        img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        if img.shape[2] == 4:
            # Separate the alpha channel
            alpha_channel = img[:, :, 3]
            rgb_channels = img[:, :, :3]

            # Create a white background
            white_background = np.ones_like(rgb_channels, dtype=np.uint8) * 255
            
            # Blend the image and the background
            alpha_factor = alpha_channel[:, :, np.newaxis].astype(np.float32) / 255.0
            img = (1 - alpha_factor) * white_background + alpha_factor * rgb_channels
            img = img.astype(np.uint8)

        # Convert from BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        inputs = image_processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            
        # 3. Use the embedding of the [CLS] token for a global representation
        embedding = outputs.last_hidden_state[:, 0, :].squeeze()
        return embedding.tolist()
        
    except FileNotFoundError:
        print(f"Image not found for pokemon {id}: {path}")
        # The embedding size for DINOv2-Base is 768
        return [0] * 768 
    except Exception as e:
        print(f"Could not process image for pokemon {id}: {e}")
        return [0] * 768


def get_image_vectors(pokemon_data):
    return [{"name": pokemon['name'], "vector": image_vector(pokemon)} for pokemon in pokemon_data]

print("Loading pokemon data...")
with open('filtered_pokemon.json', 'r') as f:
    pokemon_data = json.load(f)

print("Generating and saving pokemon vectors with DINOv2...")
pokemon_vectors = get_image_vectors(pokemon_data)
with open('pokemon_image_vectors.json', 'w') as f:
    json.dump(pokemon_vectors, f)

print("Done!")
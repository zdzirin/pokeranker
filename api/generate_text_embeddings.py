import json
import torch
from transformers import AutoTokenizer, AutoModel

# -- Text Vectorization --
# Using BERT model for text embedding generation
model_name = "sentence-transformers/all-MiniLM-L6-v2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def text_vector(pokemon):
    genus = pokemon.get('genus', '')
    try:
        print(f"Processing genus for pokemon {pokemon['name']}: {genus}")
        
        # Tokenize the genus text
        inputs = tokenizer(genus, return_tensors="pt", padding=True, truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
            
        # Use mean pooling of token embeddings for sentence representation
        embedding = outputs.last_hidden_state.mean(dim=1).squeeze()
        return embedding.tolist()
        
    except Exception as e:
        print(f"Could not process genus for pokemon {pokemon['name']}: {e}")
        # The embedding size for all-MiniLM-L6-v2 is 384
        return [0] * 384


def get_text_vectors(pokemon_data):
    return [{
        "name": pokemon['name'], 
        "genus": pokemon.get('genus', ''),
        "vector": text_vector(pokemon)
    } for pokemon in pokemon_data]

print("Loading pokemon data...")
with open('filtered_pokemon.json', 'r') as f:
    pokemon_data = json.load(f)

print("Generating and saving pokemon genus vectors...")
pokemon_text_vectors = get_text_vectors(pokemon_data)
with open('pokemon_text_vectors.json', 'w') as f:
    json.dump(pokemon_text_vectors, f)

print("Done!")
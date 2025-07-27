import os
import fastapi
import faiss
import json
import numpy as np
from pydantic import BaseModel
from typing import Literal
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


from modules.vectorize_pokemon import (
    pokedex_vector,
    size_vector,
    types_vector,
    egg_groups_vector,
    color_vector,
    habitat_vector,
    shape_vector,
    evolution_chain_vector,
    booleans_vector,
    stats_vector,
)
from modules.constants import types, egg_groups, colors, habitats, shapes

# --- pokemon data --- #
with open('filtered_pokemon.json', 'r') as f:
    pokemon_data = json.load(f)
    f.close()

# --- Generate attribute vectors --- #
pokemon_vectors_generated = {}
for p in pokemon_data:
    pokemon_vectors_generated[p['name']] = {
        "pokedex": pokedex_vector(p),
        "size": size_vector(p),
        "types": types_vector(p),
        "egg_groups": egg_groups_vector(p),
        "color": color_vector(p),
        "habitat": habitat_vector(p),
        "shape": shape_vector(p),
        "evolution_chain": evolution_chain_vector(p),
        "booleans": booleans_vector(p),
        "stats": stats_vector(p),
    }

# --- Load image vectors --- #
with open('pokemon_image_vectors.json', 'r') as f:
    pokemon_image_vectors = json.load(f)
    f.close()

with open('pokemon_text_vectors.json', 'r') as f:
    pokemon_text_vectors = json.load(f)
    f.close()

image_vector_map = {p['name']: p['vector'] for p in pokemon_image_vectors}
text_vector_map = {p['name']: p['vector'] for p in pokemon_text_vectors}

names = [p["name"] for p in pokemon_image_vectors]
name_to_index = {p["name"]: i for i, p in enumerate(pokemon_image_vectors)}

# --- Legacy image-only index --- #
vectors = np.array([p["vector"] for p in pokemon_image_vectors]).astype('float32')
dim = vectors.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(vectors)

index_ip = faiss.IndexFlatIP(dim)
faiss.normalize_L2(vectors)
index_ip.add(vectors)

def query_pokemon(pokemon, k=10):
    query_vector = np.array([image_vector_map[pokemon]]).astype('float32')
    D, I = index.search(query_vector, k=k)
    similar_pokemon = [{"name": names[idx], "similarity": float(dist)} for idx, dist in zip(I[0], D[0])]
    return similar_pokemon

def query_pokemon_ip(pokemon, k=10):
    query_vector = np.array([image_vector_map[pokemon]]).astype('float32')
    faiss.normalize_L2(query_vector)
    D, I = index_ip.search(query_vector, k=k)
    similar_pokemon = [{"name": names[idx], "similarity": float(dist)} for idx, dist in zip(I[0], D[0])]
    return similar_pokemon

# --- Constants --- #
DEFAULT_VECTOR_STRENGTHS = {
    "image": 0.2,
    "text": 0.25,
    "pokedex": 1.5,
    "size": 1.0,
    "types": 1.5,
    "egg_groups": 1.0,
    "color": 1.0,
    "habitat": 1.0,
    "shape": 1.0,
    "evolution_chain": 1.5,
    "booleans": 1.0,
    "stats": 1.0,
}

print("initializing api")
# --- fastapi app --- #
app = fastapi.FastAPI()
print("api initialized")

app.mount("/sprites", StaticFiles(directory="static/"), name="sprites")

class SimilarPokemonQuery(BaseModel):
    pokemon: str
    k: int = 10

class CombinedSimilarPokemonQuery(BaseModel):
    pokemon: str
    k: int = 10
    algorithm: Literal['euclidean', 'cosine'] = 'euclidean'
    image_strength: float = DEFAULT_VECTOR_STRENGTHS["image"]
    pokedex_strength: float = DEFAULT_VECTOR_STRENGTHS["pokedex"]
    size_strength: float = DEFAULT_VECTOR_STRENGTHS["size"]
    types_strength: float = DEFAULT_VECTOR_STRENGTHS["types"]
    egg_groups_strength: float = DEFAULT_VECTOR_STRENGTHS["egg_groups"]
    color_strength: float = DEFAULT_VECTOR_STRENGTHS["color"]
    habitat_strength: float = DEFAULT_VECTOR_STRENGTHS["habitat"]
    shape_strength: float = DEFAULT_VECTOR_STRENGTHS["shape"]
    evolution_chain_strength: float = DEFAULT_VECTOR_STRENGTHS["evolution_chain"]
    booleans_strength: float = DEFAULT_VECTOR_STRENGTHS["booleans"]
    stats_strength: float = DEFAULT_VECTOR_STRENGTHS["stats"]
    text_strength: float = DEFAULT_VECTOR_STRENGTHS["text"]

@app.post("/find_similar/combined")
def find_similar_pokemon_combined(req: CombinedSimilarPokemonQuery):
    query_pokemon_name = req.pokemon.lower()

    strengths = {
        "image": req.image_strength,
        "pokedex": req.pokedex_strength,
        "size": req.size_strength,
        "types": req.types_strength,
        "egg_groups": req.egg_groups_strength,
        "color": req.color_strength,
        "habitat": req.habitat_strength,
        "shape": req.shape_strength,
        "evolution_chain": req.evolution_chain_strength,
        "booleans": req.booleans_strength,
        "stats": req.stats_strength,
        "text": req.text_strength,
    }

    combined_vectors = []
    pokemon_names_in_order = []

    # Use the order from 'names' to ensure consistency
    for p_name in names:
        if p_name not in pokemon_vectors_generated or p_name not in image_vector_map or p_name not in text_vector_map:
            continue

        final_vector_parts = []
        if strengths["image"] > 0:
            final_vector_parts.append(np.array(image_vector_map[p_name], dtype='float32') * strengths["image"])

        if strengths["text"] > 0:
            final_vector_parts.append(np.array(text_vector_map[p_name], dtype='float32') * strengths["text"])

        generated_vecs = pokemon_vectors_generated[p_name]
        for vec_type in ["pokedex", "size", "types", "egg_groups", "color", "habitat", "shape", "evolution_chain", "booleans", "stats"]:
            if strengths[vec_type] > 0:
                final_vector_parts.append(np.array(generated_vecs[vec_type], dtype='float32') * strengths[vec_type])

        if not final_vector_parts:
            continue

        combined_vectors.append(np.concatenate(final_vector_parts))
        pokemon_names_in_order.append(p_name)

    if not combined_vectors:
        return {"error": "No vectors to compare. Ensure at least one strength is > 0."}

    vectors_np = np.array(combined_vectors).astype('float32')
    dim = vectors_np.shape[1]

    # Note: Rebuilding the index on every request can be slow.
    if req.algorithm == 'cosine':
        index_combined = faiss.IndexFlatIP(dim)
        faiss.normalize_L2(vectors_np)
    else: # euclidean
        index_combined = faiss.IndexFlatL2(dim)

    index_combined.add(vectors_np)

    try:
        query_pokemon_internal_index = pokemon_names_in_order.index(query_pokemon_name)
    except ValueError:
        return {"error": f"Pokemon '{query_pokemon_name}' not found in the combined vector set."}

    query_vector = np.array([vectors_np[query_pokemon_internal_index]]).astype('float32')

    if req.algorithm == 'cosine':
        faiss.normalize_L2(query_vector)

    D, I = index_combined.search(query_vector, k=req.k)
    similar_pokemon = [{"name": pokemon_names_in_order[idx], "similarity": float(dist)} for idx, dist in zip(I[0], D[0])]

    return similar_pokemon


@app.post("/find_similar")
def find_similar_pokemon(req: SimilarPokemonQuery):
    query = req.pokemon.lower();
    return query_pokemon(query, k=req.k)

@app.post("/find_similar_ip")
def find_similar_pokemon_ip(req: SimilarPokemonQuery):
    query = req.pokemon.lower();
    return query_pokemon_ip(query, k=req.k)

@app.get("/pokemon")
def get_all_pokemon():
    return pokemon_data

@app.get("/constants")
def get_constants():
    return {
        "types": types,
        "egg_groups": egg_groups,
        "colors": colors,
        "habitats": habitats,
        "shapes": shapes,
    }

@app.get("/vectors/strengths")
def get_vector_strengths():
    return DEFAULT_VECTOR_STRENGTHS

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")


# --- serve frontend --- #
@app.get("/{catch_all:path}")
async def serve_react_app(catch_all: str):
    path = f"static/{catch_all}"
    if catch_all and os.path.exists(path):
        return FileResponse(path)
    return FileResponse("static/index.html")

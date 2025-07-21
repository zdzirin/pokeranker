import fastapi
import faiss
import json
import numpy as np
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from modules.vectorize_pokemon import get_all_vectors
from modules.constants import types, egg_groups, colors, habitats, shapes

# --- pokemon data --- #
with open('pokemon.json', 'r') as f:
    pokemon_data = json.load(f)
    pokemon_vectors = get_all_vectors(pokemon_data);
    f.close()

names = [p["name"] for p in pokemon_vectors]
name_to_index = {p["name"]: i for i, p in enumerate(pokemon_vectors)}

# --- basic index --- #
vectors = np.array([p["vector"] for p in pokemon_vectors]).astype('float32')
dim = vectors.shape[1]
index = faiss.IndexFlatL2(dim)  # L2 = Euclidean distance. Use IndexFlatIP for cosine
index.add(vectors)

def query_pokemon(pokemon):
    pokemon_index = name_to_index[pokemon]
    query_vector = np.array([pokemon_vectors[pokemon_index]["vector"]]).astype('float32')  # bulbasaur
    D, I = index.search(query_vector, k=25)  # find 25 most similar
    similar_pokemon = [{"name": names[idx], "similarity": float(dist)} for idx, dist in zip(I[0], D[0])]
    return similar_pokemon

print("initializing api")
# --- fastapi app --- #
app = fastapi.FastAPI()
print("api initialized")

app.mount("/sprites", StaticFiles(directory="static/"), name="sprites")

class SimilarPokemonQuery(BaseModel):
    pokemon: str

@app.post("/find_similar")
def find_similar_pokemon(req: SimilarPokemonQuery):
    query = req.pokemon.lower();
    return query_pokemon(query)

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

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("../frontend/dist/favicon.ico")

# --- serve frontend --- #
app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    return FileResponse('../frontend/dist/index.html')

import math
import json
from hashlib import sha256

example = {
    'order': 1,
    'pokedex_number': 1,
    'species_index': 1,
    'name': 'bulbasaur',
    'species_name': 'bulbasaur',
    'weight': 69,
    'height': 7,
    'stats': [45, 49, 49, 65, 65, 45],
    'types': [12, 4],
    'generation': 1,
    'eggGroups': [1, 7],
    'color': 5,
    'is_baby': 0,
    'is_legendary': 0,
    'is_mythical': 0,
    'evolution_chain': 1,
    'genus': 'Seed Pokémon',
    'habitat': 3,
    'shape': 8
}

n_types = 18 + 1;
n_egg_groups = 15 + 1;
n_colors = 10 + 1
n_habitats = 9 + 1
n_shapes = 14 + 1
n_generations = 9 + 1

min_weight =  0
min_height =  1
max_weight =  10000
max_height =  1000
max_order =  1109
max_pokedex_number =  1025
max_species_index =  1025

# -- Helper Functions --
def log_normalize(value, max_value):
    return math.log(value + 1) / math.log(max_value + 1)

# -- Vectorization Function --
def pokedex_vector(pokemon):
    order = pokemon['order'] / max_order
    pokedex_number = pokemon['pokedex_number'] / max_pokedex_number
    generation = pokemon['generation'] / n_generations
    return [order, pokedex_number, generation]

def size_vector(pokemon):
    weight = log_normalize(pokemon['weight'], max_weight)
    height = log_normalize(pokemon['height'], max_height)
    return [weight, height]

def types_vector(pokemon):
    type_vector_1 = [0] * n_types
    type_vector_2 = [0] * n_types
    types = pokemon['types']
    type_vector_1[types[0] - 1] = 1
    if (len(types) > 1):
        type_vector_2[types[1] - 1] = 1

    return type_vector_1 + type_vector_2

def egg_groups_vector(pokemon):
    egg_groups = pokemon['eggGroups']
    egg_group_vector = [0] * n_egg_groups
    for egg_group in egg_groups:
        egg_group_vector[egg_group] = 1
    return egg_group_vector

def color_vector(pokemon):
    color = pokemon['color']
    color_vector = [0] * n_colors
    color_vector[color] = 1
    return color_vector

def habitat_vector(pokemon):
    habitat = pokemon['habitat']
    habitat_vector = [0] * n_habitats
    habitat_vector[habitat] = 1
    return habitat_vector

def shape_vector(pokemon):
    shape = pokemon['shape']
    shape_vector = [0] * n_shapes
    shape_vector[shape] = 1
    return shape_vector

def evolution_chain_vector(pokemon):
    evo_id = pokemon['evolution_chain']
    digest = sha256(str(evo_id).encode()).digest()
    return [int(b) for b in bin(int.from_bytes(digest, 'big'))[-16:]] # 16 bits

def booleans_vector(pokemon):
    is_legendary = pokemon['is_legendary']
    is_mythical = pokemon['is_mythical']
    is_baby = pokemon['is_baby']
    return [is_legendary, is_mythical, is_baby]

def stats_vector(pokemon):
    stats = pokemon['stats']
    return [log_normalize(stat, 255) for stat in stats]

def get_vector(pokemon):
    return (
        pokedex_vector(pokemon) +
        size_vector(pokemon) +
        types_vector(pokemon) +
        egg_groups_vector(pokemon) +
        color_vector(pokemon) +
        habitat_vector(pokemon) +
        shape_vector(pokemon) +
        evolution_chain_vector(pokemon) +
        booleans_vector(pokemon) +
        stats_vector(pokemon)
    )

with open('pokemon.json', 'r') as f:
    pokemon_data = json.load(f)
    #pokemon_vectors = [{"name": pokemon['name'], "vector": get_vector(pokemon)} for pokemon in pokemon_data]
    #print(pokemon_vectors)
    print([pokemon['name'] for pokemon in pokemon_data])
    f.close()

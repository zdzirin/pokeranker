import os
import json
from test.test_statistics import AverageMixin

# -- retrieve names function --
def getName(folder, id):
    folder_path = "api-data/data/api/v2/{}/{}/index.json".format(folder, id)
    with open(folder_path, 'r') as file:
        data = json.load(file);
        file.close()

    return data['name']

def get_constant(folder):
    folder_path = "api-data/data/api/v2/{}".format(folder)
    folders = os.listdir(folder_path);
    folders = [int(n) for n in folders if n.isdigit()]
    folders.sort()

    return [getName(folder, id) for id in folders]

# -- constants --
types = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy']
egg_groups = ['monster', 'water1', 'bug', 'flying', 'ground', 'fairy', 'plant', 'humanshape', 'water3', 'mineral', 'indeterminate', 'water2', 'ditto', 'dragon', 'no-eggs']
colors = ['black', 'blue', 'brown', 'gray', 'green', 'pink', 'purple', 'red', 'white', 'yellow']
habitats = ['cave', 'forest', 'grassland', 'mountain', 'rare', 'rough-terrain', 'sea', 'urban', 'waters-edge']
shapes = ['ball', 'squiggle', 'fish', 'arms', 'blob', 'upright', 'legs', 'quadruped', 'wings', 'tentacles', 'heads', 'humanoid', 'bug-wings', 'armor']

n_types = 18;
n_egg_groups = 15;
n_colors = 10
n_habitats = 9
n_shapes = 14

min_weight =  0
min_height =  1
max_weight =  10000
max_height =  1000
average_weight =  980.863287250384
average_height =  20.467741935483872
max_order =  1109
max_pokedex_number =  1025
max_species_index =  1025

with open("pokemon.json", 'r') as file:
    pokemon_data = json.load(file)
    min_weight = min([pokemon['weight'] for pokemon in pokemon_data])
    min_height = min([pokemon['height'] for pokemon in pokemon_data])
    max_weight = max([pokemon['weight'] for pokemon in pokemon_data])
    max_height = max([pokemon['height'] for pokemon in pokemon_data])
    average_weight = sum([pokemon['weight'] for pokemon in pokemon_data]) / len(pokemon_data)
    average_height = sum([pokemon['height'] for pokemon in pokemon_data]) / len(pokemon_data)
    max_order = max([pokemon['order'] for pokemon in pokemon_data])
    max_pokedex_number = max([pokemon['pokedex_number'] for pokemon in pokemon_data])
    max_species_index = max([pokemon['species_index'] for pokemon in pokemon_data])
    max_evolution_chain_id = max([pokemon['evolution_chain'] for pokemon in pokemon_data])
    max_generation = max([pokemon['generation'] for pokemon in pokemon_data])
    file.close()

print("min_weight = ", min_weight)
print("min_height = ", min_height)
print("max_weight = ", max_weight)
print("max_height = ", max_height)
print("average_weight = ", average_weight)
print("average_height = ", average_height)
print("max_order = ", max_order)
print("max_pokedex_number = ", max_pokedex_number)
print("max_species_index = ", max_species_index)
print("max_evolution_chain_id = ", max_evolution_chain_id)
print("n_generations = ", max_generation)

import json
import os

def getIndexFromPath(path):
    return int(path.rstrip('/').split('/')[-1])

def addPokemonData(pokemon_data, pokemon):
    #print(" Adding pokemon data for {}".format(pokemon_data["name"]))
    pokemon["order"] = pokemon_data["order"]
    pokemon["name"] = pokemon_data["name"]
    pokemon["species_name"] = pokemon_data["species"]["name"]
    pokemon["weight"] = pokemon_data["weight"]
    pokemon["height"] = pokemon_data["height"]
    pokemon["species_index"] = getIndexFromPath(pokemon_data["species"]["url"])
    pokemon["stats"] = [stat["base_stat"] for stat in pokemon_data["stats"]]
    pokemon["stat_total"] = sum(pokemon["stats"])
    pokemon["types"] = [getIndexFromPath(type["type"]["url"]) for type in pokemon_data["types"]]

def addSpeciesData(species_data, pokemon):
        #print(" Adding species data from {}".format(pokemon["name"]))
        pokemon["generation"] = getIndexFromPath(species_data["generation"]["url"])
        pokemon["eggGroups"] = [getIndexFromPath(egg_group["url"]) for egg_group in species_data["egg_groups"]]
        pokemon["color"] = getIndexFromPath(species_data["color"]["url"])
        pokemon["is_baby"] = 1 if species_data["is_baby"] is True else 0
        pokemon["is_legendary"] = 1 if species_data["is_legendary"] is True else 0
        pokemon["is_mythical"] = 1 if species_data["is_mythical"] is True else 0
        pokemon["pokedex_number"] = [entry["entry_number"] for entry in species_data["pokedex_numbers"] if entry["pokedex"]["name"] == "national"][0]
        pokemon["evolution_chain"] = getIndexFromPath(species_data["evolution_chain"]["url"])
        pokemon["genus"] = [entry["genus"] for entry in species_data["genera"] if entry["language"]["name"] == "en"][0]
        pokemon["habitat"] = getIndexFromPath(species_data["habitat"]["url"]) if species_data["habitat"] is not None else 0
        pokemon["shape"] = getIndexFromPath(species_data["shape"]["url"])

def parsePokemon(folder):
    #print("!Parsing Pokemon {}".format(folder))
    pokemon = {}
    pokemon["id"] = int(folder)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pokemon_file_path = os.path.join(base_dir, '..', 'api-data', 'data', 'api', 'v2', 'pokemon', str(folder), 'index.json')
    with open(pokemon_file_path, 'r') as f:
        pokemon_data = json.load(f)
        addPokemonData(pokemon_data, pokemon)
        f.close();

    species_file_path = os.path.join(base_dir, '..', 'api-data', 'data', 'api', 'v2', 'pokemon-species', str(pokemon["species_index"]), 'index.json')
    with open(species_file_path, 'r') as f:
        species_data = json.load(f)
        addSpeciesData(species_data, pokemon)
        f.close()

    #print("finished parsing {}: {}\n".format(folder, pokemon["name"]))
    return pokemon

def parse_all_pokemon():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pokemon_path = os.path.join(base_dir, '..', 'api-data', 'data', 'api', 'v2', 'pokemon')
    pokemon_folders = os.listdir(pokemon_path)
    pokemon_folders = [int(n) for n in pokemon_folders if n.isdigit()]
    pokemon_folders.sort()

    return [parsePokemon(n) for n in pokemon_folders]

if __name__ == "__main__":
    pokemon = parse_all_pokemon()
    pokemon_json = json.dumps(pokemon)
    print(pokemon_json)

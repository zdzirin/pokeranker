import json

with open('pokemon.json', 'r') as f:
    pokemon_data = json.load(f)
    pokemon_data = [p for p in pokemon_data if "koraidon-" not in p["name"] and "miraidon-" not in p["name"] and "gmax" not in p["name"] and "cramorant-" not in p["name"] and "-starter" not in p["name"] and "pikachu-" not in p["name"] and "-totem" not in p["name"] and p["name"] != "zygarde-10"]

with open('filtered_pokemon.json', 'w') as f:
    json.dump(pokemon_data, f)
    f.close()

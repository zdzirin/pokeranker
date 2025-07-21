import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import clsx from "clsx";

type Pokemon = {
  id: number;
  order: number;
  name: string;
  species_name: string;
  weight: number;
  height: number;
  species_index: number;
  stats: number[];
  types: number[];
  generation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  eggGroups: number[]; // Todo: Standardize egg groups casing
  color: number;
  is_baby: number;
  is_legendary: number;
  is_mythical: number;
  pokedex_number: number;
  evolution_chain: number;
  genus: string;
  habitat: number;
  shape: number;
};
type Constants = {
  types: string[];
  egg_groups: string[];
  colors: string[];
  shapes: string[];
  habitats: string[];
};

const GENERATION_TO_NUMERALS = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
};

const capitalizeOne = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
const capitalize = (str: string, split: string = "-") =>
  str.split(split).map(capitalizeOne).join(" ");

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [selectedPokemonName, setSelectedPokemonName] = useState<string>();
  const [similarPokemon, setSimilarPokemon] = useState<
    { name: string; similarity: number }[]
  >([]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["pokemon"],
    queryFn: async () => {
      const pokemonResponse = await fetch("/pokemon");
      const pokemon: Pokemon[] = await pokemonResponse.json();

      const constantsResponse = await fetch("/constants");
      const constants: Constants = await constantsResponse.json();

      return {
        pokemon,
        ...constants,
      };
    },
  });

  const findSimilar = async (selectedPokemon: Pokemon) => {
    if (!selectedPokemon) return;
    const res = await fetch("/find_similar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokemon: selectedPokemon.name }),
    });
    const similarPokemon: { name: string; similarity: number }[] =
      await res.json();
    setSimilarPokemon(similarPokemon);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const pokemonOptions =
    data?.pokemon.map((p: any) => ({
      value: p.name,
      label: p.name,
    })) || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Find Similar Pokémon!</h1>
      <div className="flex gap-4">
        <Combobox
          className="w-72"
          options={pokemonOptions}
          value={selectedPokemonName}
          onValueChange={(name) => {
            setSelectedPokemonName(name);
            const pokemonObject = data?.pokemon.find(
              (p: any) => p.name === name,
            );
            pokemonObject && findSimilar(pokemonObject);
          }}
          placeholder="Select a Pokémon..."
          searchPlaceholder="Search for a Pokémon..."
          emptyMessage="No Pokémon found."
        />
      </div>
      {similarPokemon.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center items-center mt-4 mb-12">
          {similarPokemon.map((similar, i) => {
            const pokemon = data?.pokemon.find((p) => p.name === similar.name);
            if (!pokemon) return null;

            return (
              <div
                key={`similar-sprite-${pokemon.id}`}
                className={clsx(
                  "flex flex-col items-center",
                  i === 0 && "py-2 px-4 border-2 rounded",
                )}
              >
                <img
                  className={clsx("mb-2", i === 0 ? "w-18 h-18" : "w-12 h-12")}
                  src={`/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
                <p className="font-semibold ">{capitalize(pokemon.name)}</p>
                <div className="flex gap-1 justify-center">
                  {pokemon.types.map((tI) => (
                    <img
                      className="h-4"
                      src={`/sprites/types/${tI}.png`}
                      alt={`${data?.types[tI - 1]} type`}
                    />
                  ))}
                </div>
                {i !== 0 && (
                  <p className="italic text-xs text-muted-foreground">
                    {similar.similarity}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {similarPokemon.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Similar Pokémon:</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pokedex #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Types</TableHead>
                <TableHead>Size (H/W)</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Egg Groups</TableHead>
                <TableHead>Habitat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {similarPokemon.map((similar, index) => {
                const pokemon = data?.pokemon.find(
                  (p) => p.name === similar.name,
                );
                if (!pokemon) return null;

                return (
                  <TableRow key={`similar-${index}`}>
                    <TableCell>
                      ({GENERATION_TO_NUMERALS[pokemon.generation]}){" "}
                      {pokemon.pokedex_number}
                    </TableCell>
                    <TableCell>{capitalize(pokemon.name)}</TableCell>
                    <TableCell>
                      {pokemon.types
                        .map((t: number) => data?.types[t - 1])
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      {pokemon.height} / {pokemon.weight}
                    </TableCell>
                    <TableCell>{data?.shapes[pokemon.shape - 1]}</TableCell>
                    <TableCell>{data?.colors[pokemon.color - 1]}</TableCell>
                    <TableCell>{pokemon.stats.join(", ")}</TableCell>
                    <TableCell>
                      {pokemon.eggGroups
                        .map((g: number) => data?.egg_groups[g])
                        .join(", ")}
                    </TableCell>
                    <TableCell>{data?.habitats[pokemon.habitat - 1]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

import clsx from "clsx";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Dices, ArrowLeft, Ban } from "lucide-react";
import Pokeball from "@/components/svg/pokeball";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";

import { Settings } from "@/components/Settings";

import type { Pokemon, Constants } from "@/types";
import { GENERATION_TO_NUMERALS } from "@/const";

const capitalizeOne = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
const capitalize = (str: string, split: string = "-") =>
  str.split(split).map(capitalizeOne).join(" ");

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: (search: Record<string, unknown>): { pokemon?: string } => {
    return {
      pokemon: search.pokemon as string,
    };
  },
});

type VectorStrengths = {
  image: number;
  pokedex: number;
  size: number;
  types: number;
  egg_groups: number;
  color: number;
  habitat: number;
  shape: number;
  evolution_chain: number;
  booleans: number;
  stats: number;
};

function App() {
  const { pokemon: pokemonFromUrl } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [selectedPokemonName, setSelectedPokemonName] = useState<string>(
    pokemonFromUrl || "",
  );
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [similarPokemon, setSimilarPokemon] = useState<
    { name: string; similarity: number }[]
  >([]);

  const [algorithm, setAlgorithm] = useState("cosine");
  const [k, setK] = useState(10);
  const [vectorStrengths, setVectorStrengths] = useState<VectorStrengths>();

  const {
    data: strengthsData,
    isLoading: loadingStrengths,
    error: strengthsError,
  } = useQuery<VectorStrengths>({
    queryKey: ["strengths"],
    queryFn: async () => {
      const response = await fetch("/vectors/strengths");
      return response.json();
    },
  });

  useEffect(() => {
    if (strengthsData) {
      setVectorStrengths(strengthsData);
    }
  }, [strengthsData]);

  const {
    data,
    error,
    isLoading: loadingData,
  } = useQuery({
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

  useEffect(() => {
    const pokemonObject = data?.pokemon.find(
      (p: any) => p.name === selectedPokemonName,
    );
    if (pokemonObject) {
      findSimilar(pokemonObject);
      return;
    }

    setSimilarPokemon([]);
    setSelectedPokemonName("");
  }, [algorithm, k, vectorStrengths, selectedPokemonName, data]);

  useEffect(() => {
    if (pokemonFromUrl && data?.pokemon) {
      const pokemonObject = data.pokemon.find(
        (p: any) => p.name === pokemonFromUrl,
      );

      if (pokemonObject && pokemonFromUrl !== selectedPokemonName) {
        setSelectedPokemonName(pokemonFromUrl);
        findSimilar(pokemonObject);
      }
    } else {
      setSelectedPokemonName("");
      setSimilarPokemon([]);
    }
  }, [pokemonFromUrl, data]);

  const findSimilar = async (selectedPokemon: Pokemon) => {
    if (!selectedPokemon || !vectorStrengths) return;
    setLoadingSimilar(true);
    setSimilarPokemon([]);

    const res = await fetch("/find_similar/combined", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pokemon: selectedPokemon.name,
        k,
        algorithm,
        image_strength: vectorStrengths.image,
        pokedex_strength: vectorStrengths.pokedex,
        size_strength: vectorStrengths.size,
        types_strength: vectorStrengths.types,
        egg_groups_strength: vectorStrengths.egg_groups,
        color_strength: vectorStrengths.color,
        habitat_strength: vectorStrengths.habitat,
        shape_strength: vectorStrengths.shape,
        evolution_chain_strength: vectorStrengths.evolution_chain,
        booleans_strength: vectorStrengths.booleans,
        stats_strength: vectorStrengths.stats,
      }),
    });

    const similarPokemon: { name: string; similarity: number }[] =
      await res.json();
    setSimilarPokemon(similarPokemon);
    setLoadingSimilar(false);
  };

  const updateSelected = (pokemon: Pokemon) => {
    setSelectedPokemonName(pokemon.name);
    navigate({ search: { pokemon: pokemon.name } });
    findSimilar(pokemon);
  };

  if (loadingData || loadingStrengths) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Pokeball className="w-32 h-32 animate-spin" />
      </div>
    );
  }

  if (error || strengthsError) {
    return <div>Error: {error?.message || strengthsError?.message}</div>;
  }

  const pokemonOptions =
    data?.pokemon.map((p: any) => ({
      value: p.name,
      label: capitalize(p.name),
    })) || [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Find Similar Pokémon!</h1>
        {vectorStrengths && strengthsData && (
          <Settings
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            k={k}
            onKChange={setK}
            vectorStrengths={vectorStrengths}
            defaultStrengths={strengthsData}
            onVectorStrengthsChange={setVectorStrengths}
          />
        )}
      </div>
      <div className="flex">
        {selectedPokemonName && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                window.history.back();
              }}
              className="rounded-r-none border-r-0"
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedPokemonName("");
                navigate({ search: {} });
              }}
              className="rounded-none border-r-0"
            >
              <Ban />
            </Button>
          </>
        )}
        <Combobox
          className={clsx(
            "w-72 rounded-none shadow-none",
            !selectedPokemonName && "rounded-l",
          )}
          options={pokemonOptions}
          value={selectedPokemonName}
          onValueChange={(name) => {
            setSelectedPokemonName(name);
            navigate({ search: { pokemon: name } });
            const pokemonObject = data?.pokemon.find(
              (p: any) => p.name === name,
            );
            pokemonObject && findSimilar(pokemonObject);
          }}
          placeholder="Select a Pokémon..."
          searchPlaceholder="Search for a Pokémon..."
          emptyMessage="No Pokémon found."
        />
        <Button
          variant="muted"
          size="icon"
          disabled={!data}
          className="rounded-l-none border border-l-0"
          onClick={() => {
            if (!data) return;
            const rI = Math.floor(Math.random() * data.pokemon.length);
            const name = data.pokemon[rI].name;
            setSelectedPokemonName(name);
            navigate({ search: { pokemon: name } });
            const pokemonObject = data?.pokemon.find(
              (p: any) => p.name === name,
            );
            pokemonObject && findSimilar(pokemonObject);
          }}
        >
          <Dices />
        </Button>
      </div>
      {loadingSimilar && (
        <Pokeball className="mx-auto mt-48 w-32 h-32 animate-spin" />
      )}
      <SimilarPokemonDisplay {...{ similarPokemon, data, updateSelected }} />
      <SimilarPokemonTable {...{ similarPokemon, data }} />
    </div>
  );
}

const SimilarPokemonDisplay = ({
  similarPokemon,
  data,
  updateSelected,
}: {
  similarPokemon: { name: string; similarity: number }[];
  data: ({ pokemon: Pokemon[] } & Constants) | undefined;
  updateSelected: (pokemon: Pokemon) => void;
}) =>
  similarPokemon.length > 0 && (
    <div className="flex flex-wrap gap-4 justify-center items-center mt-4 mb-12">
      {similarPokemon.map((similar, i) => {
        const pokemon = data?.pokemon.find((p) => p.name === similar.name);
        if (!pokemon) return null;

        return (
          <div
            key={`similar-sprite-${pokemon.id}`}
            className={clsx(
              "flex flex-col items-center py-2 px-4 rounded animate-in",
              i === 0 ? "border-2" : "cursor-pointer hover:bg-muted/60",
            )}
            onClick={() => i !== 0 && updateSelected(pokemon)}
          >
            <img
              alt={pokemon.name}
              src={`/sprites/pokemon/${pokemon.id}.png`}
            />
            <p className="font-semibold leading-4">
              {capitalize(pokemon.name)}
            </p>
            <p className="italic text-muted-foreground mb-1">{pokemon.genus}</p>
            <div className="flex gap-1 justify-center mb-1">
              {pokemon.types.map((tI) => (
                <img
                  className="h-4"
                  src={`/sprites/types/old/${tI}.png`}
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
  );

const SimilarPokemonTable = ({
  similarPokemon,
  data,
}: {
  similarPokemon: { name: string; similarity: number }[];
  data: ({ pokemon: Pokemon[] } & Constants) | undefined;
}) =>
  similarPokemon.length > 0 && (
    <div className="mt-4 animate-in">
      <h2 className="text-xl font-bold">Similar Pokémon:</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">Dex #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Types</TableHead>
            <TableHead>Size (H/W)</TableHead>
            <TableHead>Shape</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Stat Total</TableHead>
            <TableHead>Egg Groups</TableHead>
            <TableHead>Habitat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {similarPokemon.map((similar, index) => {
            const pokemon = data?.pokemon.find((p) => p.name === similar.name);
            if (!pokemon) return null;

            return (
              <TableRow key={`similar-${index}`}>
                <TableCell className="text-muted-foreground text-right">
                  ({GENERATION_TO_NUMERALS[pokemon.generation]}){" "}
                  {pokemon.pokedex_number}
                </TableCell>
                <TableCell>
                  <b>{capitalize(pokemon.name)}</b>
                  <p className="text-sm text-muted-foreground">
                    {pokemon.genus}
                  </p>
                </TableCell>
                <TableCell>
                  {pokemon.types.map((tI) => (
                    <img
                      className="h-4"
                      src={`/sprites/types/${tI}.png`}
                      alt={`${data?.types[tI - 1]} type`}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {pokemon.height / 10}m / {pokemon.weight / 10}kg
                </TableCell>
                <TableCell>{data?.shapes[pokemon.shape - 1]}</TableCell>
                <TableCell>
                  <div
                    className="h-4 mx-auto w-4 rounded-full"
                    style={{
                      backgroundColor: data?.colors[pokemon.color - 1],
                    }}
                  />
                </TableCell>
                <TableCell>{pokemon.stats.join(", ")}</TableCell>
                <TableCell>{pokemon.stat_total}</TableCell>
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
  );

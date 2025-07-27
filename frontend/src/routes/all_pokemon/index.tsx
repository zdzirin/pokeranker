import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import Pokeball from "@/components/svg/pokeball";
import { Input } from "@/components/ui/input";

import type { Constants, Pokemon } from "@/types";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
} from "@/components/ui/responsive-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/all_pokemon/")({
  component: PokemonPage,
});

function PokemonPage() {
  const [search, setSearch] = useState("");
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

  if (loadingData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Pokeball className="w-32 h-32 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-red-500 text-2xl">Error loading pokemon</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">All Pokemon</h1>
      <div className="mb-8 flex justify-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Pokemon..."
          className="max-w-sm"
        />
      </div>
      <div className="flex items-center flex-wrap justify-center gap-4">
        {data?.pokemon
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((p) => (
            <PokemonDialog key={p.id} pokemon={p} />
          ))}
      </div>
    </div>
  );
}

const PokemonDialog = ({ pokemon }: { pokemon: Pokemon }) => {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger>
        <div className="flex flex-col items-center py-2 px-4 rounded animate-in cursor-pointer hover:bg-muted/60">
          <img src={`/sprites/pokemon/${pokemon.id}.png`} alt={pokemon.name} />
          <h2 className="text-lg font-bold">{pokemon.name}</h2>
          <p className="text-muted-foreground">
            {pokemon.pokedex_number} • {pokemon.order}
          </p>
        </div>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <h2 className="text-lg font-bold">{pokemon.name}</h2>
        <img
          src={`/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
          className="mx-auto"
        />
        <Table>
          <TableHeader>
            <TableHead />
            <TableHead />
          </TableHeader>
          <TableBody>
            {Object.keys(pokemon).map((field) => (
              <TableRow key={field}>
                <TableCell className="font-bold text-right">{field}</TableCell>
                <TableCell className="text-center">
                  {pokemon[field as keyof Pokemon]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

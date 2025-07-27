export type Pokemon = {
  id: number;
  order: number;
  name: string;
  species_name: string;
  weight: number;
  height: number;
  species_index: number;
  stats: number[];
  stat_total: number;
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

export type Constants = {
  types: string[];
  egg_groups: string[];
  colors: string[];
  shapes: string[];
  habitats: string[];
};

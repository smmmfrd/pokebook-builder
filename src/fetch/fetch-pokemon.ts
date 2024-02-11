import cliProgress, { SingleBar } from "cli-progress";
import { writeFile } from "fs";

// 1 - 649 is all pokemon up to Unova.
const startingIndex = 1;
const endingIndex = 649;

type Poke = {
  profileImage: string;
  flavorTexts: string;
  typesJson: string;
  bot: boolean;
  name: string;
  id: number;
};

type PokeData = {
  id: number;
  name: string;
  species: {
    url: string;
  };
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
};

type FlavorTextData = {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
};

async function getPokemon(pokedexNumber: number) {
  const pokeRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`
  );

  if (!pokeRes.ok) {
    console.log(pokeRes.status, pokeRes.statusText);
    throw new Error();
  }

  const pokeData: PokeData = (await pokeRes.json()) as PokeData;

  const pokeSpeciesRes = await fetch(pokeData.species.url);
  const speciesData: FlavorTextData =
    (await pokeSpeciesRes.json()) as FlavorTextData;
  return buildPokemon(pokeData, speciesData);
}

function buildPokemon(pokeData: PokeData, speciesData: FlavorTextData) {
  const rawFlavor = [
    ...new Set(
      speciesData.flavor_text_entries
        .filter((flavor) => flavor.language.name === "en")
        .map((flavor) => flavor.flavor_text.replace(/\n|\f/g, " "))
    ),
  ];

  const flavorTexts = JSON.stringify(rawFlavor);

  const typesJson = JSON.stringify(pokeData.types.map(({ type }) => type.name));
  const bot = typesJson.includes("normal") && !pokeData.name.includes("-");

  return {
    profileImage: pokeData.sprites.front_default,
    flavorTexts,
    typesJson,
    bot,
    name: `${pokeData.name.slice(0, 1).toUpperCase()}${pokeData.name.slice(1)}`,
    id: pokeData.id,
  };
}

(async function main() {
  // Set up a loading bar to ensure this did not break.
  const bar = new SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(endingIndex, 0);

  let pokemonData: Poke[] = [];

  try {
    for (let i = startingIndex; i <= endingIndex; i++) {
      const pokemon = await getPokemon(i);
      pokemonData.push(pokemon);
      bar.increment();
    }
  } catch (err) {
    console.error(err);
  } finally {
    bar.stop();

    await Bun.write("./data/base.json", JSON.stringify(pokemonData));

    const bots = pokemonData.filter((poke) => poke.bot);

    writeFile("bots.json", JSON.stringify(bots), "utf-8", (err) => {
      if (err) {
        console.error("Error:", err);
      } else {
        console.log("Created:", bots.length, "bots.");
      }
    });

    await Bun.write("./data/bots.json", JSON.stringify(bots));
  }
})();

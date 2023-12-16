// const pokemon = Bun.file("data/pokemon.json");
// const pokemonText = await pokemon.text();
// const pokemonData = await JSON.parse(pokemonText);
// console.log(pokemonData[0]);

// const date = new Date().getDate();
// console.log(date);

import { PrismaClient } from "@prisma/client";
import { BotData } from "./bots";

const prisma = new PrismaClient();

await BotData(prisma);

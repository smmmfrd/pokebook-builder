// const pokemon = Bun.file("data/pokemon.json");
// const pokemonText = await pokemon.text();
// const pokemonData = await JSON.parse(pokemonText);
// console.log(pokemonData[0]);

import { PrismaClient } from "@prisma/client";
import { BotData } from "./bots";

const date = new Date().getDate();
console.log(date);

BotData();

// Test prisma connection...
const prisma = new PrismaClient();
const lastPost = await prisma.post.findFirst({
  where: { poster: { bot: true } },
});
console.log(lastPost);

import { Item, Pokemon, PrismaClient } from "@prisma/client";

import { RemoveStaleUsers } from "./stale-users";
import { BotData } from "./bots";

const prisma = new PrismaClient();

const date = new Date().getDate();
// console.log(date);

if (date === 1) {
  // It's the first of the month, time to reset
  // All data is linked to pokemon and items, so deleting them removes all data.
  await prisma.pokemon.deleteMany({});

  const pokemonJSON = Bun.file("data/pokemon.json");
  const pokemonText = await pokemonJSON.text();
  const pokemonData = (await JSON.parse(pokemonText)) as Pokemon[];

  await prisma.pokemon.createMany({ data: pokemonData });

  console.log(`${pokemonData.length} Pokemon Created.`);

  // Items
  await prisma.item.deleteMany({});

  const itemJSON = Bun.file("data/items.json");
  const itemText = await itemJSON.text();
  const itemData = (await JSON.parse(itemText)) as Item[];

  await prisma.item.createMany({ data: itemData });

  console.log(`${itemData.length} Items Created.`);
}

RemoveStaleUsers(prisma);

await BotData(prisma);

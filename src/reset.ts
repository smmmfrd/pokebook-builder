import { PrismaClient } from "@prisma/client";

import { RemoveStaleUsers } from "./stale-users";

const prisma = new PrismaClient();

const date = new Date().getDate();
// console.log(date);

if (date === 1) {
  // It's the first of the month, time to reset
  // All data is linked to pokemon, so deleting them removes all data. (except for items)
  // await prisma.pokemon.deleteMany({});
}

RemoveStaleUsers(prisma);

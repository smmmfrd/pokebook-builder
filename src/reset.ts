import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

const date = new Date().getDate();
console.log(date);

if (date === 1) {
  // It's the first of the month, time to reset
  // All data is linked to pokemon, so deleting them removes all data. (except for items)
  // await prisma.pokemon.deleteMany({});
}

const staleDate = moment().subtract(3, "days").toDate();

const stalePosters = await prisma.pokemon.findMany({
  where: {
    NOT: [
      { user: null },
      { bot: true },
      { posts: { some: { createdAt: { gt: staleDate } } } },
    ],
  },
  select: {
    user: { select: { id: true } },
  },
});

const staleIds: string[] = stalePosters
  .filter((poster): poster is { user: { id: string } } => poster.user != null)
  .map(({ user }) => user.id);

const deletedUsers = await prisma.user.deleteMany({
  where: { id: { in: staleIds } },
});

console.log(`Found and removed ${deletedUsers.count} stale users.`);

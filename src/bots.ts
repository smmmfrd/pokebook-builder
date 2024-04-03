import { Pokemon, PrismaClient } from "@prisma/client";
import moment from "moment";

import { randomPosts } from "./bot/posts";
import { botLikes } from "./bot/likes";
import { randomReviews } from "./bot/reviews";

export async function BotData(prisma: PrismaClient) {
  const bot = Bun.file("data/bots.json");
  const botText = await bot.text();
  const botData = (await JSON.parse(botText)) as Pokemon[];
  // console.log(`${botData.length} Bots`);

  const timeSinceLast = moment().subtract(8, "hours");

  // Method for sub-processes to get a random bot pokemon and remove it from the array, preventing that process and subsequent ones from using it again.
  const randBot = (): Pokemon => {
    return botData.splice(Math.floor(Math.random() * botData.length), 1)[0];
  };

  const botPosts = randomPosts(randBot, 8, timeSinceLast);

  const reviews = await randomReviews(randBot, timeSinceLast);

  await prisma.post.createMany({ data: [...botPosts, ...reviews] });
  // console.log(botPosts);

  // Need to query the database with the new bot posts included as to get their id's
  const newPosts = await prisma.post.findMany({
    where: { createdAt: { gt: timeSinceLast.toDate() } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      likes: { select: { creatorId: true } },
    },
  });

  // !!! - WARNING - !!!
  // Must be last function as it removes all bots from the list.
  const likes = botLikes(randBot, botData.length, newPosts);

  await prisma.like.createMany({ data: likes });

  // console.log(`${botData.length} Bots`);
}

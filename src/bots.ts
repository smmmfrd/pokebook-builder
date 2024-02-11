import { Pokemon, PrismaClient } from "@prisma/client";
import moment from "moment";

import { randomPosts } from "./bot/posts";
import { botLikes } from "./bot/likes";

export async function BotData(prisma: PrismaClient) {
  const bot = Bun.file("data/bots.json");
  const botText = await bot.text();
  const botData = (await JSON.parse(botText)) as Pokemon[];
  console.log(`${botData.length} Bots`);

  const timeSinceLast = moment().subtract(8, "hours");

  // Get a random bot pokemon and remove it from the array
  const randBot = (): Pokemon => {
    return botData.splice(Math.floor(Math.random() * botData.length), 1)[0];
  };

  const botPosts = randomPosts(randBot, 8, timeSinceLast);

  await prisma.post.createMany({ data: botPosts });
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

  const likes = botLikes(randBot, botData.length, newPosts);

  await prisma.like.createMany({ data: likes });
  // console.log(likes);

  console.log(`${botData.length} Bots`);
}

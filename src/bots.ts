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

  // Method for sub-processes to get a random bot pokemon and remove it from the array, preventing that process and subsequent ones from using it again.
  const randBot = (): Pokemon => {
    return botData.splice(Math.floor(Math.random() * botData.length), 1)[0];
  };

  const posts = randomPosts(randBot, 8);

  const reviews = await randomReviews(randBot);

  const lastTime = moment().subtract(8, "hours");
  const minutesSinceLast = 8 * 60;
  const postPercentage = 1 / (posts.length + reviews.length);
  const minutesBetweenPosts = minutesSinceLast * postPercentage;
  console.log(posts.length + reviews.length, minutesBetweenPosts);

  // Shuffle all created posts
  const botPosts = [...posts, ...reviews]
    .map((post) => ({ post, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ post }, index) => ({
      ...post,
      createdAt: moment(lastTime.toDate())
        .add(index * minutesBetweenPosts, "minutes")
        .toDate(),
    }));

  // Push them to the db
  await prisma.post.createMany({ data: botPosts });
  // console.log(botPosts);

  // Need to query the database with the new bot posts included as to get their id's, as well as getting any user posts created within the last eight hours.
  const newPosts = await prisma.post.findMany({
    where: { createdAt: { gt: lastTime.toDate() } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      likes: { select: { creatorId: true } },
    },
  });

  // Pushing all new posts to be liked by the remaining bots.
  // !!! - WARNING - !!!
  // Must be last function as it removes all remaining bots from the list.
  const likes = botLikes(randBot, botData.length, newPosts);

  await prisma.like.createMany({ data: likes });

  // console.log(`${botData.length} Bots`);
}

import { Pokemon } from "@prisma/client";
import moment from "moment";

import { randomPosts } from "./bot/posts";
import { randomReviews } from "./bot/reviews";

async function Test() {
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

  botPosts
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .forEach((post) =>
      // `${post.content}${
      //   post.itemId
      //     ? ` ${post.positive ? "positive" : "negative"} about item: ${
      //         post.itemId
      //       },`
      //     : ""
      // } at ${post.createdAt.toLocaleTimeString()} on ${post.createdAt.toDateString()}`
      console.log(
        `${post.createdAt.toLocaleTimeString()} on ${post.createdAt.toDateString()}`
      )
    );

  console.log(lastTime.toString());
}

void Test();

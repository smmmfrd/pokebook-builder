import { Pokemon } from "@prisma/client";
import { Like, LikablePost } from "../types";

export function botLikes(
  randBot: () => Pokemon,
  likeCount: number,
  newPosts: LikablePost[]
): Like[] {
  return Array.from({ length: likeCount }, () => {
    const poke = randBot();

    const possibleLikes = newPosts.filter(
      (post) => !post.likes.some(({ creatorId }) => creatorId === poke.id)
    );

    const randomPost =
      possibleLikes[Math.floor(Math.random() * possibleLikes.length)];

    return {
      creatorId: poke.id,
      postId: randomPost.id,
    };
  });
}

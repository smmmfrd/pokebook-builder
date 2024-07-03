import { Pokemon } from "@prisma/client";
import { PostData } from "../types";
import { randomPostContent } from "./utils";

export function randomPosts(
  randBot: () => Pokemon,
  postNumber: number
): PostData[] {
  return Array.from({ length: postNumber }, (_, i) => {
    const poke = randBot();
    const content = randomPostContent(poke.name);

    return {
      posterId: poke.id,
      content,
    };
  });
}

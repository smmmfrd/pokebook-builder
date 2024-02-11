import { Pokemon } from "@prisma/client";

export function randomReviews(randBot: () => Pokemon, reviewNumber: number) {
  return Array.from({ length: reviewNumber }, (_, i) => {
    const reviewer = randBot();

    console.log(reviewer.name);
  });
}

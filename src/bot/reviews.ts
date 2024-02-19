import { Item, Pokemon } from "@prisma/client";

type ItemCategoryIds = {
  [key: string]: number[];
};

export async function randomReviews(
  randBot: () => Pokemon,
  reviewNumber: number
) {
  const itemFile = Bun.file("./data/items.json");

  // Build a dictionary of Item Category to List of Ids of items within that category.
  const itemData = ((await itemFile.json()) as Item[]).reduce(
    (dict, current) => {
      // If the dictionary has the current item's category,
      if (current.itemType in dict) {
        // Add the current item's id to the list
        return {
          ...dict,
          [current.itemType]: [...dict[current.itemType], current.id],
        };
      } else {
        // Or make the key on the dict and set the current item as the first in the list
        return {
          ...dict,
          [current.itemType]: [current.id],
        };
      }
    },
    {} as ItemCategoryIds
  );

  console.log(itemData);

  return Array.from({ length: reviewNumber }, (_, i) => {
    const reviewer = randBot();

    console.log(reviewer.name);
  });
}

import { Item, Pokemon } from "@prisma/client";
import { PostData } from "../types";
import { randomPostContent } from "./utils";
import { type Moment } from "moment";

type ItemCategoryIds = {
  [key: string]: number[];
};

export async function randomReviews(
  randBot: () => Pokemon,
  firstPostTime: Moment
): Promise<PostData[]> {
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

  const randItem = (category: string) => {
    const randIndex = Math.round(Math.random() * itemData[category].length);
    return itemData[category][randIndex];
  };

  const categories = Object.keys(itemData);

  return categories.map((_, index) => {
    const reviewer = randBot();
    const itemId = randItem(categories[index]);

    return {
      content: randomPostContent(reviewer.name),
      positive: Math.random() > 0.5,
      itemId,
      posterId: reviewer.id,
      createdAt: firstPostTime.subtract(7 - index, "hours").toDate(),
    };
  }) as PostData[];
}

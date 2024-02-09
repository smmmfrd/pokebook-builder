import { writeFile } from "fs";
import cliProgress, { SingleBar } from "cli-progress";
import { Item } from "@prisma/client";

type PokeFetchResult = {
  name: string;
  url: string;
};

type ResourceResponse = {
  next: string | null;
  results: PokeFetchResult[];
};

type ItemResponse = {
  items: PokeFetchResult[];
};

type ItemData = {
  id: number;
  name: string;
  flavor_text_entries: {
    language: {
      name: string;
    };
    text: string;
  }[];
  sprites: {
    default: string;
  };
};

async function fetchAllBerries(increment: () => void) {
  var berryResults: PokeFetchResult[] = [];
  var next = "https://pokeapi.co/api/v2/berry?limit=20";

  while (next.length > 0) {
    const res = await fetch(next);
    const data: ResourceResponse = (await res.json()) as ResourceResponse;
    berryResults = berryResults.concat(data.results);
    next = data.next || "";
  }

  var berryData = await Promise.all(
    berryResults.map(async ({ url }) => {
      const res = await fetch(url);

      return (await res.json()) as {
        item: PokeFetchResult;
      };
    })
  );

  // console.log(results.map(({ name }) => name).sort((a, b) => (a < b ? -1 : 1)));
  increment();
  return berryData.map(({ item }) => ({ ...item }));
}

async function fetchItemCategory(category: string) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/item-category/${category}`
  );
  if (!res.ok) {
    console.error(category, "failed");
  }
  const data: ItemResponse = (await res.json()) as ItemResponse;

  return data.items;
}

async function fetchFromAllItemCategories(
  categories: string[],
  increment: () => void
) {
  const categoryFetches = categories.map(async (category) => {
    const name = category
      .split("-")
      .map((word, index) =>
        index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join("");

    const data = await fetchItemCategory(category);
    increment();
    return {
      [name]: data,
    };
  });

  const categoryData = await Promise.all(categoryFetches);
  return categoryData.reduce((acc, value) => ({ ...acc, ...value }), {});
}

async function buildItems(data: { [key: string]: PokeFetchResult[] }) {
  const allPromises = Object.keys(data).map(async (key) => {
    let responses = data[key].map(async ({ url }) => await fetch(url));
    const json = await Promise.all(responses);
    const itemData: ItemData[] = await Promise.all(
      json.map(async (dat) => (await dat.json()) as ItemData)
    );
    return itemData;
  });
  const res = await Promise.all(
    allPromises.map(async (promiseArray) => await promiseArray)
  );

  const splitAndCapitalize = (content: string, by: string | RegExp) =>
    content
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Now shape the items to be usable
  const itemLibrary = res.reduce((accumulator, itemCategory, index) => {
    const key = splitAndCapitalize(Object.keys(data)[index], "-");

    return [
      ...accumulator,
      ...itemCategory
        .filter(({ sprites }) => sprites.default != null)
        .map(({ id, name, flavor_text_entries, sprites }) => {
          const effect = flavor_text_entries.reduce((acc, flavor_text) => {
            if (flavor_text.language.name == "en") {
              return flavor_text.text.replace(/\n|\f/g, " ");
            } else {
              return acc;
            }
          }, "");

          return {
            id: id + 2000,
            name: splitAndCapitalize(name, /[A-Z]/),
            itemType: key,
            effect,
            sprite: sprites.default,
          };
        }),
    ];
  }, [] as Item[]);

  return itemLibrary;
}

(async function main() {
  console.log("Fetching Categories");

  const bar = new SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(11, 0);

  // berry/
  const berries = await fetchAllBerries(() => bar.increment());

  // item-category/
  const itemCategories = await fetchFromAllItemCategories(
    [
      "held-items",
      "choice",
      "bad-held-items",
      "healing",
      "revival",
      "standard-balls",
      "status-cures",
      "special-balls",
      "training",
    ],
    () => bar.increment()
  );
  // Need to just keep the first 16
  // There are some bad vitamin data in the API that are probably unused in the games (they don't have data for their sprites, etc.), so we get rid of those, and their indices are > 16 thankfully.
  const vitamins = (await fetchItemCategory("vitamins")).filter(
    (_, i) => i <= 15
  );
  bar.increment();

  const baseItemData = {
    berries,
    ...itemCategories,
    vitamins,
  };

  const itemData = await buildItems(baseItemData);

  writeFile("items.json", JSON.stringify(itemData), "utf-8", (err) => {
    if (err) {
      console.log("Error in writing item data to file", err);
    } else {
      console.log("Finished writing item data to file");
    }
  });

  bar.stop();
})();

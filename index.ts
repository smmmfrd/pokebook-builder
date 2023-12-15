const pokemon = Bun.file("data/pokemon.json");
const pokemonText = await pokemon.text();
const pokemonData = await JSON.parse(pokemonText);
console.log(pokemonData[0]);

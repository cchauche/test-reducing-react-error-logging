import { rest } from "msw";

const responseBody = {
  results: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon/1/",
    },
  ],
};

export const mockPokemon = () => {
  return rest.get("https://pokeapi.co/api/v2/pokemon", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(responseBody));
  });
};

export const mockNotFoundPokemon = () => {
  return rest.get("https://pokeapi.co/api/v2/pokemon", (req, res, ctx) => {
    return res(ctx.status(404));
  });
};

export const mockBadPokemon = () => {
  return rest.get("https://pokeapi.co/api/v2/pokemon", (req, res, ctx) => {
    return res(ctx.status(500));
  });
};

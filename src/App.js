import "./App.css";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const fetchPokemon = () => {
  return axios.get("https://pokeapi.co/api/v2/pokemon");
};

function App() {
  return (
    <div className="App" style={{ textAlign: "left" }}>
      <PokemonList />
    </div>
  );
}

const PokemonList = () => {
  const pokemonQuery = useQuery({
    queryKey: ["pokemons"],
    queryFn: fetchPokemon,
  });

  if (pokemonQuery.isError) {
    if (
      pokemonQuery.error instanceof AxiosError &&
      pokemonQuery.error.response.status === 404
    ) {
      return <div>Not Found</div>;
    }
    throw pokemonQuery.error;
  }

  if (!pokemonQuery.isFetched && !pokemonQuery.data) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {pokemonQuery.data.data.results.map((p) => (
        <li key={p.name}>{p.name}</li>
      ))}
    </ul>
  );
};

export default App;

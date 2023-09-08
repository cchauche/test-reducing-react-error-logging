import logo from "./logo.svg";
import "./App.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

  if (pokemonQuery.isError) throw pokemonQuery.error;

  if (!pokemonQuery.isFetched && !pokemonQuery.data) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {pokemonQuery.data.data.results.map((p) => (
        <li>{p.name}</li>
      ))}
    </ul>
  );
};

export default App;

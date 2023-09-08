import { render, screen } from "@testing-library/react";
import App from "./App";
import { server } from "./mocks/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  mockBadPokemon,
  mockNotFoundPokemon,
  mockPokemon,
} from "./mocks/mockPokemon";
import {
  MemoryRouter,
  Route,
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";
import { routes } from "./routes";

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

const renderWithRouter = () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

test("renders pokemon name", async () => {
  server.use(mockPokemon());
  renderComponent();

  expect(await screen.findByText(/bulbasaur/i)).toBeVisible();
});

test("shows not found for a 404", async () => {
  server.use(mockNotFoundPokemon());
  renderComponent();

  expect(await screen.findByText(/not found/i)).toBeVisible();
});

test("shows error for unexpected errors", async () => {
  server.use(mockBadPokemon());
  renderWithRouter();

  expect(await screen.findByText(/error/i)).toBeVisible();
});

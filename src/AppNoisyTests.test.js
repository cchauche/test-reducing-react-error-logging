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
import { AxiosError } from "axios";

const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: (error) => {
      if (error instanceof AxiosError) {
        return;
      } else if (
        typeof error === "string" &&
        error.match(
          "Passing a custom logger has been deprecated and will be removed in the next major version."
        )
      ) {
        return;
      }
      throw error;
    },
  },
  defaultOptions: { queries: { retry: 0 } },
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

const renderWithRouter = () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

let expectedErrors = 0;
let actualErrors = 0;
function onError(e) {
  e.preventDefault();
  actualErrors++;
}

beforeEach(() => {
  expectedErrors = 0;
  actualErrors = 0;
  window.addEventListener("error", onError);
});

afterEach(() => {
  window.removeEventListener("error", onError);
  expect(actualErrors).toBe(expectedErrors);
  expectedErrors = 0;
});

test("renders pokemon name", async () => {
  server.use(mockPokemon());
  renderComponent();

  expect(await screen.findByText(/bulbasaur/i)).toBeVisible();
});

// This test throws an error, but react-query-v5 doesn't log errors anymore. Run
// this test by itself and there will be no error output
test("shows not found for a 404", async () => {
  server.use(mockNotFoundPokemon());
  renderComponent();

  expect(await screen.findByText(/not found/i)).toBeVisible();
});

describe("Test that purposely throw uncaught errors to an error boundary", () => {
  test("shows error for unexpected errors", async () => {
    server.use(mockBadPokemon());
    renderWithRouter();

    expect(await screen.findByText(/error/i)).toBeVisible();
  });
});

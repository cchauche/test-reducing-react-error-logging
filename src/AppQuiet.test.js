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

// This test throws an error, but react-query-v5 doesn't log errors anymore. Run
// this test by itself and there will be no error output
test("shows not found for a 404", async () => {
  server.use(mockNotFoundPokemon());
  renderComponent();

  expect(await screen.findByText(/not found/i)).toBeVisible();
});

describe("Example of silencing React uncaught error log", () => {
  // This is a method to silence the errors that React logs from uncaught errors.
  // see https://github.com/facebook/react/issues/11098#issuecomment-412682721
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

  // This test has silenced the React Uncaught Error messages but React Router
  // still logs the error caught by the error boundary.
  test("shows error for unexpected errors", async () => {
    expectedErrors = 2;
    server.use(mockBadPokemon());
    renderWithRouter();

    expect(await screen.findByText(/error/i)).toBeVisible();
  });
});

describe("Example of silencing all errors", () => {
  let errorSpy;
  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error");
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  // Test with no errors printed, but potential to swallow helpful errors.
  // Asserting on the number of expected errors can help surface when there is
  // an unexpected error is thrown.
  test("shows error for unexpected errors", async () => {
    errorSpy.mockImplementation(() => null);
    server.use(mockBadPokemon());
    renderWithRouter();

    expect(await screen.findByText(/error/i)).toBeVisible();
    expect(errorSpy).toHaveBeenCalledTimes(4);
    // 4 errors expected:
    //   1: jsdom logs the uncaught error, thrown to trigger error boundary
    //   2: React logs the uncaught error again and then...
    //   3: React logs that the above error occurred in X component
    //   4: react-router throws that it's error boundary caught an error
  });
});

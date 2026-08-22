import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // Data stays fresh for 30s — prevents re-fetch on tab switch
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 60_000, // Preloaded data stays fresh for 60s
    defaultStaleTime: 60_000,        // Loader data treated as fresh for 60s
    defaultPendingMs: 100,           // Avoid jarring flash of loading indicators
  });

  return router;
};

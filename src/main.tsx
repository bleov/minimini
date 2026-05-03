import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "posthog-js/react";
import PocketBase, { type AuthRecord } from "pocketbase";
import { CustomProvider } from "rsuite";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { configureStorage } from "@/lib/storage.ts";
import { GlobalState } from "@/lib/GlobalState.ts";

import "@szhsin/react-menu/dist/core.css";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import "react-simple-keyboard/build/css/index.css";
import "rsuite/dist/rsuite-no-reset.css";
import "./css/rsuite-reset.css";

import "./css/App.css";
import "./css/Index.css";
import "./css/Cascades.css";
import "./css/Connections.css";
import CreateRouter from "./routes/custom/CreateRouter.tsx";
import CustomPage from "./routes/custom/CustomPage.tsx";
import GameRouter from "./routes/custom/GameRouter.tsx";
import NotFound from "./routes/404/NotFound.tsx";

const Index = lazy(() => import("./Index.tsx"));
const CrosswordApp = lazy(() => import("./routes/crossword/App.tsx"));
const Cascades = lazy(() => import("./routes/cascades/App.tsx"));
const ConnectionsApp = lazy(() => import("./routes/connections/App.tsx"));

export const pb_url = import.meta.env.VITE_POCKETBASE_URL || location.origin;

export const pb = new PocketBase(pb_url);

if (import.meta.env.DEV) {
  // @ts-ignore
  window.pb = pb;
}

if (import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.VITE_PUBLIC_POSTHOG_HOST) {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24"
  });
}

configureStorage();

function Main() {
  const [user, setUser] = useState<AuthRecord | null>(pb.authStore.isValid ? pb.authStore.record : null);
  const userRefreshedRef = useRef(false);

  const globalState = {
    user,
    setUser
  };

  useEffect(() => {
    if (user && !userRefreshedRef.current) {
      pb.collection("users")
        .authRefresh()
        .then((newUser) => {
          console.log("Refreshed auth store");
          setUser(newUser.record);
          userRefreshedRef.current = true;
        })
        .catch((err) => {
          if (err.status === 401) {
            console.log("Auth refresh failed, logging out");
            pb.authStore.clear();
            setUser(null);
          } else {
            console.log("Auth refresh temporarily failed");
            console.log(err);
          }
        });
    }
  }, [user]);

  return (
    <GlobalState.Provider value={globalState}>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route path="/mini" element={<CrosswordApp type={"mini"} />} />
            <Route path="/crossword" element={<Navigate to="/daily" replace />} />
            <Route path="/daily" element={<CrosswordApp type={"daily"} />} />
            <Route path="/midi" element={<CrosswordApp type={"midi"} />} />

            <Route path="/cascades" element={<Cascades />} />

            <Route path="/custom" element={<Navigate to="/custom/crosswords" replace />} />
            <Route path="/custom/crosswords" element={<CustomPage type="crossword" />} />
            <Route path="/custom/connections" element={<CustomPage type="connections" />} />
            <Route path="/custom/:id/edit" element={<CreateRouter />}></Route>
            <Route path="/custom/:id" element={<GameRouter />}></Route>

            <Route path="/connections" element={<Navigate to="/connections/today" replace />} />
            <Route path="/connections/:date" element={<ConnectionsApp />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GlobalState.Provider>
  );
}

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary>
      <CustomProvider>
        <Main />
      </CustomProvider>
    </PostHogErrorBoundary>
  </PostHogProvider>
);

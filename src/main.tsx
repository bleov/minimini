import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "posthog-js/react";
import PocketBase, { type AuthRecord } from "pocketbase";
import { CustomProvider } from "rsuite";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Suspense, lazy, useState } from "react";

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
import Create from "./routes/custom/Create.tsx";
import Custom from "./routes/custom/Custom.tsx";

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

  const globalState = {
    user,
    setUser
  };

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

            <Route path="/custom" element={<Custom />} />
            <Route path="/custom/:id/edit" element={<Create />}></Route>
            <Route path="/custom/:id" element={<CrosswordApp type={"custom"} />}></Route>

            <Route path="/connections" element={<ConnectionsApp />} />
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

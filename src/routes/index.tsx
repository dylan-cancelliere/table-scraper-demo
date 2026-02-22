import { createFileRoute } from "@tanstack/react-router";
import App from "../App";
import { Suspense } from "react";
import { Loader } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: () => (
    <Suspense fallback={<Loader />}>
      <App />
    </Suspense>
  ),
});

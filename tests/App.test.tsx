import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "@/App";
import { MemoryRouter } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";

describe("App smoke test", () => {
  it("renders without crashing", () => {
    render(
      <QueryProvider>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryProvider>
    );
    expect(document.body).toBeInTheDocument();
  });
});

import { describe, test, expect } from "vitest";
import * as lib from "../src/index.js";

describe("library exports", () => {
  test("exports defined", () => {
    expect(lib).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";
import {
  includesNormalizedValue,
  intersectByNormalizedValue,
  resolveCompanyList,
  resolveRoleList,
} from "@/lib/referral-matching";

describe("referral-matching", () => {
  it("resolves legacy single company and de-duplicates multi-company lists", () => {
    expect(resolveCompanyList({ company: "Т-Банк" })).toEqual(["Т-Банк"]);
    expect(resolveCompanyList({ companies: [" Т-Банк ", "т-банк", "Яндекс"] })).toEqual(["Т-Банк", "Яндекс"]);
  });

  it("resolves legacy single role and de-duplicates multi-role lists", () => {
    expect(resolveRoleList({ role: "Analyst" })).toEqual(["Analyst"]);
    expect(resolveRoleList({ roles: [" Product Manager ", "product manager", "Analyst"] })).toEqual([
      "Product Manager",
      "Analyst",
    ]);
  });

  it("intersects company lists case-insensitively", () => {
    expect(intersectByNormalizedValue(["Т-Банк", "Яндекс"], ["т-банк", "VK"])).toEqual(["Т-Банк"]);
  });

  it("checks membership case-insensitively", () => {
    expect(includesNormalizedValue(["Т-Банк", "Яндекс"], "т-банк")).toBe(true);
    expect(includesNormalizedValue(["Т-Банк", "Яндекс"], "VK")).toBe(false);
  });
});

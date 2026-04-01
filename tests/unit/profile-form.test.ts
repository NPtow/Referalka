import { describe, expect, it } from "vitest";
import { normalizeProfilePayload, validateProfilePayload } from "@/lib/profile-form";

describe("profile-form", () => {
  it("normalizes and de-duplicates strings in payload", () => {
    const payload = normalizeProfilePayload({
      roles: [" Product Manager ", "product manager", "", "Analyst"],
      companies: [" Т-Банк ", "т-банк", "  ", "Яндекс"],
      vacancyLinks: {
        " Т-Банк ": " https://example.com/tbank ",
        "Яндекс": "https://example.com/yandex",
        " VK ": "https://example.com/vk",
      },
      experience: "4.6",
      location: " Москва ",
      resumeUrl: " https://example.com/resume ",
      resumeText: "",
      telegramContact: " @test ",
      openToRelocation: 1,
      isPublic: "yes",
      shareWithMatchingReferrers: true,
    });

    expect(payload.roles).toEqual(["Product Manager", "Analyst"]);
    expect(payload.companies).toEqual(["Т-Банк", "Яндекс"]);
    expect(payload.vacancyLinks).toEqual({
      "Т-Банк": "https://example.com/tbank",
      "Яндекс": "https://example.com/yandex",
    });
    expect(payload.experience).toBe(5);
    expect(payload.location).toBe("Москва");
    expect(payload.resumeUrl).toBe("https://example.com/resume");
    expect(payload.telegramContact).toBe("@test");
    expect(payload.openToRelocation).toBe(true);
    expect(payload.isPublic).toBe(true);
    expect(payload.shareWithMatchingReferrers).toBe(true);
  });

  it("requires at least one role and one company", () => {
    expect(
      validateProfilePayload(
        normalizeProfilePayload({
          roles: [],
          companies: ["Т-Банк"],
          vacancyLinks: { "Т-Банк": "https://example.com/tbank" },
          resumeText: "resume",
        }),
      ),
    ).toBe("Выбери хотя бы одну роль.");

    expect(
      validateProfilePayload(
        normalizeProfilePayload({
          roles: ["Product Manager"],
          companies: [],
          vacancyLinks: {},
          resumeText: "resume",
        }),
      ),
    ).toBe("Выбери хотя бы одну компанию.");
  });

  it("requires at least one resume source", () => {
    const error = validateProfilePayload(
      normalizeProfilePayload({
        roles: ["Product Manager"],
        companies: ["Т-Банк"],
        vacancyLinks: { "Т-Банк": "https://example.com/tbank" },
      }),
    );

    expect(error).toBe("Добавь резюме файлом, ссылкой или текстом.");
  });

  it("requires a vacancy link for every selected company", () => {
    const error = validateProfilePayload(
      normalizeProfilePayload({
        roles: ["Product Manager"],
        companies: ["Т-Банк", "Яндекс"],
        vacancyLinks: {
          "Т-Банк": "https://example.com/tbank",
        },
        resumeText: "resume",
      }),
    );

    expect(error).toBe("Добавь ссылку на вакансию для каждой выбранной компании.");
  });

  it("rejects invalid vacancy URLs", () => {
    const error = validateProfilePayload(
      normalizeProfilePayload({
        roles: ["Product Manager"],
        companies: ["Т-Банк"],
        vacancyLinks: {
          "Т-Банк": "ftp://example.com/tbank",
        },
        resumeText: "resume",
      }),
    );

    expect(error).toBe("Добавь ссылку на вакансию для каждой выбранной компании.");
  });
});

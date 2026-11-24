import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/api/error";
import ZaehlungService from "@/api/service/ZaehlungService";

describe("ZaehlungService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and saves generated DTOs with calendar dates and nested counting data", async () => {
    const json = {
      id: "zaehlung-1",
      datum: "2026-03-10",
      punkt: { lat: 48.137227, lon: 11.575517 },
      sonderzaehlung: false,
      kreisverkehr: false,
      zaehlIntervall: 15,
      unreadMessagesDienstleister: false,
      knotenarme: [
        { nummer: 1, filename: "zaehlung.csv", strassenname: "Straße" },
      ],
      verkehrsbeziehungen: [
        {
          von: 1,
          nach: 2,
          zeitintervalle: [
            { startUhrzeit: "00:00", endeUhrzeit: "00:15", pkw: 42 },
          ],
        },
      ],
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([json]), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: json.id }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const [zaehlung] = await ZaehlungService.getAllRelevantZaehlungen();

    expect(zaehlung.datum).toEqual(new Date(2026, 2, 10));
    expect(zaehlung.punkt).toEqual(json.punkt);
    expect(zaehlung.knotenarme).toEqual(json.knotenarme);
    expect(zaehlung.verkehrsbeziehungen?.[0].zeitintervalle).toEqual(
      json.verkehrsbeziehungen[0].zeitintervalle
    );
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/zaehlung/getZaehlungenForExternal"
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "GET",
      credentials: "include",
      redirect: "manual",
    });

    await ZaehlungService.saveExternalZaehlung(zaehlung);

    expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string)).toEqual(
      json
    );
    expect(fetchMock.mock.calls[1][0]).toContain("/zaehlung/saveExternal");
  });

  it("converts backend failures into an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 500 }))
    );

    await expect(
      ZaehlungService.getAllRelevantZaehlungen()
    ).rejects.toBeInstanceOf(ApiError);
  });
});

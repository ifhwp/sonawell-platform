import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recordFailedLead } from "./lead-fallback";

const SAMPLE = {
  firstName: "Jane",
  email: "jane@example.com",
  archetype: "hormone" as const,
  reason: "Kit 500",
};

describe("recordFailedLead", () => {
  const fetchMock = vi.fn();
  let consoleErrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    consoleErrSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.FAILED_LEAD_WEBHOOK_URL;
    delete process.env.FAILED_LEAD_WEBHOOK_KIND;
  });

  it("logs and does not fetch when no webhook is configured", async () => {
    await recordFailedLead(SAMPLE);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleErrSpy).toHaveBeenCalled();
  });

  it("posts a Slack-shaped payload by default", async () => {
    process.env.FAILED_LEAD_WEBHOOK_URL = "https://hooks.slack.example/x";
    await recordFailedLead(SAMPLE);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty("text");
    expect(body).not.toHaveProperty("content");
    expect(body.text).toContain("jane@example.com");
    expect(body.text).toContain("hormone");
  });

  it("posts a Discord-shaped payload when configured", async () => {
    process.env.FAILED_LEAD_WEBHOOK_URL = "https://discord.example/hook";
    process.env.FAILED_LEAD_WEBHOOK_KIND = "discord";
    await recordFailedLead({ ...SAMPLE, archetype: "insulin" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty("content");
    expect(body).not.toHaveProperty("text");
    expect(body.content).toContain("insulin");
  });

  it("does not throw when fetch rejects", async () => {
    process.env.FAILED_LEAD_WEBHOOK_URL = "https://hooks.slack.example/x";
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    await expect(recordFailedLead(SAMPLE)).resolves.toBeUndefined();
    expect(consoleErrSpy).toHaveBeenCalled();
  });

  it("logs and does not throw when the webhook returns non-2xx", async () => {
    process.env.FAILED_LEAD_WEBHOOK_URL = "https://hooks.slack.example/x";
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    await recordFailedLead(SAMPLE);
    expect(consoleErrSpy).toHaveBeenCalled();
  });
});

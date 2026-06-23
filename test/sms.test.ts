import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendOtpSms, SmsError } from "../src/lib/sms";

describe("sendOtpSms (MSG91)", () => {
  beforeEach(() => {
    vi.stubEnv("MSG91_AUTHKEY", "");
    vi.stubEnv("MSG91_TEMPLATE_ID", "");
    vi.stubEnv("MSG91_OTP_VAR", "");
    vi.stubEnv("MSG91_SENDER_ID", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws SmsError when not configured", async () => {
    await expect(sendOtpSms("9876543210", "123456")).rejects.toBeInstanceOf(SmsError);
  });

  it("posts to MSG91 with country-coded number and the OTP variable", async () => {
    vi.stubEnv("MSG91_AUTHKEY", "key123");
    vi.stubEnv("MSG91_TEMPLATE_ID", "tmpl123");
    vi.stubEnv("MSG91_OTP_VAR", "otp");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ type: "success" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await sendOtpSms("9876543210", "456789");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("msg91.com");
    expect((init as RequestInit).headers).toMatchObject({ authkey: "key123" });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.template_id).toBe("tmpl123");
    expect(body.recipients[0].mobiles).toBe("919876543210");
    expect(body.recipients[0].otp).toBe("456789");
  });

  it("throws SmsError when MSG91 returns an error payload", async () => {
    vi.stubEnv("MSG91_AUTHKEY", "key123");
    vi.stubEnv("MSG91_TEMPLATE_ID", "tmpl123");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ type: "error", message: "bad template" }), { status: 200 }),
      ),
    );

    await expect(sendOtpSms("9876543210", "456789")).rejects.toThrow(/bad template/);
  });

  it("throws SmsError when the network call fails", async () => {
    vi.stubEnv("MSG91_AUTHKEY", "key123");
    vi.stubEnv("MSG91_TEMPLATE_ID", "tmpl123");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(sendOtpSms("9876543210", "456789")).rejects.toBeInstanceOf(SmsError);
  });
});

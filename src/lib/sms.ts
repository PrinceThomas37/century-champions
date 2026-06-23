// SMS delivery via MSG91 (https://msg91.com).
//
// We keep our own OTP generation/verification (see otp.ts) and use MSG91 purely
// as the sender — so swapping providers later means changing only this file.
//
// Required env (only when DEV_OTP_MODE=false):
//   MSG91_AUTHKEY      — your MSG91 auth key
//   MSG91_TEMPLATE_ID  — the DLT-approved Flow template id that contains the OTP variable
// Optional:
//   MSG91_OTP_VAR      — the template variable name that holds the code (default "otp")
//   MSG91_SENDER_ID    — sender id, if your Flow requires it passed per request
//
// The DLT template should read something like:
//   "##otp## is your Century Champions login code. Do not share it."
// where ##otp## is the variable named by MSG91_OTP_VAR.

export class SmsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmsError";
  }
}

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";

// Send the OTP code to a 10-digit Indian mobile number via MSG91.
// Throws SmsError on misconfiguration or delivery failure.
export async function sendOtpSms(phone10: string, code: string): Promise<void> {
  const authkey = process.env.MSG91_AUTHKEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const otpVar = process.env.MSG91_OTP_VAR || "otp";
  const senderId = process.env.MSG91_SENDER_ID;

  if (!authkey || !templateId) {
    throw new SmsError(
      "SMS is not configured. Set MSG91_AUTHKEY and MSG91_TEMPLATE_ID (or keep DEV_OTP_MODE=true).",
    );
  }

  const recipient: Record<string, string> = {
    mobiles: `91${phone10}`,
    [otpVar]: code,
  };

  const body: Record<string, unknown> = {
    template_id: templateId,
    short_url: "0",
    recipients: [recipient],
  };
  if (senderId) body.sender = senderId;

  // Guard against a hung request so a login attempt can't stall forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(MSG91_FLOW_URL, {
      method: "POST",
      headers: {
        authkey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    throw new SmsError(
      `Could not reach the SMS provider${err instanceof Error ? `: ${err.message}` : ""}`,
    );
  } finally {
    clearTimeout(timeout);
  }

  // MSG91 returns 200 with { type: "success" | "error", message }.
  const text = await res.text();
  let parsed: { type?: string; message?: string } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // non-JSON body — fall through to status check
  }

  if (!res.ok || parsed.type === "error") {
    throw new SmsError(
      `SMS provider rejected the request${parsed.message ? `: ${parsed.message}` : ` (HTTP ${res.status})`}`,
    );
  }
}

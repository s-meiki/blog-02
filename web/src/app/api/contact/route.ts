import { NextResponse } from "next/server";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  token: string;
};

type TurnstileVerification = {
  success: boolean;
  "error-codes"?: string[];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const truncate = (value: string, limit: number) => (value.length <= limit ? value : `${value.slice(0, limit - 3)}...`);

const buildDiscordPayload = ({ name, email, message }: ContactPayload) => ({
  username: "Website Contact Bot",
  embeds: [
    {
      title: "新しいお問い合わせ",
      color: 3564635,
      fields: [
        { name: "お名前", value: truncate(name, 1024), inline: true },
        { name: "メールアドレス", value: truncate(email, 1024), inline: true },
        { name: "内容", value: truncate(message, 1024), inline: false },
      ],
      timestamp: new Date().toISOString(),
    },
  ],
});

const buildSlackPayload = ({ name, email, message }: ContactPayload) => ({
  text: "新しいお問い合わせ",
  attachments: [
    {
      color: "#4B647F",
      title: "新しいお問い合わせ",
      fields: [
        { title: "お名前", value: name, short: true },
        { title: "メールアドレス", value: email, short: true },
        { title: "内容", value: message, short: false },
      ],
      ts: `${Math.floor(Date.now() / 1000)}`,
    },
  ],
});

const parseContactPayload = (input: unknown): ContactPayload | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const body = input as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!name || !email || !message || !token) {
    return null;
  }

  if (name.length > MAX_NAME_LENGTH || email.length > MAX_EMAIL_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return null;
  }

  if (!EMAIL_REGEX.test(email)) {
    return null;
  }

  return { name, email, message, token };
};

const isDiscordWebhook = (webhookUrl: string) => {
  try {
    const url = new URL(webhookUrl);
    return url.hostname.includes("discord.com") || url.hostname.includes("discordapp.com");
  } catch {
    return false;
  }
};

const extractRemoteIp = (request: Request) => {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return undefined;
  return forwarded.split(",")[0]?.trim();
};

export async function POST(request: Request) {
  const turnstileSecret = process.env.CF_SECRET_KEY;
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!turnstileSecret || !webhookUrl) {
    return NextResponse.json({ error: "サーバー設定が不足しています。" }, { status: 500 });
  }

  const requestBody = await request.json().catch(() => null);
  const payload = parseContactPayload(requestBody);
  if (!payload) {
    return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const verificationParams = new URLSearchParams({
    secret: turnstileSecret,
    response: payload.token,
  });
  const remoteIp = extractRemoteIp(request);
  if (remoteIp) {
    verificationParams.set("remoteip", remoteIp);
  }

  const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verificationParams.toString(),
  });

  if (!verifyResponse.ok) {
    return NextResponse.json({ error: "bot判定の検証に失敗しました。" }, { status: 502 });
  }

  const verifyResult = (await verifyResponse.json().catch(() => null)) as TurnstileVerification | null;
  if (!verifyResult?.success) {
    return NextResponse.json({ error: "ボット判定により送信できませんでした。" }, { status: 400 });
  }

  const webhookPayload = isDiscordWebhook(webhookUrl) ? buildDiscordPayload(payload) : buildSlackPayload(payload);
  const webhookResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(webhookPayload),
  });

  if (!webhookResponse.ok) {
    return NextResponse.json({ error: "通知の送信に失敗しました。" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

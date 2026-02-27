"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type ContactResponse = {
  error?: string;
};

export const ContactForm = () => {
  const siteKey = process.env.NEXT_PUBLIC_CF_SITE_KEY;
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderTurnstile = useCallback(() => {
    if (!siteKey || !window.turnstile || !widgetContainerRef.current || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
      sitekey: siteKey,
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
  }, [siteKey]);

  const resetTurnstile = useCallback(() => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setTurnstileToken("");
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    renderTurnstile();

    const interval = window.setInterval(() => {
      if (widgetIdRef.current) {
        window.clearInterval(interval);
        return;
      }
      if (window.turnstile) {
        renderTurnstile();
      }
    }, 300);

    return () => window.clearInterval(interval);
  }, [renderTurnstile, siteKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setStatusMessage("");

    if (!turnstileToken) {
      setStatus("error");
      setStatusMessage("ボット判定が完了していません。");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          token: turnstileToken,
        }),
      });

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as ContactResponse | null;
        setStatus("error");
        setStatusMessage(responseBody?.error ?? "送信に失敗しました。時間をおいて再度お試しください。");
        resetTurnstile();
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatus("success");
      setStatusMessage("送信しました。");
      resetTurnstile();
    } catch {
      setStatus("error");
      setStatusMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderTurnstile}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-neutral-700">
          <span>お名前</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={80}
            className="w-full rounded-xl border border-primary-900/15 bg-white px-4 py-3 text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-neutral-700">
          <span>メールアドレス</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={120}
            className="w-full rounded-xl border border-primary-900/15 bg-white px-4 py-3 text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-neutral-700">
        <span>お問い合わせ内容</span>
        <textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={7}
          className="w-full rounded-xl border border-primary-900/15 bg-white px-4 py-3 text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
      </label>

      <div className="space-y-2">
        <div ref={widgetContainerRef} />
        {!siteKey && (
          <p className="text-sm font-medium text-red-700">
            Turnstile site key が設定されていないため送信できません。
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !turnstileToken || !siteKey}
        className="inline-flex items-center justify-center rounded-full bg-primary-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "送信中..." : "送信する"}
      </button>

      {status !== "idle" && (
        <p
          className={`text-sm font-medium ${
            status === "success" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {statusMessage}
        </p>
      )}
    </form>
  );
};

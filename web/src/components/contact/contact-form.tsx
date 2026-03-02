"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderTurnstile}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-neutral-700">
          <span className="inline-flex items-center gap-2">
            お名前
            <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-600">Required</span>
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={80}
            placeholder="例) 山田 太郎"
            className="w-full rounded-2xl border border-primary-900/15 bg-white px-4 py-3 text-neutral-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-neutral-700">
          <span className="inline-flex items-center gap-2">
            メールアドレス
            <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-600">Required</span>
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={120}
            placeholder="example@company.com"
            className="w-full rounded-2xl border border-primary-900/15 bg-white px-4 py-3 text-neutral-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-neutral-700">
        <span className="inline-flex items-center gap-2">
          お問い合わせ内容
          <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-600">Required</span>
        </span>
        <textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={7}
          placeholder="ご相談内容や目的、希望時期などをご記入ください。"
          className="w-full rounded-2xl border border-primary-900/15 bg-white px-4 py-3 text-neutral-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
      </label>

      <div className="space-y-2 rounded-2xl border border-dashed border-primary-900/20 bg-neutral-50/90 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-neutral-600">
          <Sparkles className="h-3.5 w-3.5 text-accent-500" />
          不正送信防止のため bot 判定を行います
        </p>
        <div ref={widgetContainerRef} className="min-h-[66px]" />
        {!siteKey && (
          <p className="text-sm font-medium text-red-700">
            Turnstile site key が設定されていないため送信できません。
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !turnstileToken || !siteKey}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:from-primary-700 hover:to-primary-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "送信中..." : "送信する"}
      </button>

      {status !== "idle" && (
        <div
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${
            status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p>{statusMessage}</p>
        </div>
      )}
    </form>
  );
};

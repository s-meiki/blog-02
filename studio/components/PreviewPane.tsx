'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { SanityDocument } from "sanity";

const ENV_BASE_URL = import.meta.env.SANITY_STUDIO_PREVIEW_URL;
const DEFAULT_BASE_URL = "http://localhost:3000";
const PREVIEW_SECRET = import.meta.env.SANITY_STUDIO_PREVIEW_SECRET ?? "";
const STORAGE_KEY = "sanity-preview-base-url";

type PreviewPaneProps = {
  document: {
    displayed?: (SanityDocument & { slug?: { current?: string | null } }) | null;
  };
};

type PreviewTarget = {
  path: string;
  slug?: string;
};

type ConnectionStatus = "idle" | "checking" | "ok" | "error";

const buildPreviewTarget = (doc: SanityDocument & { slug?: { current?: string | null } }): PreviewTarget | null => {
  const slug = doc.slug?.current ?? null;

  switch (doc._type) {
    case "post": {
      if (!slug) return null;
      return { path: `/blog/${slug}`, slug };
    }
    case "page": {
      if (!slug) return null;
      if (slug === "home" || slug === "index") {
        return { path: "/", slug };
      }
      return { path: `/${slug}`, slug };
    }
    default:
      return null;
  }
};

const normalizeBaseUrl = (candidate: string) => {
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.origin;
  } catch (error) {
    console.error("無効なプレビューベースURLです", error, candidate);
    return null;
  }
};

const resolveInitialBaseUrl = () => ENV_BASE_URL ?? DEFAULT_BASE_URL;

const readStoredBaseUrl = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("プレビューベースURLの取得に失敗しました", error);
    return null;
  }
};

const getBaseUrlCandidates = (currentBase: string | null) => {
  if (typeof window === "undefined") return [] as string[];

  const { protocol, hostname, port } = window.location;
  const candidates = new Set<string>();

  const addCandidate = (value?: string | null) => {
    if (!value) return;
    const normalized = normalizeBaseUrl(value);
    if (normalized) {
      candidates.add(normalized);
    }
  };

  addCandidate(currentBase);
  addCandidate(ENV_BASE_URL);
  addCandidate(readStoredBaseUrl());
  addCandidate(DEFAULT_BASE_URL);

  if (hostname === "localhost") {
    addCandidate(`${protocol}//${hostname}:3000`);
    addCandidate(`${protocol}//${hostname}:3333`);
    addCandidate(`${protocol}//${hostname}:3334`);

    const portNumber = Number.parseInt(port || "", 10);
    if (!Number.isNaN(portNumber)) {
      addCandidate(`${protocol}//${hostname}:${portNumber}`);
      addCandidate(`${protocol}//${hostname}:${portNumber + 1}`);
      if (portNumber > 0) {
        addCandidate(`${protocol}//${hostname}:${portNumber - 1}`);
      }
    }
  } else {
    addCandidate(`${protocol}//${hostname}`);
  }

  return Array.from(candidates);
};

const buildPreviewUrl = (
  doc: SanityDocument & { slug?: { current?: string | null } },
  baseUrl: string,
) => {
  const target = buildPreviewTarget(doc);

  if (!target) return null;

  try {
    const url = new URL("/api/preview", baseUrl);
    url.searchParams.set("type", doc._type);
    url.searchParams.set("path", target.path);

    if (target.slug) {
      url.searchParams.set("slug", target.slug);
    }

    if (PREVIEW_SECRET) {
      url.searchParams.set("secret", PREVIEW_SECRET);
    }

    return url.toString();
  } catch (error) {
    console.error("プレビューURLの生成に失敗しました", error);
    return null;
  }
};

const paneContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

const iframeStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  border: 0,
  backgroundColor: "#fff",
};

export default function PreviewPane({ document }: PreviewPaneProps) {
  const doc = document.displayed;
  const [baseUrl, setBaseUrl] = useState<string>(() => resolveInitialBaseUrl());
  const [customBase, setCustomBase] = useState<string>(baseUrl);
  const [baseError, setBaseError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [hasUserSetBase, setHasUserSetBase] = useState(false);
  const [autoDetectComplete, setAutoDetectComplete] = useState(false);
  const previewUrl = useMemo(
    () => (doc ? buildPreviewUrl(doc, baseUrl) : null),
    [baseUrl, doc?._id, doc?._rev, doc?._updatedAt, doc?.slug?.current, doc?._type],
  );
  const [iframeKey, setIframeKey] = useState(0);

  const pingBaseUrl = useCallback(async (origin: string) => {
    try {
      const url = new URL("/api/preview/status", origin);
      const response = await fetch(url.toString(), {
        method: "GET",
        mode: "cors",
      });
      if (!response.ok) {
        return false;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        return false;
      }

      try {
        const data = (await response.json()) as { ok?: boolean } | null;
        return Boolean(data?.ok);
      } catch (error) {
        console.warn("プレビューサーバーのレスポンス解析に失敗しました", error);
        return false;
      }
    } catch (error) {
      console.warn("プレビューサーバーへの接続確認に失敗しました", error);
      return false;
    }
  }, []);

  useEffect(() => {
    setIframeKey((previous) => previous + 1);
  }, [previewUrl]);

  useEffect(() => {
    if (typeof window === "undefined" || autoDetectComplete || hasUserSetBase) {
      return;
    }

    let cancelled = false;
    const candidates = getBaseUrlCandidates(baseUrl);

    if (candidates.length === 0) {
      setAutoDetectComplete(true);
      return;
    }

    const detect = async () => {
      for (const candidate of candidates) {
        if (cancelled) return;
        setConnectionStatus("checking");
        setConnectionMessage(null);

        const isReachable = await pingBaseUrl(candidate);
        if (cancelled) return;

        if (isReachable) {
          setBaseUrl(candidate);
          setCustomBase(candidate);
          setConnectionStatus("ok");
          setConnectionMessage(null);
          setAutoDetectComplete(true);
          return;
        }
      }

      if (!cancelled) {
        setConnectionStatus("error");
        setConnectionMessage("Next.js サーバーに接続できません。開発サーバーを起動し、URL を確認してください。");
        setAutoDetectComplete(true);
      }
    };

    detect();

    return () => {
      cancelled = true;
    };
  }, [autoDetectComplete, baseUrl, hasUserSetBase, pingBaseUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, baseUrl);
    } catch (error) {
      console.warn("プレビューベースURLの保存に失敗しました", error);
    }
  }, [baseUrl]);

  useEffect(() => {
    setCustomBase(baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    if (!baseUrl) return;

    let cancelled = false;
    setConnectionStatus("checking");
    setConnectionMessage(null);

    pingBaseUrl(baseUrl).then((isReachable) => {
      if (cancelled) return;

      if (isReachable) {
        setConnectionStatus("ok");
        setConnectionMessage(null);
      } else {
        setConnectionStatus("error");
        setConnectionMessage("プレビュー用 URL に接続できません。サーバーが起動しているか確認してください。");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, pingBaseUrl]);

  const handleBaseUrlSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setBaseError(null);

      const normalized = normalizeBaseUrl(customBase);
      if (!normalized) {
        setBaseError("有効なURLを入力してください (例: http://localhost:3000)");
        return;
      }

      setHasUserSetBase(true);
      setAutoDetectComplete(true);
      setBaseUrl(normalized);
    },
    [customBase],
  );

  const handleIframeLoad = useCallback(() => {
    setConnectionStatus((previous) => (previous === "checking" ? "ok" : previous));
    setConnectionMessage(null);
  }, []);

  const handleIframeError = useCallback(() => {
    setConnectionStatus("error");
    setConnectionMessage("プレビューの読み込みに失敗しました。URL とサーバーの起動状況を確認してください。");
  }, []);

  const statusLabelMap: Record<ConnectionStatus, string> = {
    idle: "未確認",
    checking: "接続確認中…",
    ok: "接続済み",
    error: "接続できません",
  };

  const statusColorMap: Record<ConnectionStatus, string> = {
    idle: "#a1a1aa",
    checking: "#f59e0b",
    ok: "#16a34a",
    error: "#dc2626",
  };

  if (!doc) {
    return (
      <div style={paneContainerStyle}>
        <div style={{ padding: "1rem" }}>ドキュメントを選択するとプレビューが表示されます。</div>
      </div>
    );
  }

  const statusDotStyle: CSSProperties = {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: statusColorMap[connectionStatus],
  };

  return (
    <div style={paneContainerStyle}>
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #e4e4e7",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#71717a" }}>プレビューは保存後に更新されます。</span>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.875rem", color: "#2563eb" }}
            >
              新しいタブで開く
            </a>
          )}
        </div>
        <form
          onSubmit={handleBaseUrlSubmit}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <label htmlFor="preview-base-url" style={{ fontSize: "0.75rem", color: "#52525b" }}>
            ベースURL:
          </label>
          <input
            id="preview-base-url"
            type="text"
            value={customBase}
            onChange={(event) => setCustomBase(event.target.value)}
            placeholder="http://localhost:3000"
            style={{
              minWidth: "220px",
              flex: 1,
              border: "1px solid #d4d4d8",
              borderRadius: "6px",
              padding: "0.35rem 0.5rem",
              fontSize: "0.8125rem",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#f1f5f9",
              border: "1px solid #d4d4d8",
              borderRadius: "6px",
              padding: "0.35rem 0.65rem",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            更新
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem" }}>
            <span style={statusDotStyle} aria-hidden="true" />
            <span style={{ color: statusColorMap[connectionStatus] }}>{statusLabelMap[connectionStatus]}</span>
          </div>
        </form>
        {baseError && <p style={{ color: "#dc2626", fontSize: "0.75rem" }}>{baseError}</p>}
        {connectionMessage && (
          <p style={{ color: "#dc2626", fontSize: "0.75rem" }}>{connectionMessage}</p>
        )}
      </div>
      {previewUrl ? (
        <div style={{ position: "relative", flex: 1, display: "flex" }}>
          {connectionStatus === "error" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                textAlign: "center",
                background: "linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.98))",
              }}
            >
              <div style={{ maxWidth: "320px", color: "#52525b", lineHeight: 1.5 }}>
                プレビューサーバーにアクセスできません。Next.js の開発サーバーが起動しているか、URL に間違いがないか確認してください。
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            src={previewUrl}
            style={iframeStyle}
            title="Preview"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      ) : (
        <div style={{ padding: "1rem" }}>
          プレビューを表示するにはスラッグを設定し、ドキュメントを保存してください。
        </div>
      )}
    </div>
  );
}

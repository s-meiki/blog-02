import Image from "next/image";
import ReactMarkdown, { type Components as MarkdownComponents } from "react-markdown";
import remarkGfm from "remark-gfm";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import { toString } from "mdast-util-to-string";
import type { ReactNode } from "react";
import type { Element, Text as HastText } from "hast";

import { urlForImage } from "@/lib/image";
import { createHeadingIdGenerator } from "@/lib/utils/headings";
import { cn } from "@/lib/utils/cn";

type PortableOrMarkdown = {
  portable?: PortableTextBlock[] | null;
  markdown?: string | null;
};

type ImageValue = {
  asset: { _ref: string };
  alt?: string;
  caption?: string;
  credit?: string;
};

type CodeBlockValue = {
  code: string;
  filename?: string;
};

type TweetEmbedValue = {
  url?: string | null;
};

type YouTubeEmbedValue = {
  url?: string | null;
  title?: string | null;
};

const buildTweetEmbedUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    const normalized = new URL(url, "https://twitter.com");
    return `https://twitframe.com/show?url=${encodeURIComponent(normalized.toString())}`;
  } catch (error) {
    console.warn("Invalid Tweet URL", url, error);
    return null;
  }
};

const renderTweetEmbed = (value: TweetEmbedValue) => {
  const embedUrl = buildTweetEmbedUrl(value?.url);
  if (!embedUrl) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
      <iframe
        src={embedUrl}
        title="X (Twitter) embed"
        loading="lazy"
        className="w-full"
        style={{ minHeight: "550px" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
      />
    </div>
  );
};

const buildYouTubeEmbedUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    const videoUrl = new URL(url, "https://www.youtube.com");
    let videoId = videoUrl.searchParams.get("v");

    if (!videoId) {
      const strippedPath = videoUrl.pathname.replace(/^\/+/, "");
      if (!strippedPath) {
        videoId = null;
      } else if (videoUrl.hostname.includes("youtu.be")) {
        videoId = strippedPath;
      } else {
        const matches = strippedPath.match(/^(?:embed|shorts|v)\/([^/?]+)/);
        videoId = matches?.[1] ?? (strippedPath !== "watch" ? strippedPath : null);
      }
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    console.warn("Invalid YouTube URL", url, error);
    return null;
  }
};

const renderYouTubeEmbed = (value: YouTubeEmbedValue) => {
  const embedUrl = buildYouTubeEmbedUrl(value?.url);
  if (!embedUrl) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-neutral-200 bg-black">
      <iframe
        src={embedUrl}
        title={value?.title ?? "YouTube video"}
        loading="lazy"
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const getPortableBlockText = (block: PortableTextBlock) => {
  const spans = block.children as PortableTextSpan[] | undefined;
  return spans?.map((child) => child.text ?? "").join("") ?? "";
};

const createPortableTextComponents = (): PortableTextComponents => {
  const generateHeadingId = createHeadingIdGenerator();

  return {
    types: {
      imageWithCaption: ({ value }: { value: ImageValue }) => {
        if (!value?.asset?._ref) return null;
        const image = urlForImage(value).width(960).fit("max").auto("format").url();
        return (
          <figure className="my-8">
            <Image
              src={image}
              alt={value.alt || ""}
              width={960}
              height={540}
              className="mx-auto rounded-2xl shadow-soft"
              loading="lazy"
            />
            {(value.caption || value.credit) && (
              <figcaption className="mt-3 text-center text-sm text-neutral-500">
                {value.caption && <span>{value.caption}</span>}
                {value.credit && <span className="ml-2">© {value.credit}</span>}
              </figcaption>
            )}
          </figure>
        );
      },
      codeBlock: ({ value }: { value: CodeBlockValue }) => (
        <pre className="prose-code my-6 overflow-x-auto rounded-xl bg-primary-900/95 p-4 text-sm text-neutral-100">
          {value.filename && (
            <div className="mb-2 text-xs uppercase tracking-[0.4em] text-neutral-300">{value.filename}</div>
          )}
          <code>{value.code}</code>
        </pre>
      ),
      tweetEmbed: ({ value }: { value: TweetEmbedValue }) => renderTweetEmbed(value),
      youtubeEmbed: ({ value }: { value: YouTubeEmbedValue }) => renderYouTubeEmbed(value),
    },
    marks: {
      link: ({ children, value }) => {
        const isExternal = value?.href?.startsWith("http");
        return (
          <a
            href={value?.href}
            className="text-primary-700 underline decoration-accent-300 underline-offset-6 transition hover:text-primary-600"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            {children}
          </a>
        );
      },
    },
    block: {
      h2: ({ children, value }) => {
        const text = value && typeof value === "object" ? getPortableBlockText(value as PortableTextBlock) : "";
        const id = text ? generateHeadingId(text) : undefined;
        return (
          <h2 id={id} className="scroll-mt-24">
            {children}
          </h2>
        );
      },
      h3: ({ children, value }) => {
        const text = value && typeof value === "object" ? getPortableBlockText(value as PortableTextBlock) : "";
        const id = text ? generateHeadingId(text) : undefined;
        return (
          <h3 id={id} className="scroll-mt-24">
            {children}
          </h3>
        );
      },
      h4: ({ children, value }) => {
        const text = value && typeof value === "object" ? getPortableBlockText(value as PortableTextBlock) : "";
        const id = text ? generateHeadingId(text) : undefined;
        return (
          <h4 id={id} className="scroll-mt-24">
            {children}
          </h4>
        );
      },
    },
  };
};

const isLikelyTwitterUrl = (candidate: string) => {
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    return host === "twitter.com" || host === "www.twitter.com" || host === "x.com" || host === "www.x.com";
  } catch {
    return false;
  }
};

const isLikelyYouTubeUrl = (candidate: string) => {
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    return host.includes("youtube.com") || host === "youtu.be" || host === "www.youtu.be";
  } catch {
    return false;
  }
};

const extractEmbedFromParagraph = (node: Element | undefined): ReactNode | null => {
  if (!node?.children || node.children.length !== 1) return null;
  const child = node.children[0] as Element | HastText;
  let url: string | null = null;

  if (child.type === "element" && child.tagName === "a" && typeof child.properties?.href === "string") {
    url = child.properties.href as string;
  } else if (child.type === "text") {
    const textNode = child as HastText;
    if (typeof textNode.value === "string") {
      url = textNode.value.trim();
    }
  }

  if (!url) return null;

  const trimmed = url.trim();
  if (isLikelyTwitterUrl(trimmed)) {
    return renderTweetEmbed({ url: trimmed });
  }

  if (isLikelyYouTubeUrl(trimmed)) {
    return renderYouTubeEmbed({ url: trimmed });
  }

  return null;
};

const MarkdownBody = ({ markdown }: { markdown: string }) => {
  const generateHeadingId = createHeadingIdGenerator();

  const markdownComponents: MarkdownComponents = {
    h2: (props) => {
      const text = props.node ? toString(props.node).trim() : "";
      const id = text ? generateHeadingId(text) : undefined;
      const { children, ...rest } = props;
      return (
        <h2 id={id} className="scroll-mt-24" {...rest}>
          {children}
        </h2>
      );
    },
    h3: (props) => {
      const text = props.node ? toString(props.node).trim() : "";
      const id = text ? generateHeadingId(text) : undefined;
      const { children, ...rest } = props;
      return (
        <h3 id={id} className="scroll-mt-24" {...rest}>
          {children}
        </h3>
      );
    },
    h4: (props) => {
      const text = props.node ? toString(props.node).trim() : "";
      const id = text ? generateHeadingId(text) : undefined;
      const { children, ...rest } = props;
      return (
        <h4 id={id} className="scroll-mt-24" {...rest}>
          {children}
        </h4>
      );
    },
    p: (props) => {
      const { node, children, ...rest } = props as { node?: Element; children: ReactNode };
      const embed = extractEmbedFromParagraph(node);
      if (embed) {
        return embed;
      }
      return (
        <p {...rest}>
          {children}
        </p>
      );
    },
    a: (props) => {
      const isExternal = props.href?.startsWith("http");
      const { children, ...rest } = props;
      return (
        <a
          href={props.href}
          className="text-primary-700 underline decoration-accent-300 underline-offset-6 transition hover:text-primary-600"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          {...rest}
        >
          {children}
        </a>
      );
    },
    pre: ({ children, className, ...rest }) => (
      <pre className={cn("prose-code my-6 overflow-x-auto rounded-xl bg-primary-900/95 p-4 text-sm text-neutral-100", className)} {...rest}>
        {children}
      </pre>
    ),
    code: ({ inline, className, children, ...props }) =>
      inline ? (
        <code className={cn("rounded bg-neutral-100 px-1 py-0.5 text-sm text-primary-800", className)} {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-200 bg-primary-50/60 p-4 text-neutral-700">{children}</blockquote>
    ),
    img: ({ src, alt }) =>
      src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="mx-auto rounded-2xl shadow-soft" loading="lazy" />
      ) : null,
    ul: ({ children }) => <ul className="list-disc pl-6 text-neutral-700">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 text-neutral-700">{children}</ol>,
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left">{children}</th>,
    td: ({ children }) => <td className="border border-neutral-200 px-3 py-2">{children}</td>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {markdown}
    </ReactMarkdown>
  );
};

export const RichTextContent = ({ portable, markdown }: PortableOrMarkdown) => {
  const hasMarkdown = typeof markdown === "string" && markdown.trim().length > 0;
  if (hasMarkdown) {
    return (
      <div className="prose prose-neutral max-w-none">
        <MarkdownBody markdown={markdown!} />
      </div>
    );
  }

  if (portable && portable.length > 0) {
    return (
      <div className="prose prose-neutral max-w-none">
        <PortableText value={portable} components={createPortableTextComponents()} />
      </div>
    );
  }

  return null;
};

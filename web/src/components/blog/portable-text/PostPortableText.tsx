import Image from "next/image";
import { PortableTextComponents, PortableText } from "@portabletext/react";

import { urlForImage } from "@/lib/image";
import type { PostDetail } from "@/lib/sanity/types";

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

const components: PortableTextComponents = {
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
        {value.filename && <div className="mb-2 text-xs uppercase tracking-[0.4em] text-neutral-300">{value.filename}</div>}
        <code>{value.code}</code>
      </pre>
    ),
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
};

export const PostPortableText = ({ value }: { value: PostDetail["body"] }) => (
  <div className="prose prose-neutral max-w-none">
    <PortableText value={value} components={components} />
  </div>
);

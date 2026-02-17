import { useEffect, useMemo } from "react";
import { PatchEvent, set, setIfMissing, type ObjectInputProps, useFormValue } from "sanity";

import {
  deriveSeoDescription,
  deriveSeoOgImage,
  deriveSeoTitle,
  isSameSeoImage,
} from "../lib/seoAuto";

type SeoValue = {
  title?: string;
  description?: string;
  ogImage?: unknown;
};

export const AutoSeoInput = (props: ObjectInputProps<SeoValue>) => {
  const title = useFormValue(["title"]);
  const excerpt = useFormValue(["excerpt"]);
  const bodyMarkdown = useFormValue(["bodyMarkdown"]);
  const body = useFormValue(["body"]);
  const coverImage = useFormValue(["coverImage"]);

  const nextTitle = useMemo(() => deriveSeoTitle(title), [title]);
  const nextDescription = useMemo(
    () => deriveSeoDescription({ bodyMarkdown, excerpt, body }),
    [body, bodyMarkdown, excerpt],
  );
  const nextOgImage = useMemo(() => deriveSeoOgImage(coverImage), [coverImage]);

  useEffect(() => {
    const current = props.value ?? {};
    const patches = [];

    if ((nextTitle || nextDescription || nextOgImage) && !props.value) {
      patches.push(setIfMissing({}));
    }

    if (nextTitle && current.title !== nextTitle) {
      patches.push(set(nextTitle, ["title"]));
    }

    if (nextDescription && current.description !== nextDescription) {
      patches.push(set(nextDescription, ["description"]));
    }

    if (nextOgImage && !isSameSeoImage(current.ogImage, nextOgImage)) {
      patches.push(set(nextOgImage, ["ogImage"]));
    }

    if (patches.length > 0) {
      props.onChange(PatchEvent.from(...patches));
    }
  }, [nextDescription, nextOgImage, nextTitle, props, props.value]);

  return props.renderDefault(props);
};

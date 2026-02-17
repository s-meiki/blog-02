import { useCallback } from "react";
import { PatchEvent, set, type StringInputProps } from "sanity";
import { MarkdownInput, type MarkdownInputProps } from "sanity-plugin-markdown";

import { normalizeMarkdownEmphasis } from "../lib/normalizeMarkdown";

export const NormalizedMarkdownInput = (props: StringInputProps) => {
  const value = typeof props.value === "string" ? props.value : "";

  const handleBlur = useCallback(
    (...args: unknown[]) => {
      props.elementProps?.onBlur?.(...args);

      const normalized = normalizeMarkdownEmphasis(value);
      if (normalized !== value) {
        props.onChange(PatchEvent.from(set(normalized)));
      }
    },
    [props, value],
  );

  const markdownProps = props as MarkdownInputProps;
  return (
    <MarkdownInput
      {...markdownProps}
      elementProps={{
        ...markdownProps.elementProps,
        onBlur: handleBlur,
      }}
    />
  );
};

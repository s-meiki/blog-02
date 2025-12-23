import type { DefaultDocumentNodeResolver, StructureResolver } from "sanity/desk";
import { FiSettings } from "react-icons/fi";

import PreviewPane from "./components/PreviewPane";

const singletonTypes = new Set(["siteSettings"]);
const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const previewableTypes = new Set(["post", "page", "siteSettings"]);

export const structure: StructureResolver = (S) =>
  S.list()
    .id("content")
    .title("コンテンツ")
    .items([
      S.listItem()
        .title("サイト設定")
        .id("siteSettings")
        .icon(FiSettings)
        .child(
          S.editor()
            .id("siteSettings")
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .views([
              S.view.form(),
              S.view.component(PreviewPane).id("preview").title("プレビュー"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("記事"),
      S.documentTypeListItem("category").title("カテゴリ"),
      S.documentTypeListItem("tag").title("タグ"),
      S.documentTypeListItem("author").title("著者"),
      S.documentTypeListItem("page").title("固定ページ"),
    ]);

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  if (schemaType && previewableTypes.has(schemaType)) {
    return S.document().views([
      S.view.form(),
      S.view.component(PreviewPane).id("preview").title("プレビュー"),
    ]);
  }

  return S.document();
};

export const canUseAction = ({ schemaType, action }: { schemaType: string; action: string }) => {
  if (!singletonTypes.has(schemaType)) return true;
  return singletonActions.has(action);
};

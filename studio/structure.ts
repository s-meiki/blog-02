import type { StructureResolver } from "sanity/desk";
import { FiSettings } from "react-icons/fi";

const singletonTypes = new Set(["siteSettings"]);
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export const structure: StructureResolver = (S) =>
  S.list()
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
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("記事"),
      S.documentTypeListItem("category").title("カテゴリ"),
      S.documentTypeListItem("tag").title("タグ"),
      S.documentTypeListItem("author").title("著者"),
      S.documentTypeListItem("page").title("固定ページ"),
    ]);

export const defaultDocumentNode = (S: Parameters<StructureResolver>[0]) => S.document();

export const canUseAction = ({ schemaType, action }: { schemaType: string; action: string }) => {
  if (!singletonTypes.has(schemaType)) return true;
  return singletonActions.has(action);
};

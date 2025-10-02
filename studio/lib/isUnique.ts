import type { SlugValidationContext } from "sanity";

export const isUniqueAcrossAllDocuments = async (
  slug: string,
  context: SlugValidationContext,
) => {
  const { document, getClient } = context;
  if (!slug) return true;
  const client = getClient({ apiVersion: "2023-10-01" });
  const id = document?._id?.replace(/^drafts\./, "");
  const query = `!defined(*[_type == $type && slug.current == $slug && _id != $id][0]._id)`;
  const params = {
    type: document?._type,
    slug,
    id,
  };
  return await client.fetch<boolean>(query, params);
};

import type { SlugValidationContext } from "sanity";

export const isUniqueAcrossAllDocuments = async (
  slug: string,
  context: SlugValidationContext,
) => {
  if (!slug) return true;

  const { document, getClient } = context;
  const type = document?._type;
  if (!type) return true;

  const client = getClient({ apiVersion: "2023-10-01", useCdn: false });
  const publishedId = document?._id?.replace(/^drafts\./, "");

  // New document creation path (no persistent id yet).
  if (!publishedId) {
    const query = `!defined(*[_type == $type && slug.current == $slug][0]._id)`;
    return client.fetch<boolean>(query, { type, slug });
  }

  // Exclude both draft and published ids of the current document to avoid self-collision.
  const query =
    `!defined(*[_type == $type && slug.current == $slug && !(_id in [$draftId, $publishedId])][0]._id)`;

  return client.fetch<boolean>(query, {
    type,
    slug,
    draftId: `drafts.${publishedId}`,
    publishedId,
  });
};

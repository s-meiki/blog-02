const DEFAULT_AUTHOR_KEYWORD = "meiki";

const buildReference = (id: string) => ({
  _type: "reference" as const,
  _ref: id,
});

export const resolveDefaultAuthorReference = async (
  getClient: (options: { apiVersion: string; useCdn?: boolean }) => {
    fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>;
  },
) => {
  try {
    const client = getClient({ apiVersion: "2023-10-01", useCdn: false });
    const authorId =
      (await client.fetch<string | null>(
        `coalesce(
          *[_type == "author" && slug.current == $keyword && !(_id in path("drafts.**"))][0]._id,
          *[_type == "author" && slug.current == $keyword][0]._id,
          *[_type == "author" && lower(name) == $keyword && !(_id in path("drafts.**"))][0]._id,
          *[_type == "author" && lower(name) == $keyword][0]._id
        )`,
        { keyword: DEFAULT_AUTHOR_KEYWORD },
      )) ?? null;

    if (!authorId) return undefined;
    return buildReference(authorId.replace(/^drafts\./, ""));
  } catch (error) {
    console.warn("Failed to resolve default author", error);
    return undefined;
  }
};

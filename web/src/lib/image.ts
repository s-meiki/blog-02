import imageUrlBuilder from "@sanity/image-url";

import { sanityClient } from "@/lib/sanity/client";

const builder = imageUrlBuilder(sanityClient);

export const urlForImage = (source: unknown) => builder.image(source);

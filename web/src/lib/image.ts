import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { sanityClient } from "@/lib/sanity/client";

const builder = imageUrlBuilder(sanityClient);

export const urlForImage = (source: SanityImageSource) => builder.image(source);

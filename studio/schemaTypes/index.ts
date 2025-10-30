import post from "./documents/post";
import category from "./documents/category";
import tag from "./documents/tag";
import author from "./documents/author";
import page from "./documents/page";
import siteSettings from "./documents/siteSettings";
import seo from "./objects/seo";
import blockContent from "./objects/blockContent";
import imageWithCaption from "./objects/imageWithCaption";
import codeBlock from "./objects/codeBlock";
import tweetEmbed from "./objects/tweetEmbed";
import youtubeEmbed from "./objects/youtubeEmbed";

const schemaTypes = [
  post,
  category,
  tag,
  author,
  page,
  siteSettings,
  seo,
  blockContent,
  imageWithCaption,
  codeBlock,
  tweetEmbed,
  youtubeEmbed,
];

export default schemaTypes;

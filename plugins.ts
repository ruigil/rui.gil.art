import date, { Options as DateOptions } from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import basePath from "lume/plugins/base_path.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import metas from "lume/plugins/metas.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import { merge } from "lume/core/utils/object.ts";
import image from "https://deno.land/x/lume_markdown_plugins@v0.7.0/image.ts";

import "lume/types.ts";

export interface Options {
  date?: Partial<DateOptions>;
  feed?: Partial<FeedOptions>;
}

export const defaults: Options = {
  feed: {
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "=metas.site",
      description: "=metas.description",
    },
    items: {
      title: "=title",
    },
  },
};

/** Configure the site */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site.use(postcss())
      .use(basePath())
      .use(date(options.date))
      .use(metas())
      .use(image())
      .use(resolveUrls())
      .use(terser())
      .use(sitemap())
      .use(feed(options.feed))
      .copy("assets")

  };
}

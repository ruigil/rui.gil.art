import lume from "lume/mod.ts";
import date, { Options as DateOptions } from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import basePath from "lume/plugins/base_path.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import metas from "lume/plugins/metas.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import image from "https://deno.land/x/lume_markdown_plugins@v0.7.0/image.ts";

const site = lume({
  src: "./src",
  dest: "./site",
});

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

site.use(postcss())
site.use(basePath())
site.use(date())
site.use(metas())
site.use(image())
site.use(resolveUrls())
site.use(terser())
site.use(sitemap())
site.use(feed(defaults.feed))
site.copy("assets")

export default site;

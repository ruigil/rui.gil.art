import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS();

cms.document(
  "settings: Global settings for the site",
  "src:_data.yml",
  [
    {
      name: "lang",
      type: "text",
      label: "Language",
    },
    {
      name: "home",
      type: "object",
      fields: [
        {
          name: "welcome",
          type: "text",
          label: "Title",
          description: "Welcome message in the homepage",
        },
      ],
    },
    {
      name: "menu_links",
      type: "object-list",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Title",
        },
        {
          name: "url",
          type: "text",
          label: "URL",
        },
      ],
    },
    {
      name: "extra_head",
      type: "code",
      description: "Extra content to include in the <head> tag",
    },
    {
      name: "metas",
      type: "object",
      description: "Meta tags configuration.",
      fields: [
        "site: text",
        "description: text",
        "title: text",
        "image: text",
        "twitter: text",
        "lang: text",
        "generator: checkbox",
      ],
    },
  ],
);

cms.collection(
  "posts: Blog posts",
  "src:posts/*.md",
  [
    "title: text",
    "date: date",
    {
      name: "draft",
      label: "Draft",
      type: "checkbox",
      description: "If checked, the post will not be published.",
    },
    {
      name: "tags",
      type: "list",
      label: "Tags",
      init(field) {
        const { data } = field.cmsContent;
        field.options = data.site?.search.values("tags");
      },
    },
    {
      name: "comments",
      type: "object",
      fields: [
        {
          name: "src",
          label: "Link to mastodon post",
          type: "url",
        },
      ],
    },
    {
      name: "extra_head",
      type: "code",
      description: "Extra content to include in the <head> tag",
    },
    {
      name: "content",
      type: "markdown",
      label: "Content",
    },
  ],
);

cms.collection(
  "pages: Additional pages, like about, contact, etc.",
  "src:pages/*.md",
  [
    {
      name: "layout",
      type: "hidden",
      value: "layouts/page.vto",
    },
    {
      name: "title",
      type: "text",
      label: "Title",
    },
    {
      name: "url",
      type: "text",
      description: "The public URL of the page (must start with /)",
    },
    {
      name: "menu",
      type: "object",
      label: "Whether to include in the menu",
      fields: [
        {
          name: "visible",
          type: "checkbox",
          label: "Show in menu",
        },
        {
          name: "order",
          type: "number",
          label: "Order",
        },
      ],
    },
    {
      name: "extra_head",
      type: "code",
      description: "Extra content to include in the <head> tag",
    },
    {
      name: "content",
      type: "markdown",
      label: "Content",
    },
  ],
);

cms.upload("uploads: Uploaded files", "src:uploads");

export default cms;

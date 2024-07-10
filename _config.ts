import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  dest: "./site",
});

site.use(plugins());

export default site;

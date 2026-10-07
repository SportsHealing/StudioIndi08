// Eleventy settings. Eleventy reads this file once each time it builds the site.

export default function (eleventyConfig) {
  // Copy these folders straight to the output without changing them.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Blog posts: every Markdown file in src/blog, newest first.
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/*.md").reverse()
  );

  // Projects: every Markdown file in src/projects, in the order set by "order" in each file.
  eleventyConfig.addCollection("projects", (api) =>
    api.getFilteredByGlob("src/projects/*.md").sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
  );

  // Turns a date into "7 October 2026".
  eleventyConfig.addFilter("readableDate", (value) =>
    new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
}

const HTMLParser = require("node-html-parser");
const sanitizeHtml = require("sanitize-html");
const { performance } = require("perf_hooks");
const chalk = require("chalk");

/**
 * function to extraxt texts from HTML markup
 * which will be used only for searching and indexing (in DB)
 * @param {string} markup
 * @returns {string} clean text (or empty string)
 */

const sanitize = content => {
  if (!content) {
    console.log(chalk.yellow("Sanitizer received no markup!"));
    return "";
  }

  const START = performance.now();

  const PARSED_HTML = HTMLParser.parse(content, {
    lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
    comment: false, // retrieve comments (hurt performance slightly)
    blockTextElements: { // keep text content when parsing
      script: false,
      noscript: false,
      style: false,
      pre: true
    }
  });

  let cleanHTML = "";
  let cleanText = "";

  try {
    // cleanHTML = PARSED_HTML.querySelectorAll("html, head, body");
    cleanHTML = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
    });
    console.log("ORIGINAL CONTENT");
    console.log(content);
    console.log("———————————————————");
    console.log("CLEANED HTML");
    console.log(cleanHTML);
  } catch (error) {
    console.log(chalk.red(error));
  }

  try {
    cleanText = PARSED_HTML.removeWhitespace().structuredText.replace(/\r?\n|\r/g, " ");
  } catch (error) {
    console.log(chalk.red(error));
  }

  const END = performance.now();

  console.log(chalk.cyan(`Sanitizing ${content.length} chars took ${(END - START).toFixed(2)} ms`));

  return cleanText;
};

module.exports = sanitize;

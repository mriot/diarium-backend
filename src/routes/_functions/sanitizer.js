const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const { performance } = require("perf_hooks");
const chalk = require("chalk");

/**
 * function to extraxt texts from HTML markup
 * which will be used only for searching and indexing (in DB)
 * @param {string} markup
 * @returns {array} [clean and safe HTML, clean text]
 */

const sanitize = content => {
  if (!content) {
    console.log(chalk.yellow("Sanitizer received no markup!"));
    return "";
  }

  const START = performance.now();

  let cleanHTML = "";
  let cleanText = "";

  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);

  try {
    cleanHTML = DOMPurify.sanitize(content);
  } catch (error) {
    console.log(chalk.red(error));
  }

  try {
    DOMPurify.addHook("beforeSanitizeElements", (node) => {
      if (!node.nodeName) return;

      if (node.nodeName === "A") {
        node.textContent = `${node.textContent} [${node.getAttribute("href")}]`;
      }

      if (node.nodeName === "#text") {
        if (node.nextSibling) {
          node.textContent += " ";
        }
      }
    });

    // todo: only sanitize purified content?
    cleanText = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ["#text"],
      KEEP_CONTENT: true
    });
  } catch (error) {
    console.log(chalk.red(error));
  }

  const END = performance.now();

  console.log(chalk.cyan(`Sanitizing content took ${(END - START).toFixed(2)} ms`));

  return [cleanHTML, cleanText];
};

module.exports = sanitize;

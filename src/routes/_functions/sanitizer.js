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
    return ["", ""];
  }

  const START = performance.now();
  let SANITIZED_HTML_STRING = "";
  const CONTENT_ARRAY = [];
  const DOMPurify = createDOMPurify(new JSDOM("").window);

  DOMPurify.addHook("beforeSanitizeElements", (node) => {
    if (node.nodeName === "A") {
      CONTENT_ARRAY.push(node.getAttribute("href"));
    }

    if (node.nodeName === "IMG") {
      CONTENT_ARRAY.push(node.getAttribute("alt"));
    }

    // clear bad whitespaces in tables
    if (node.nodeType === 3) {
      const parentNode = node.parentNode;
      if (
        parentNode.nodeName === "TABLE" ||
        parentNode.nodeName === "THEAD" ||
        parentNode.nodeName === "TBODY" ||
        parentNode.nodeName === "TFOOT" ||
        parentNode.nodeName === "TR"
      ) {
        parentNode.removeChild(node);
      }
    }
  });

  SANITIZED_HTML_STRING = DOMPurify.sanitize(content);
  const sanitizedHTMLDOM = new JSDOM(SANITIZED_HTML_STRING).window;
  CONTENT_ARRAY.push(sanitizedHTMLDOM.document.documentElement.textContent);

  const END = performance.now();

  console.log(chalk.cyan(`Sanitizing content took ${(END - START).toFixed(2)} ms`));

  return [SANITIZED_HTML_STRING, CONTENT_ARRAY.join(" ").replace(/\s+/g, " ").trim()];
};

module.exports = sanitize;

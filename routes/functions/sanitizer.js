const { performance } = require("perf_hooks");
const logger = require("node-color-log");

/**
 * function to extraxt texts from Editor.js' JSON data
 * which will be used only for searching and indexing (in DB)
 * @param {object} content - Editor.js JSON content
 * @returns {string} sanitizedContent (or empty string)
 */

const sanitize = content => {
	if (!content.blocks) {
		logger.warn("Sanitizer received malformed JSON!");
		return "";
	}
	if (content.blocks.length === 0) {
		logger.warn("Sanitizer received 0 blocks to sanitize!");
		return "";
	}

	const START = performance.now();

	/**
	 * the regex, explained!
	 * (<([^>]+)>) 		=> html tags
	 * (&lt;.+?&gt;) 	=> html tags written as text
	 * (&\w[^\s;]*;) 	=> escaped html tags
	 * ([,.()[\]{}]) 	=> "custom" characters to remove
	 */
	const SANI_REGEX = /(<([^>]+)>)|(&lt;.+?&gt;)|(&\w[^\s;]*;)|([,.()[\]{}])/gi;

	const extractTextFromContent = jsonContent => {
		/* filter out blocks that are either...
		* on the blacklist or 
		* don't have a data object or 
		* whose data object is empty
		*/
		const typeBlacklist = ["delimiter"];
		const blocks = jsonContent.blocks.filter(block => (
			!typeBlacklist.includes(block.type)
			&& block.data
			&& Object.getOwnPropertyNames(block.data).length > 0
		));

		const texts = [];
		for (let i = 0; i < blocks.length; i++) {
			// TEXT property
			if (blocks[i].data.text) {
				texts.push(blocks[i].data.text);
				continue;
			}
			// LIST ITEMS
			if (blocks[i].data.items) {
				texts.push(...blocks[i].data.items);
				continue;
			}
			// CAPTIONS
			if (blocks[i].data.caption) {
				texts.push(blocks[i].data.caption);
				continue;
			}
		}
		return texts.join(" ");
	};

	const extractedText = extractTextFromContent(content);
	const sanitizedContent = extractedText.replace(SANI_REGEX, "");

	const END = performance.now();

	logger.info(`Sanitizing ${content.blocks.length} blocks took ${(END - START).toFixed(2)} ms`);

	return sanitizedContent;
};

module.exports = sanitize;

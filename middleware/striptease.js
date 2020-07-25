const { performance } = require("perf_hooks");

/**
 * ExpressJS middleware to extraxt texts from Editor.js' JSON data
 * which will be used for searching and indexing
 * @param {Object} req - ExpressJS request object
 * @param {Object} res - ExpressJS response object
 * @param {callback} next - Call the next middleware function
 */
const striptease = (req, res, next) => {
	if (req.body.length <= 0) return;
	/**
	 * the regex, explained!
	 * (<([^>]+)>) 		=> html tags
	 * (&lt;.+?&gt;) 	=> html tags written as text
	 * (&\w[^\s;]*;) 	=> escaped html tags
	 * ([,.()[\]{}]) 	=> "custom" characters to remove
	 * 
	 */
	const STRIP_REGEX = /(<([^>]+)>)|(&lt;.+?&gt;)|(&\w[^\s;]*;)|([,.()[\]{}])/gi;


	const extractTextFromJSON = json => {
		const typeBlacklist = ["delimiter"];
		/* filter out blocks that are either...
		* on the blacklist or 
		* don't have a data object or 
		* whose data object is empty
		*/
		const blocks = json.blocks.filter(block => (
			!typeBlacklist.includes(block.type)
			&& block.data
			&& Object.getOwnPropertyNames(block.data).length > 0
		));
		console.log("Blocks to be processed:", blocks.length);

		const texts = [];
		for (let i = 0; i < blocks.length; i++) {
			// TEXT
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


	const start = performance.now();

	const rawText = extractTextFromJSON(req.body);
	const strippedText = rawText.replace(STRIP_REGEX, "");

	const end = performance.now();


	// console.log(strippedText);
	console.log(rawText.length, strippedText.length);
	console.log((end - start).toFixed(2), "ms");

	// call next middleware function
	next();
};

module.exports = striptease;

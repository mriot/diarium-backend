const { Node } = require("slate");

// https://docs.slatejs.org/walkthroughs/06-saving-to-a-database

// Define a serializing function that takes a value and returns a string.
const serialize = value => (
	value
	// Return the string content of each paragraph in the value's children.
		.map(n => Node.string(n))
	// Join them all with line breaks denoting paragraphs.
		.join("\n")
);

const content = [{ type: "paragraph", children: [{ text: "A line of text in a paragraph." }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "" }] }, { type: "paragraph", children: [{ text: "" }] }, { type: "paragraph", children: [{ text: "asdasd" }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "" }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "asd" }] }, { type: "paragraph", children: [{ text: "" }] }, { type: "paragraph", children: [{ text: "" }] }, { type: "paragraph", children: [{ text: "asdasd" }] }];
// console.log(serialize(content));

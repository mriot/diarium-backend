module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": [
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
      quotes: ["warn", "double"],
      "no-tabs": ["error", { allowIndentationTabs: true }],
      "object-curly-newline": ["error", { "multiline": true }],
      "template-tag-spacing": ["error", "always"],
      "arrow-parens": ["error", "as-needed"],
      "indent": ["error", "tab"],
      "operator-linebreak": ["off"],
      "no-trailing-spaces": ["warn", {
        "skipBlankLines": true,
        "ignoreComments": true,
      }],
      "comma-dangle": ["off"],
      "spaced-comment": ["off"],
      "no-console": ["off"],
    }
};

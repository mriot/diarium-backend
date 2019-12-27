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
      "no-tabs": ["off"],
      "object-curly-newline": ["off"],
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
      "no-unused-vars": ["warn"],
      "space-unary-ops": ["off"],
      "import/newline-after-import": ["off"],
    }
};

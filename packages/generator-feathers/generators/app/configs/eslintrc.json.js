module.exports = generator => {
  const { props } = generator;
  const config = {
    "env": {
      "es6": true,
      "node": true
    },
    "parserOptions": {
      "ecmaVersion": 2017
    },
    "extends": "eslint:recommended",
    "rules": {
      "indent": [
        "error",
        2
      ],
      "linebreak-style": [
        "error",
        "unix"
      ],
      "quotes": [
        "error",
        "single"
      ],
      "semi": [
        "error",
        "always"
      ]
    }
  };
  config.env[props.tester] = true;
  return config;
};
module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true,
        "node": true
    },
    "extends": [
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "prettier"
    ],
    "ignorePatterns": ["**/lib/", "**/dist/"],
    "rules": {
        "prettier/prettier": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn", // or "error"
            { 
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }
        ]
    }
};

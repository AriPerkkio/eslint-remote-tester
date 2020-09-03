module.exports = {
    "root": true,
    "env": {
        "es6": true
    },
    "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "settings": {
        "react": {
            "version": "16.13.1"
        }
    },
    "plugins": ["react"],
    "extends": ["plugin:react/recommended"],
    "rules": {
        "react/no-unstable-nested-components": ["error"]
    }
};

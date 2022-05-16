module.exports = {
    extends: [
        // add more generic rulesets here, such as:
        "eslint:recommended",
        "plugin:vue/vue3-recommended",
        "@vue/typescript/recommended",
    ],
    rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
        "vue/html-indent": "off",
        "vue/html-self-closing": "off",
    },
    env: {
        node: true,
    },
};

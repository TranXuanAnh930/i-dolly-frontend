// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // this boilerplate's convention (Header, Footer, Login, single-word icon components)
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off'
  }
}

module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'babel'
  ],
  rules: {
    "babel/new-cap": 1,
    "babel/camelcase": 1,
    "babel/no-invalid-this": 1,
    "babel/object-curly-spacing": ['error', 'always'],
    "babel/semi": 1,
    "babel/camelcase": 0,
    "camelcase": 0,
  },
};

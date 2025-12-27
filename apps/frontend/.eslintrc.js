module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  settings: {
    next: {
      rootDir: __dirname
    }
  },
  rules: {
    'no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off'
  }
};

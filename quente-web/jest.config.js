const config = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/*index.js',
    '!src/serviceWorker.js',
    '!src/polyfill.js',
  ],
  /*   transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'js-jest',
  }, */
}

module.exports = config

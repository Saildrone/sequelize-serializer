module.exports = {
  colors: true,
  coverage: true,
  'coverage-path': 'src',
  globals: 'gju',
  // TODO: Reenable leak detection after we drop support for Node 6
  leaks: false,
  threshold: 80,
  verbose: true,
  sourcemaps: true,
  transform: 'node_modules/lab-transform-typescript'
};

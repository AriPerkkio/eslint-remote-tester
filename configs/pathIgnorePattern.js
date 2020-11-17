module.exports = `(${[
    'node_modules',
    '\\/\\.', // Any file or directory starting with dot, e.g. ".git"
    'test-results',
    'tests',
    'docs',
    '/dist/',
    '/build/',

    // Minified JS committed to remote
    'codesandbox-client/packages/app/static/js',
    'codesandbox-client/standalone-packages',
    'dockunit/platform/assets',
    'hyper/bin',
    'react-solitaire/lib/index\\.js',
    'babel\\.js',
    'chunk\\.js',
    'react-dom\\.development\\.js',
    'vendor\\.min\\.js',
    'jquery-3\\.4\\.1\\.min\\.js',

    'reach/reach-ui/packages/combobox/examples/cities\\.ts',
    'test262-main\\.ts',
    'sample_vis\\.test\\.mocks\\.ts',
].join('|')})`;

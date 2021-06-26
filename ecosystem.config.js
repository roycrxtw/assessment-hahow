const NODE_ENV = process.env.NODE_ENV || 'dev';

const config = {
  apps: [
    {
      name: `hahow-assessment-api-${NODE_ENV}`,
      script: 'index.js',
      node_args: '--trace-deprecation --trace-warnings',
      watch: ['*.js', 'app/**/*.js', 'lib/**/*.js', 'config'],
      ignore_watch: ['node_modules'],
      merge_logs: true,
      autorestart: true,
      env: {
        NODE_PATH: '.',
        APP_TYPE: 'api',
        NODE_ENV,
      },
    },
  ],
};

module.exports = config;

module.exports = {
  apps: [
    {
      name: 'backend-dokter',
      script: 'app.js',
      interpreter: 'bun',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'development',
        PORT: 4002,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4002,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};

// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "hubkon-api",
      script: "./src/server.js",
      watch: true,
      instance_var: 'INSTANCE_ID',
      env: {
        NODE_ENV: "development",
      },
      // 📝 LOGS: Grava o histórico de segurança e erros
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
    {
      name: "hubkon-worker",
      script: "./src/workers/executioner.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};

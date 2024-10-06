// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "api",
      script: "api.js",
      instances: 2,
      exec_mode: "cluster",
    },
    {
      name: "queue-processor",
      script: "queueProcessor.js",
      instances: 1,
    },
  ],
};

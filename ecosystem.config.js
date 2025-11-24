module.exports = {
  apps: [
    {
      name: "commtrack",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 4,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3130,
      },
    },
  ],
};

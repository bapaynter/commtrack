module.exports = {
  apps: [
    {
      name: "commtrack",
      script: "npm",
      args: "run start -- -p 3130",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3130,
      },
    },
  ],
};

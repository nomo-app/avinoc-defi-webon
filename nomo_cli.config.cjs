const sshHost = process.env.SSH_TARGET_AVINOC_DEFI;
if (!sshHost) {
  throw new Error("SSH_TARGET_AVINOC_DEFI not set");
}

const nomoCliConfig = {
  deployTargets: {
    production: {
      rawSSH: {
        sshHost,
        sshBaseDir: "/var/www/html",
        publicBaseUrl: "https://defi.avinoc.com",
        hybrid: true,
      },
    },
  },
};

module.exports = nomoCliConfig;

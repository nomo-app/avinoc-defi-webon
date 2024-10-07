const sshHost = process.env.SSH_TARGET;
if (!sshHost) {
  throw new Error("SSH_TARGET not set");
}

const nomoCliConfig = {
  deployTargets: {
    production: {
      rawSSH: {
        sshHost,
        sshBaseDir: "/var/www/production_webons/avinocdefi/",
        publicBaseUrl: "https://defi.avinoc.com",
        hybrid: true,
      },
    },
  },
};

module.exports = nomoCliConfig;

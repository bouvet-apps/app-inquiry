const libs = {
  auth: require("/lib/xp/auth"),
  util: require("/lib/util")
};

exports.createRole = () => {
  libs.util.runAsAdmin(() => {
    if (libs.auth.getPrincipal("role:inquiry.tool.admin")) {
      log.debug(`The role for ${app.name} already exists.`);
      return;
    }

    libs.auth.createRole({
      name: "inquiry.tool.admin",
      displayName: "Inquiry App Access",
      description: "This role gives access to the Inquiry App admin tool."
    });

    log.info(`A role for ${app.name} has been created.`);
  });
};

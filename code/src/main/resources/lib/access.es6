const libs = {
  authLib: require("/lib/xp/auth"),
  util: require("/lib/util")
};

exports.createRole = () => {
  try {
    libs.util.runAsAdmin(() => libs.authLib.createRole({
      name: "inquiry.tool.admin",
      displayName: "Inquiry App Access",
      description: "This role gives access to the Inquiry App admin tool."
    }));

    log.info(`A role for ${app.name} has been created.`);
  } catch (err) {
    log.info(`A role already exists or something wrong happened when trying to create a role for ${app.name}.`);
    log.error(err);
  }
};

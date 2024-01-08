const libs = {
  repository: require("/lib/repository"),
  access: require("/lib/access"),
  util: require("/lib/util"),
  eventLib: require("/lib/xp/event"),
  content: require("/lib/xp/content"),
  context: require("/lib/xp/context")
};

log.info(`Application ${app.name} started.`);

const repoCheck = libs.util.runAsAdmin(libs.repository.checkRepo);

if (repoCheck) {
  log.info(`Repo for ${app.name} has been set up.`);

  libs.access.createRole();
} else {
  log.error(`Repo for ${app.name} failed to set up.`);
}

libs.eventLib.listener({
  type: "node.updated",
  localOnly: true,
  callback: function (event) {
    if (event.data.nodes[0]) {
      libs.context.run({
        branch: "draft",
        repository: event.data.nodes[0].repo,
        principals: ["role:system.admin"]
      }, () => {
        const nodeInfo = libs.content.get({ key: event.data.nodes[0].id });
        if (nodeInfo && nodeInfo.type === "portal:site") {
          libs.content.modify({
            key: event.data.nodes[0].id,
            // Set to make modify run even though there are validation errors in the SiteConfig
            requireValid: false,
            editor: (c) => {
              const _c = c;
              _c.data.siteConfig.forEach((e) => {
                if (e.applicationKey === app.name) {
                  e.config.popupQuestions.forEach((i) => {
                    if (!i[`${i._selected}`].id) {
                      /* eslint-disable-next-line */
                      i[`${i._selected}`].id = `${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
                    }
                  });
                }
              });
              return _c;
            }
          });
        }
      });
    }
  }
});

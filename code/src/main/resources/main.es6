const libs = {
  repository: require("/lib/repository"),
  access: require("/lib/access"),
  util: require("/lib/util"),
  event: require("/lib/xp/event"),
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

const handleInquiryNodeEvent = (event) => {
  const node = event.data.nodes[0];
  if (node && node.repo.indexOf("com.enonic.cms.") === 0 && node.branch === "draft") {
    libs.context.run({
      branch: node.branch,
      repository: node.repo,
      principals: ["role:system.admin"]
    }, () => {
      const nodeInfo = libs.content.get({ key: node.id });
      if (nodeInfo && nodeInfo.type === `${app.name}:inquiry`
        && libs.util.forceArray(nodeInfo.data.popupQuestions).some((question) => question[question._selected] && !question[question._selected].id)) {
        libs.content.modify({
          key: node.id,
          requireValid: false,
          editor: (c) => {
            const _c = c;
            libs.util.forceArray(_c.data.popupQuestions).forEach((question) => {
              const selectedQuestion = question[question._selected];
              if (selectedQuestion && !selectedQuestion.id) {
                selectedQuestion.id = `${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
              }
            });
            return _c;
          }
        });
      }
    });
  }
};

["node.created", "node.updated"].forEach((type) => {
  libs.event.listener({
    type,
    localOnly: true,
    callback: handleInquiryNodeEvent
  });
});

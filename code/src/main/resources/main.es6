const libs = {
  repository: require("/lib/repository"),
  access: require("/lib/access"),
  util: require("/lib/util")
};

log.info(`Application ${app.name} started.`);

const repoCheck = libs.util.runAsAdmin(libs.repository.checkRepo);

if (repoCheck) {
  log.info(`Repo for ${app.name} has been set up.`);

  libs.access.createRole();
} else {
  log.error(`Repo for ${app.name} failed to set up.`);
}

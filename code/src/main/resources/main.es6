const libs = {
  repository: require("/lib/repository")
};

log.info(`Application ${app.name} started.`);

const repoCheck = libs.repository.runAsAdmin(libs.repository.checkRepo);

if (repoCheck) {
  log.info(`Repo for ${app.name} has been set up.`);
} else {
  log.error(`Repo for ${app.name} failed to set up.`);
}

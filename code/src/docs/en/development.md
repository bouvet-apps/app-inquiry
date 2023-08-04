Welcome to the Inquiry app. This repo contains source code and build scripts to build and deploy a package to be run in Enonic XP. It is optimized for making a part that can easily be deployed to another site.

# Repositories
This project has 1 repository:

| Repository   | Description          | Type      | Path           |
| ------------ | -------------------- | --------- | -------------- |
| app-inquiry  | application          | Main      | /              |

# Local project setup
## Tools
[Git](https://git-scm.com/): Version control FTW.

[nvm](https://github.com/nvm-sh/nvm): Node and npm version manager. Node and npm are used for managing dependencies.

A modern IDE such as [IntelliJ IDEA](https://www.jetbrains.com/idea/), [WebStorm](https://www.jetbrains.com/webstorm/), [Visual Studio Code](https://code.visualstudio.com/), or any other that you prefer.

[sdkman](https://sdkman.io/): Version manager for a plethora of tools, most notably Java and Gradle.

## Development environment
Clone this repo `git clone git@github.com:bouvet/app-inquiry.git` and `cd app-inquiry`.
Then delete the `.git`-folder and `git init` to be able to version control whatever you make.

To be able to clone the project with this command, you need to make sure you can connect to github with SSH.

To test if you have already set this up, run `ssh -T git@github.com`.
If you receive "permission denied" here, you need to set up a connection.
To do this you can follow githubs own guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh .

Make sure to use Java version 11. Check by running `java -version`. Use `sdkman` to adjust if necessary.

Enonic CLI (Command Line Interface) needs to be installed. See
[documentation for Enonic CLI](https://developer.enonic.com/docs/enonic-cli/master/install) for details.
Check your version by executing `enonic latest`. Upgrade if not on the latest version.


We use `make` to run a lot of commands in the terminal from the project's root folder.
`make help` will show a list of all available make commands and their purposes.

### Make commands you should know in this project

#### Start, deploy and develop project
Edit the `Makefile` to suit your needs.

You should also edit `code/gradle.properties` to match your app name and description.

`make start` will start the sandbox. If it does not exist, it will be created for you. The sandbox will start in dev mode.

`make deploy` will deploy the app to the sandbox. We start the sandbox in dev mode, so _this should only be necessary to do once_.

`make watch` will watch the codebase for any changed or added files and rebuild as necessary. When editing files that will be transpiled, it is necessary to have this command running.

#### Updating dependencies
If you change package.json so it is no longer in sync with the package-lock.json, building of the application will fail, because the `ci` command we use to install packages safely will not allow this.

If you update package.json on purpose, you will need to `make install_new_dependencies` before building the application again.

If you update the `node` or `npm` versions in the build.gradle files, which the packages are dependent on, simply delete the .gradle folders, and run `make install_new_dependencies` before running `make` again.

If you upgrade `gradleVersion` in the code/build.gradle file, simply delete the code/.gradle folder, and run `gradle wrapper` inside the `code` folder.

#### Other relevant commands
Note that all these commands will first run any tasks they depend upon.
`make test`: Run tests only.
`make lint`: Run lint only. Note that linting is also run pre-commit. Your IDE should also continuously tell you about any linting errors if configured properly.
`make clean`: Delete all dependencies and build folders.
`make`: Alias for `make package`, which packages the application.

## Authentication for Github Packages
We retrieve packages from Github Packages through NPM and Maven, so it is necessary to set up authentication locally on the developer machine. We use Github's [Personal access tokens](https://github.com/settings/tokens).

Generate a `Personal access token` in Github for authentication:
- Generate token: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

- Give access to the Bouvet organization: https://docs.github.com/en/github/authenticating-to-github/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on

Create the file `~/.npmrc` and add:
```
//npm.pkg.github.com/:_authToken=PASTE-YOUR-PERSONAL-ACCESS-TOKEN-HERE
registry=https://npm.pkg.github.com/bouvet
```

Create the file `~/.gradle/gradle.properties` and add:
```
bouvetGithubUser=YOUR-GITHUB-USERNAME
bouvetGithubToken=PASTE-YOUR-PERSONAL-ACCESS-TOKEN-HERE
```

## Upgrade Enonic version
The first time your sandbox is built, it uses the Enonic version specified in the variable `xpVersion`
in gradle.properties. But if this is updated after the sandbox is created you will need to update your sandbox with
the following command:

```
enonic sandbox upgrade
```
Then, it will ask you which sandbox you would like to upgrade and to which version of Enonic XP.


# Documentation of code and architecture
See [code documentation](code/README.md) for documentation of how we develop applications.

# Dependabot
See [dependabot documentation](code/src/docs/en/dependabot.md) for documentation of how we use dependabot.

# More help
Join the Slack channel `enonic-xp` for more Enonic XP fun times!


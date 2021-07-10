# Demo Gifs

Simple workflow to save a demo of a portfolio project every time it's deployed to GitHub. Generates a screencasting type gif of the live version using Puppeteer and automates the process using GitHub Actions. Based on this [prompt](https://www.codementor.io/projects/web/build-a-screenshot-pipeline-c22ccscro8) using this [tutorial](https://dev.to/aimerib/using-puppeteer-to-make-animated-gifs-of-page-scrolls-1lko) by [Aimeri Baddouh](https://www.slothcrew.com/).


## Installation

Fork this repository. [Create a personal access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token). Add it to the repo of the project you wish to create a gif for.

If there's not one yet, create a directory named `workflows` inside another named `.github` at root level. Download the file `dispatch-gif.yaml` and move it to `.github/workflows`

Make sure your repo has a `package.json` file with these fields filled out:
* `name` project repo's name to be used for the gif filename
* `homepage` url of live demo to screenshot and animate as a gif

Push the repo to origin. You can check the **Actions** tab of both repos to watch the progress. `[name].gif` will be created inside the `demos` directory of your fork and committed with the message `new [name].gif`.

From then on, a new gif will be generated inside the `demos` directory of your fork every time the corresponding project repo is deployed. To trigger the script manually, make sure you're at root level and run this command:
````
npm run gif [name] [homepage]
````

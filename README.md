# Demo Gifs

Simple workflow to save a demo of a portfolio project every time it's deployed to GitHub. Generates a screencasting type gif of the live version using Puppeteer and automates the process using GitHub Actions. Based on this [prompt](https://www.codementor.io/projects/web/build-a-screenshot-pipeline-c22ccscro8) using this [tutorial](https://dev.to/aimerib/using-puppeteer-to-make-animated-gifs-of-page-scrolls-1lko) by [Aimeri Baddouh](https://www.slothcrew.com/).


## Installation

Fork this repository. [Create a personal access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token). Add it to the repo of the project you wish to create a gif for.

If there's not one yet, create a directory named `workflows` inside another named `.github` at root level of your project repo. Download the file `dispatch-gif.yaml` and move it to it. Make sure you replace `claudiacachayosorio/demo-gifs` with your own fork `your-username/demo-gifs`

Still inside the project repo, make sure there's a `package.json` file with the following fields filled out:
* `name` project repo's name to be used for the gif filename
* `homepage` url of live demo to screenshot and animate as a gif

Deploy all changes. You can check the **Actions** tab of both repos to watch the progress. From then on, `[name].gif` will be generated inside the `demos` directory of your fork every time the corresponding project repo is pushed to origin. Repeat for each repository with a live web page you want to showcase with a gif.

To trigger the script manually, make sure you're at the forked repo's root level and run this command:
````
npm run gif [name] [homepage]
````

# demo gifs

Simple pipeline to create an animated demo of a portfolio project every time it's deployed to GitHub. Script generates a screencasting type gif of the live version using Puppeteer and Node.js. The GitHub Actions workflow saves it to an Amazon S3 bucket. Based on this [prompt](https://www.codementor.io/projects/web/build-a-screenshot-pipeline-c22ccscro8) using this [tutorial](https://dev.to/aimerib/using-puppeteer-to-make-animated-gifs-of-page-scrolls-1lko) by [Aimeri Baddouh](https://www.slothcrew.com/).


## Installation

### S3 bucket
Create an [S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html).

In the IAM console, first create a policy using this [template](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_s3_rw-bucket.html). Next, create an [IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) for this workflow and assign the newly created policy to it. Make sure you choose programmatic access as type of credentials.

### Generator
Fork this repository. In the **Settings** tab, create the following [action secrets](https://github.com/claudiacachayosorio/demo-gifs/settings/secrets/actions) using the IAM user credentials:
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`

I also added the S3 bucket name and region as secrets under `AWS_S3_BUCKET` and `AWS_REGION`, but it's optional. If you don't, replace them for the actual values in the `demo.yaml` file.

### Project workflow
Create a [personal access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token). Add it as an action secret to the repo of the project you want to create a gif for.

If there's not one yet, create a directory named `workflows` inside another named `.github` at root level of the project repo. Download the file `demo.yaml` and move it to there. Make sure you replace my username with your own.

To get the inputs, your project repo should have a `package.json` file with the following fields filled out:
* `name` project repo's name to be used for the gif filename
* `homepage` url of live demo to screenshot and animate as a gif

Deploy all changes. You can check the **Actions** tab of both repos to watch the progress. From then on, `[name].gif` will be generated inside the `demos` directory of your fork every time the corresponding project repo is pushed to origin. Repeat for each repository with a live web page you want to showcase with a gif.


## Commands
````
npm run gif [name] [homepage]
````
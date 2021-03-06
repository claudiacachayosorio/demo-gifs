# demo-gifs
[![generator][workflow]][workflow-url]

Simple pipeline to create an animated demo of a project every time it's deployed. Generates a screencasting type gif of the homepage and saves it to an Amazon S3 bucket. Built with Node.js and GitHub Actions, based on [this prompt](https://www.codementor.io/projects/web/build-a-screenshot-pipeline-c22ccscro8) using [this tutorial](https://dev.to/aimerib/using-puppeteer-to-make-animated-gifs-of-page-scrolls-1lko) by [Aimeri Baddouh](https://www.slothcrew.com/).

## Installation

### AWS setup
Create an [S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html). In the IAM console, first create a [policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create-console.html) using the template `policy.json`. Be sure to swap in your bucket's name in the following line:
````json
"Resource": "arn:aws:s3:::bucket-name/*"
````

Next, create an [IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) for this workflow and assign the newly created policy to it. Make sure you choose programmatic access as type of credentials.

### Generator
Fork this repository. In the **Settings** tab, create the following [secrets](https://github.com/claudiacachayosorio/demo-gifs/settings/secrets/actions) using the new IAM credentials:
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`

Replace the following values:
````yaml
# demo-gifs/.github/workflows/generator.yml
aws-region: us-east-1 # bucket's AWS region
run: [...] s3://cco-demo-gifs --acl public-read # s3://bucket-name

# demo-gifs/templates/demo.yml
repo: claudiacachayosorio/demo-gifs # username/demo-gifs
````


### Project workflow
Create a [personal access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token). Add it as a secret to the repository of the project you want to create a gif for.

Add a copy of `demo.yml` to the following path: `project-repo/.github/workflows/demo.yml`

To get the necessary inputs for the generator, your project should have a `package.json` file with the following fields filled out:
* `name` project repository's name to be used for the gif filename
* `homepage` url of the live demo to take screenshots and animate as a gif

Deploy all changes. You can check the **Actions** tab of both repositories to watch the progress. From then on, `[name].gif` will be saved to your S3 bucket every time the corresponding project repository is pushed to origin. Repeat for each project with a live web page you want to showcase.


## Usage
````
npm run start [name] [homepage]
````


## License
[MIT](https://choosealicense.com/licenses/mit/)


<!-- Variables -->
[workflow]: https://github.com/claudiacachayosorio/demo-gifs/actions/workflows/generator.yml/badge.svg
[workflow-url]: https://github.com/claudiacachayosorio/demo-gifs/actions/workflows/generator.yml


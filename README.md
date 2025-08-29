# Seahorse Frontend

## Overview

**SEAHORSE (Serendipity Engine Assaying Heterogeneous Omics Sampling Experiments)** is a platform that enables users to discover and validate novel hypotheses by exploring comprehensive associations among phenotypic and genomic variables in large-scale datasets like GTEx and TCGA.

## Getting Started
### Prerequisite
**For deployment**: AWS CLI installed, an AWS account with access to your S3 bucket, and your AWS credentials configured.


### Installation and Build

Clone the repository and install dependencies:

```bash
git clone https://github.com/HSPH-QBRC/seahorse-frontend.git
cd seahorse-frontend
npm install
```

**A note on environments**
Note that to perform this, you will need an environment with node/npm installed. One option is to use a Docker container with node, which can be pulled from here: https://hub.docker.com/_/node

Following the download of that image, you can start and enter the container using:
```
docker run -it -v $PWD:/work --entrypoint=/bin/bash node:lts-trixie-slim
```
(here `lts-trixie-slim` was the image tag at the time of writing this).

Note that this mounts the current working directory (e.g. the root of the seahorse-frontend repository) in your container. This is important since you will eventually need the contents of the `dist/` folder that is created upon building the project. If you use this method, you will naturally need to adapt the paths in the instructions above and below (e.g. `/work` contain the `package.json` file, etc.)

### Deployment

Replace`{s3 bucket name}` with your actual S3 bucket name and configure your [environment variables](#environment-variables)

```bash
npm run build
cd dist/seahorse-frontend
aws s3 rm s3://{s3 bucket name} --recursive
aws s3 sync . s3://{s3 bucket name}
```

## Environment Variables

Before running the project, ensure you have the following environment variables set. These can typically be configured in an `environment.ts` (for development) or `environment.prod.ts` (for production) file in your Angular project:

```js
export const environment = {
  production: false,
  API_URL: 'https://api-v1.seahorse.networkmedicine.org'
};
```

# Website
[https://seahorse.networkmedicine.org/](https://seahorse.networkmedicine.org/ )

# Seahorse Backend
[https://github.com/HSPH-QBRC/seahorse-backend](https://github.com/HSPH-QBRC/seahorse-backend )


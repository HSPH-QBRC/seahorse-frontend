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

### Deployment

Replace`{s3 bucket name}` with your actual S3 bucket name:

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
  API_URL: 'https://api-v1.seahorse.tm4.org'
};
```

# Website
[https://seahorse.tm4.org/](https://seahorse.tm4.org/ )

# Seahorse Backend
[https://github.com/HSPH-QBRC/seahorse-backend](https://github.com/HSPH-QBRC/seahorse-backend )


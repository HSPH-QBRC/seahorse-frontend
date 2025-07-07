# Seahorse Frontend

## Overview

**SEAHORSE (Serendipity Engine Assaying Heterogeneous Omics Sampling Experiments)** is a web platform designed to enable users to develop new hypotheses from large population-based multi-omic datasets. Nearly all scientific inquiry is based on the paradigm of hypothesis testing, in which associations between pre-identified experimental factors and the final states of a system are explored. However, this approach is limited by our current understanding of the systems we wish to study.

SEAHORSE was created to help overcome these limitations. Using both phenotypic and genomic variables from the Genotype-Tissue Expression (GTEx) and The Cancer Genome Atlas (TCGA) projects, we have pre-computed all pairwise associations:
- Between phenotypic variables
- Between genomic variables (in each tissue)
- Between phenotypic and expression variables (in each tissue)

SEAHORSE not only provides opportunities for users to search for new and unexpected hypotheses that can be tested in future experiments or studies, but it also enables confirmation of findings from other studies within GTEx and TCGA.

## Key Features

- Explore all pairwise associations across large, multi-omic datasets
- Integrated access to GTEx and TCGA data
- Search for and visualize novel hypotheses
- Confirm discoveries across multiple studies and tissues

## Getting Started
### Prerequisite
For deployment: AWS CLI installed, an AWS account with access to your S3 bucket, and your AWS credentials configured.


### Installation and Build

Clone the repository and install dependencies:

```bash
git clone https://github.com/HSPH-QBRC/seahorse-frontend.git
cd seahorse-frontend
npm install
npm run build
cd dist/d3-map-dashboard
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


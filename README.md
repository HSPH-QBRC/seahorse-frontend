# SeahorseFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.1.

## Deploy on AWS S3

Reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html

```shell
npm run build
cd dist/seahorse-frontend
aws s3 rm s3://seahorse.tm4.org --recursive
aws s3 sync . s3://seahorse.tm4.org
```

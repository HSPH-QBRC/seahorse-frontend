# SeahorseFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.1.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deploy on AWS S3

Reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html

```shell
npm run build
cd dist/seahorse-frontend
aws s3 rm s3://seahorse.tm4.org --recursive
aws s3 sync . s3://seahorse.tm4.org
```

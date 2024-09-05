# Deployment

# Deployment on AWS

## Prerequisites
* Create an HTTPS certificate for your website host name using AWS Certificate Manager in the `us-east-1` region (required by CloudFront)

## Operations
Create a new Terraform workspace (name should match the backend workspace name for consistency: log file prefixes, etc):
```shell
terraform workspace new demo
```
If a workspace already exists:
```shell
terraform workspace select demo
```
Create and/or edit `terraform.tfvars`:
```shell
cp terraform.tfvars.template terraform.tfvars
```

Deploy the infrastructure:
```shell
terraform apply
```

Create a DNS record using the domain name returned by `terraform apply` on completion:
```
<website_hostname> CNAME <cloudfront_distribution_domain_name>
```
(Note that this can be done in the Route53 console by selecting from the available CloudFront distributions.)

Deploy the site content by copying files into the bucket. 

After changes, you may need to invalidate the CloudFront distribution to remove files from CloudFront edge cache before it expires:
```shell
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```
Invalidation takes several minutes, to check the status:
```shell
aws cloudfront get-invalidation --distribution-id <id> --id <invalidation_id>
```
To delete the site:
```shell
terraform destroy
```
Delete the CNAME record

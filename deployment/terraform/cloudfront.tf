resource "aws_cloudfront_distribution" "website" {
  aliases             = [var.website_hostname]
  default_root_object = "index.html"
  enabled             = true
  is_ipv6_enabled     = true
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = var.website_hostname
  }
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.website_hostname
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    acm_certificate_arn      = var.https_cert_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }
  # this block allows "direct" urls.
  # Without this, attempts to access {var.website_hostname}/foo
  # will generate a 404. By adding this, the angular app will
  # properly load the route associated with /foo
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

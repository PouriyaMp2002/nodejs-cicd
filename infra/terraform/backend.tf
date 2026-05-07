terraform {
  backend "s3" {
    bucket = "bucket-name-ex"
    key    = "terraform/terraform.tfstate"
    region = "us-east-1"
  }
}

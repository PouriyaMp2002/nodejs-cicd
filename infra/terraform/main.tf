terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.Region
}

# resource "aws_s3_bucket" "terraform" {
#   bucket = "bucket-name-ex"
# }

# Terraform needs a remote backend, usually an S3 bucket. There are two options:

# Option A: Create the S3 bucket manually first, then configure Terraform backend.
# Option B: Create the S3 bucket with Terraform first (like here),apply the terraform, then add the backend and migrate state.

data "http" "my_ip" {
  url = "https://checkip.amazonaws.com/"
}

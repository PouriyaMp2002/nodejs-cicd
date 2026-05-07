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

# If you don't have s3 bucket, you should create it, then use backup.tf (after applying).check 
#it's better to create s3, then use this terraform code. 

data "http" "my_ip" {
  url = "https://checkip.amazonaws.com/"
}

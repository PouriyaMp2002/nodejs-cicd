resource "aws_key_pair" "devops" {
  key_name   = "devops"
  public_key = file("${path.module}/devops.pub")
}

resource "aws_instance" "Stage" {
  ami           = "ami-0ec10929233384c7f"
  instance_type = var.Instance_type

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted = true
  }
  vpc_security_group_ids = [aws_security_group.stage.id]

  tags = {
    Name    = "Stage"
    Role    = "jenkins"
    Project = "nodejs-devops"
  }
  key_name = aws_key_pair.devops.key_name

  metadata_options {
    http_tokens = "required"
  }

}


resource "aws_instance" "Deployment" {
  ami           = "ami-0ec10929233384c7f"
  instance_type = var.Instance_type

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted = true
  }
  vpc_security_group_ids = [aws_security_group.deploy.id]
  tags = {
    Name    = "deploy"
    Role    = "deploy"
    Project = "nodejs-devops"
  }
  key_name = aws_key_pair.devops.key_name

  metadata_options {
    http_tokens = "required"
  }

}


resource "aws_instance" "Test" {
  ami           = "ami-0ec10929233384c7f"
  instance_type = var.Instance_type

  root_block_device {
    volume_size = 15
    volume_type = "gp3"
    encrypted = true
  }
  vpc_security_group_ids = [aws_security_group.test.id]

  tags = {
    Name = "dev"
  }
  key_name = aws_key_pair.devops.key_name

  metadata_options {
    http_tokens = "required"
  }

}


resource "aws_instance" "SQ" {
  ami           = "ami-0ec10929233384c7f"
  instance_type = var.Instance_type

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted = true
  }
  vpc_security_group_ids = [aws_security_group.sonar.id]

  tags = {
    Name = "SonarQube"
    Role    = "sonar"
    Project = "nodejs-devops"
  }
  key_name = aws_key_pair.devops.key_name

  metadata_options {
    http_tokens = "required"
  }

}

resource "aws_security_group" "test" {
  name        = "init-sg"
  description = "Security group for initializing."

  tags = {
    Name = "dev-sg"
  }
}

resource "aws_security_group" "stage" {
  name        = "Stage-sg"
  description = "Security group for Jenkins and staging applications."

  tags = {
    Name = "Stage-sg"
  }
}

resource "aws_security_group" "sonar" {
  name        = "SQ-sg"
  description = "Security group for SonarQube."

  tags = {
    Name = "Sonarqube-sg"
  }
}

resource "aws_security_group" "deploy" {
  name        = "deploy-sg"
  description = "Security group for Deployment machine"

  tags = {
    Name = "Deploy-sg"
  }
}

# Test(dev) machine => Only ssh from your IP
resource "aws_vpc_security_group_ingress_rule" "SSH-test" {
  security_group_id = aws_security_group.test.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

# Stage machine (jenkins)

# SSH 
resource "aws_vpc_security_group_ingress_rule" "SSH-Stage" {
  security_group_id = aws_security_group.stage.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

# 8080
resource "aws_vpc_security_group_ingress_rule" "jenkins-stage" {
  security_group_id = aws_security_group.stage.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 8080
  to_port           = 8080
}

# SSH From dev to Stage (for ansible)
resource "aws_vpc_security_group_ingress_rule" "test-to-stage" {
  security_group_id            = aws_security_group.stage.id
  referenced_security_group_id = aws_security_group.test.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22
}

# SonarQube-sg

# SSH
resource "aws_vpc_security_group_ingress_rule" "ssh-to-sonar" {
  security_group_id = aws_security_group.sonar.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

# SSH from dev machine
resource "aws_vpc_security_group_ingress_rule" "ssh-to-sonar-from-test" {
  security_group_id            = aws_security_group.sonar.id
  referenced_security_group_id = aws_security_group.test.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22
}

# 9000 From my ip.
resource "aws_vpc_security_group_ingress_rule" "sq-from-my-ip" {
  security_group_id = aws_security_group.sonar.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 9000
  to_port           = 9000

}

# 9000 from Jenkins
resource "aws_vpc_security_group_ingress_rule" "sq-from-Jenkins" {
  security_group_id            = aws_security_group.sonar.id
  referenced_security_group_id = aws_security_group.stage.id
  ip_protocol                  = "tcp"
  from_port                    = 9000
  to_port                      = 9000

}

# Deploy machine

# SSH 
resource "aws_vpc_security_group_ingress_rule" "SSH-deploy" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

resource "aws_vpc_security_group_ingress_rule" "test-to-deploy" {
  security_group_id            = aws_security_group.deploy.id
  referenced_security_group_id = aws_security_group.test.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22
}

resource "aws_vpc_security_group_ingress_rule" "stage-to-deploy" {
  security_group_id            = aws_security_group.deploy.id
  referenced_security_group_id = aws_security_group.stage.id
  ip_protocol                  = "tcp"
  from_port                    = 22
  to_port                      = 22
}

resource "aws_vpc_security_group_ingress_rule" "prometheus" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 9090
  to_port           = 9090
}

resource "aws_vpc_security_group_ingress_rule" "grafana" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 3001
  to_port           = 3001
}

resource "aws_vpc_security_group_ingress_rule" "node-exporter" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 9100
  to_port           = 9100
}

resource "aws_vpc_security_group_ingress_rule" "cadvisor" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 8080
  to_port           = 8080
}

resource "aws_vpc_security_group_ingress_rule" "deploy_from_my_ip" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  ip_protocol       = "tcp"
  from_port         = 3000
  to_port           = 3000
}

resource "aws_vpc_security_group_egress_rule" "test-out" {
  security_group_id = aws_security_group.test.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}


resource "aws_vpc_security_group_egress_rule" "stage-out" {
  security_group_id = aws_security_group.stage.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_egress_rule" "deploy-out" {
  security_group_id = aws_security_group.deploy.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_egress_rule" "sonar-out" {
  security_group_id = aws_security_group.sonar.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

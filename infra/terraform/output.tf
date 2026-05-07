output "dev-machine-private" {
  value = aws_instance.Test.private_ip
}

output "dev-machine-public" {
  value = aws_instance.Test.public_ip
}

output "stage-machine-private" {
  value = aws_instance.Stage.private_ip
}

output "stage-machine-public" {
  value = aws_instance.Stage.public_ip
}


output "deploy-machine-private" {
  value = aws_instance.Deployment.private_ip
}

output "deploy-machine-public_ip" {
  value = aws_instance.Deployment.public_ip
}

output "sonar-machine-private" {
  value = aws_instance.SQ.private_ip
}

output "sonar-machine-public" {
  value = aws_instance.SQ.public_ip
}
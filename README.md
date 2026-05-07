A complete DevOps project for building, testing, scanning, containerizing, provisioning, deploying, and monitoring a Node.js REST API on AWS.

This repository is not only a Node.js application. It demonstrates an end-to-end DevOps workflow using Terraform, Ansible, Jenkins, Docker,SonarQube, Trivy, Prometheus, Grafana, Node Exporter, cAdvisor, PostgreSQL, and AWS EC2.

---

## Project Overview

This project is a simple Node.js API created to practice real-world DevOps, cloud infrastructure, automation, CI/CD, containerization, security scanning, and monitoring.

The application is built with Node.js, TypeScript, Express, Prisma, and PostgreSQL. The DevOps workflow around the application includes:

- AWS infrastructure provisioning with Terraform
- Server configuration with Ansible
- CI/CD automation with Jenkins
- Docker image build and deployment
- SonarQube code quality analysis
- Trivy vulnerability and secret scanning
- PostgreSQL database migrations with Prisma
- Monitoring with Prometheus and Grafana
- Host and container metrics with Node Exporter and cAdvisor
- Automated post-deployment health checks

---
 
## Architecture

```text
Developer
   |
   | Push code
   v
Jenkins CI/CD Pipeline
   |
   | npm ci
   | tests + coverage
   | build
   | SonarQube scan
   | Quality Gate
   | Trivy filesystem scan
   | Docker image build
   | Trivy image scan
   | DockerHub push
   v
Ansible Deployment
   |
   | Pull Docker image
   | Start PostgreSQL
   | Run Prisma migrations
   | Start application container
   | Run health check
   v
AWS EC2 Deploy Server
   |
   | Application + PostgreSQL
   | Prometheus + Grafana
   | Node Exporter + cAdvisor
```

---

## Repository Structure

```text
.
├── src/                            # Node.js API source code
│   ├── index.ts                    # Application entry point
│   ├── server.ts                   # Express server configuration
│   ├── routes/                     # API routes
│   ├── lib/                        # Logger and Prisma client
│   └── public/                     # Static public files
│
├── tests/                          # API and database tests
│   ├── api.test.ts
│   ├── helpers/
│   └── schema.test.prisma
│
├── prisma/                         # Prisma schema, migrations, and seed
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── Dockerfile                      # Multi-stage production Docker image
├── docker-compose.yml              # Local Docker Compose setup
├── file.groovy                     # Jenkins pipeline
├── package.json                    # Node.js scripts and dependencies
├── tsconfig.json                   # TypeScript configuration
├── jest.config.ts                  # Jest configuration
│
└── infra/
    ├── terraform/                  # AWS infrastructure provisioning
    │   ├── main.tf
    │   ├── ec2.tf
    │   ├── sg.tf
    │   ├── variables.tf
    │   ├── output.tf
    │   └── backend.tf
    │
    └── ansible/                    # Server setup and deployment automation
        ├── site.yml                # Main bootstrap playbook
        ├── deploy_inside_jenkins.yml
        ├── inventory_aws_ec2.yml   # AWS EC2 dynamic inventory
        ├── group_vars/
        ├── templates/
        └── roles/
            ├── common/
            ├── jenkins/
            ├── sonar/
            └── deploy/
```

---

## Infrastructure with Terraform

Terraform is used to provision AWS infrastructure.

The Terraform configuration creates EC2 instances for different responsibilities:

| Instance | Role | Purpose |
|---|---|---|
| Stage | Jenkins | CI/CD server |
| SonarQube | SonarQube | Code quality analysis |
| Deploy | Deployment | Application runtime and monitoring |
| Dev/Test | Test machine | Optional machine for initialization and Ansible access |

Terraform also configures:

- AWS key pair
- EC2 instances
- Security groups
- SSH access rules
- Jenkins access on port `8080`
- SonarQube access on port `9000`
- Application access on port `3000`
- Prometheus access on port `9090`
- Grafana access on port `3001`
- Node Exporter access on port `9100`
- cAdvisor access on port `8080`
- Encrypted gp3 root volumes
- Instance metadata options with required IMDSv2 tokens
- EC2 tags used by Ansible dynamic inventory

### Terraform Commands

```bash
cd infra/terraform

terraform init
terraform plan
terraform apply
```

### Terraform Outputs

Terraform outputs public and private IP addresses for the created instances, including:

- Jenkins server
- Deploy server
- SonarQube server
- Dev/Test server

---

## Configuration Management with Ansible

Ansible is used to configure servers after Terraform creates the infrastructure.

The main Ansible playbook is:

```bash
infra/ansible/site.yml
```

It applies different roles based on EC2 instance tags.

| Role | Purpose |
|---|---|
| `common` | Install common packages, Docker Engine, and Docker Compose plugin |
| `jenkins` | Install Jenkins, Node.js, Trivy, and Java |
| `sonar` | Run SonarQube and PostgreSQL using Docker Compose |
| `deploy` | Configure monitoring stack with Prometheus, Grafana, Node Exporter, and cAdvisor |

### Dynamic AWS Inventory

The inventory file is:

```bash
infra/ansible/inventory_aws_ec2.yml
```

It uses the `amazon.aws.aws_ec2` inventory plugin and groups instances by the `Role` tag:

- `jenkins`
- `sonar`
- `deploy`

### Test Server Connection

```bash
ansible -i inventory_aws_ec2.yml all -m ping
```
If you see “pong” in green, your inventory is working correctly.

### Run Bootstrap Playbook

```bash
ansible-playbook -i inventory_aws_ec2.yml site.yml
```

The bootstrap playbook should be run before the Jenkins deployment pipeline.

---

## CI/CD Pipeline with Jenkins

The Jenkins pipeline is defined in:

```bash
file.groovy
```

The pipeline automates testing, building, scanning, image publishing, and deployment.

### Jenkins Pipeline Stages

1. Install dependencies
2. Run tests with coverage
3. Build the TypeScript project
4. Run SonarQube scan
5. Check SonarQube Quality Gate
6. Run Trivy filesystem scan
7. Build Docker image
8. Run Trivy image scan
9. Push Docker image to DockerHub
10. Deploy to AWS using Ansible

### Required Jenkins Credentials

The Jenkins pipeline expects the following credentials:

| Credential ID | Purpose |
|---|---|
| `docker` | DockerHub username and password/token |
| `aws-access-key-id` | AWS access key ID |
| `aws-secret-access-key` | AWS secret access key |
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `DATABASE_URL` | Prisma database connection URL |

### Required Jenkins Tools

The Jenkins server should have:

- Node.js
- npm
- Docker
- Docker Compose plugin
- Trivy
- SonarQube Scanner
- Ansible
- AWS credentials access

---

## Containerization

The application uses a multi-stage Dockerfile.

### Docker Build Strategy

The Dockerfile has two stages:

#### 1. Builder Stage

The builder stage:

- Uses `node:20-bookworm-slim`
- Installs required system packages
- Installs Node.js dependencies with `npm ci`
- Generates the Prisma client
- Builds the TypeScript application
- Removes development dependencies

#### 2. Production Stage

The production stage:

- Uses `node:20-bookworm-slim`
- Sets `NODE_ENV=production`
- Copies only production artifacts
- Runs the container as the non-root `node` user
- Exposes port `3000`
- Defines a Docker health check using `/health`

### Build Docker Image Locally

```bash
docker build -t nodejs-devops-pipeline .
```

### Run Docker Compose Locally

```bash
docker compose up -d
```

---

## Deployment Process

Deployment is automated with Ansible using:

```bash
infra/ansible/deploy_inside_jenkins.yml
```

The deployment playbook runs on the `deploy` host group and performs the following tasks:

1. Creates the application directory at `/opt/nodeapp`
2. Renders the application `.env` file
3. Renders the Docker Compose environment file
4. Renders the production Docker Compose file
5. Pulls the latest application Docker image
6. Starts the PostgreSQL container
7. Runs Prisma database migrations
8. Starts the application container
9. Runs a health check against `/health`

### Deployment Directory

```bash
/opt/nodeapp
```

## Security and Code Quality

This project includes DevSecOps practices in the CI/CD pipeline.

### SonarQube

SonarQube is used for static code analysis and quality gates.

It checks:

- Code quality
- Maintainability
- Bugs
- Test coverage
- Code smells

If the SonarQube Quality Gate fails, the Jenkins pipeline stops.

### Trivy Filesystem Scan

The Jenkins pipeline scans the repository filesystem with Trivy:

```bash
trivy fs --exit-code 1 --severity HIGH,CRITICAL --scanners vuln,secret .
```

This checks for:

- Vulnerable dependencies
- High and critical vulnerabilities
- Exposed secrets

### Trivy Image Scan

The Docker image is scanned before being pushed and deployed:

```bash
trivy image --scanners vuln --ignore-unfixed --severity CRITICAL --exit-code 1 $IMAGE_URI
```

This helps prevent critical vulnerabilities from reaching the deployment server.

### Runtime Security Practices

The Docker image includes basic production security practices:

- Non-root container user
- Production-only dependencies
- Slim base image
- Health check endpoint
- Minimal production artifacts copied into the final image

---

## Monitoring

The deployment server includes a monitoring stack managed by Ansible.

The monitoring stack is deployed under:

```bash
/opt/monitoring
```

### Monitoring Tools

| Tool | Port | Purpose |
|---|---:|---|
| Prometheus | `9090` | Metrics collection and alert rule evaluation |
| Grafana | `3001` | Dashboards and visualization |
| Node Exporter | `9100` | Host-level metrics |
| cAdvisor | `8080` | Container-level metrics |

### Prometheus Targets

Prometheus scrapes:

- Prometheus itself
- Node Exporter
- cAdvisor

### Alert Rules

The project includes alert rules for:

- High CPU usage
- Instance down

---

## Environment Variables

The application requires the following environment variables:

| Variable | Description |
|---|---|
| `NODE_ENV` | Application environment, for example `development` or `production` |
| `PORT` | Application port, default is `3000` |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `LOG_LEVEL` | Logging level, for example `info` |

Example `.env` file:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://[username]:[password]@[db-name]:port/mydb
LOG_LEVEL=info
```

Do not commit real secrets or production credentials to Git.

---

## Summary

This repository demonstrates how to build a complete DevOps pipeline around a Node.js API.

It covers the full lifecycle from application code to production-style deployment:

```text
Code → Test → Build → Scan → Package → Push → Provision → Configure → Deploy → Monitor
```

The goal of this project is to practice and demonstrate practical DevOps skills using tools commonly used in real-world cloud and infrastructure environments.
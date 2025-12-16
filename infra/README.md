# BTI Cloud Infrastructure

Infrastructure as Code (IaC) for the BTI Cloud multi-tenant execution platform.

## Structure

```
infra/
├── terraform/          # Terraform configurations
│   ├── main.tf        # Root module
│   ├── modules/       # Reusable modules
│   │   ├── networking/
│   │   ├── security/
│   │   ├── database/
│   │   ├── compute/
│   │   └── observability/
│   └── environments/  # Environment-specific configs
│       ├── dev/
│       ├── staging/
│       └── prod/
├── aws/               # AWS-specific resources
└── configs/           # Configuration files
    └── policies/      # IAM policies, SCPs
```

## Prerequisites

- Terraform >= 1.5
- AWS CLI configured
- AWS account with appropriate permissions

## Deployment

### Initialize Terraform

```bash
cd infra/terraform
terraform init
```

### Plan infrastructure changes

```bash
terraform plan -var="environment=dev"
```

### Apply infrastructure

```bash
terraform apply -var="environment=dev"
```

### Destroy infrastructure

```bash
terraform destroy -var="environment=dev"
```

## Modules

### Networking
- VPC with public and private subnets
- Internet Gateway and NAT Gateway
- Route tables and associations
- Multi-AZ deployment

### Security
- KMS keys for encryption
- Secrets Manager for sensitive data
- IAM roles and policies
- Security groups

### Database
- RDS PostgreSQL (Multi-AZ in prod)
- Automated backups
- Encryption at rest
- CloudWatch logs

### Compute
- ECS Fargate cluster
- Application Load Balancer
- Auto-scaling policies
- Container definitions

### Observability
- CloudWatch Log Groups
- X-Ray tracing
- CloudWatch Dashboards
- Alarms and alerts

## Environments

### Dev
- Single-AZ database
- Minimal resources
- Cost-optimized

### Staging
- Production-like setup
- Multi-AZ database
- Full monitoring

### Prod
- Multi-AZ everything
- High availability
- Enhanced monitoring
- Backup retention: 7 days

## State Management

Terraform state is stored in S3 with DynamoDB locking (when configured):

```hcl
backend "s3" {
  bucket         = "bti-terraform-state"
  key            = "prod/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "bti-terraform-locks"
}
```

## Cost Estimation

Use `terraform plan` with cost estimation tools:

```bash
terraform plan -out=tfplan
infracost breakdown --path tfplan
```

## Security Best Practices

- All secrets in Secrets Manager
- KMS encryption for sensitive data
- Least privilege IAM policies
- Private subnets for services
- Security groups with minimal access
- Regular security audits

## Disaster Recovery

- Automated daily backups
- Cross-region replication (prod only)
- Disaster recovery plan documented
- RPO: 1 hour, RTO: 4 hours

## Monitoring & Alerts

- CloudWatch alarms for critical metrics
- SNS topics for notifications
- PagerDuty integration (prod)
- Slack webhooks for alerts

## Contributing

1. Create a feature branch
2. Make changes to modules
3. Test in `dev` environment
4. Create PR with terraform plan output
5. Apply to `staging` after approval
6. Apply to `prod` after validation

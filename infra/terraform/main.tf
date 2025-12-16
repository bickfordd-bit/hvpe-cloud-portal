# BTI Cloud Infrastructure - Main Configuration
# Bickford Technologies IC

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # backend "s3" {
  #   bucket         = "bti-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "bti-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "BTI-Cloud"
      ManagedBy   = "Terraform"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "bti-cloud"
}

# Core modules
module "networking" {
  source = "./modules/networking"
  
  environment  = var.environment
  project_name = var.project_name
  vpc_cidr     = "10.0.0.0/16"
}

module "security" {
  source = "./modules/security"
  
  environment  = var.environment
  project_name = var.project_name
}

module "database" {
  source = "./modules/database"
  
  environment     = var.environment
  project_name    = var.project_name
  vpc_id          = module.networking.vpc_id
  private_subnets = module.networking.private_subnet_ids
  
  depends_on = [module.networking]
}

module "compute" {
  source = "./modules/compute"
  
  environment      = var.environment
  project_name     = var.project_name
  vpc_id           = module.networking.vpc_id
  private_subnets  = module.networking.private_subnet_ids
  public_subnets   = module.networking.public_subnet_ids
  
  depends_on = [module.networking, module.database]
}

module "observability" {
  source = "./modules/observability"
  
  environment  = var.environment
  project_name = var.project_name
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.compute.api_gateway_url
}

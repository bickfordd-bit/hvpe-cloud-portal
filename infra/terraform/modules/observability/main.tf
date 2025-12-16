# BTI Cloud - Observability Module

variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "main" {
  name              = "/aws/${var.project_name}/${var.environment}"
  retention_in_days = var.environment == "prod" ? 90 : 30

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}

# X-Ray Sampling Rule
resource "aws_xray_sampling_rule" "main" {
  rule_name      = "${var.project_name}-${var.environment}"
  priority       = 1000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.05
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {
    Environment = var.environment
  }
}

# CloudWatch Dashboard (Stub)
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization"],
            [".", "MemoryUtilization"]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "ECS Metrics"
        }
      }
    ]
  })
}

# Outputs
output "log_group_name" {
  value = aws_cloudwatch_log_group.main.name
}

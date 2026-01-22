# MentorPlatform Kubernetes Deployment Script for Windows
# Run this in PowerShell

param(
    [string]$Action = "deploy",
    [string]$Namespace = "default"
)

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput {
    param([string]$Color, [string]$Message)
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput Green "========================================"
Write-ColorOutput Green "MentorPlatform Kubernetes Deployment"
Write-ColorOutput Green "========================================"

# Configuration
$ImageName = "mentorplatform-api"
$ImageTag = "latest"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

switch ($Action) {
    "deploy" {
        Write-ColorOutput Yellow "`nStep 1: Building Docker image..."
        Set-Location (Join-Path $ProjectDir "..")
        docker build -t "${ImageName}:${ImageTag}" -f "$ProjectDir\Dockerfile" .
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "✓ Docker image built successfully"
        } else {
            Write-ColorOutput Red "✗ Docker build failed"
            exit 1
        }

        Write-ColorOutput Yellow "`nStep 2: Applying Kubernetes configurations..."
        
        # Deploy database
        Write-ColorOutput Yellow "Deploying SQL Server database..."
        kubectl apply -f "$ProjectDir\k8s\database.yaml" -n $Namespace
        
        # Wait for database
        Write-ColorOutput Yellow "Waiting for database to be ready..."
        kubectl wait --for=condition=ready pod -l app=mssql -n $Namespace --timeout=180s
        
        # Apply ConfigMap
        Write-ColorOutput Yellow "Applying ConfigMap..."
        kubectl apply -f "$ProjectDir\k8s\configmap.yaml" -n $Namespace
        
        # Apply Secret
        Write-ColorOutput Yellow "Applying Secret..."
        kubectl apply -f "$ProjectDir\k8s\secret.yaml" -n $Namespace
        
        # Apply Deployment
        Write-ColorOutput Yellow "Applying Deployment..."
        kubectl apply -f "$ProjectDir\k8s\deployment.yaml" -n $Namespace
        
        # Apply Service
        Write-ColorOutput Yellow "Applying Service..."
        kubectl apply -f "$ProjectDir\k8s\service.yaml" -n $Namespace
        
        Write-ColorOutput Yellow "`nStep 3: Waiting for deployment to be ready..."
        kubectl rollout status deployment/mentorplatform-api -n $Namespace --timeout=300s
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "✓ Deployment successful"
        } else {
            Write-ColorOutput Red "✗ Deployment failed"
            exit 1
        }
        
        Write-ColorOutput Green "`n========================================"
        Write-ColorOutput Green "Deployment Information"
        Write-ColorOutput Green "========================================"
        
        # Get pod status
        Write-ColorOutput Yellow "`nPods:"
        kubectl get pods -l app=mentorplatform-api -n $Namespace
        
        # Get service information
        Write-ColorOutput Yellow "`nServices:"
        kubectl get svc -l app=mentorplatform-api -n $Namespace
        
        # Get NodePort
        $NodePort = kubectl get svc mentorplatform-api-service -n $Namespace -o jsonpath='{.spec.ports[0].nodePort}'
        
        Write-ColorOutput Green "`n========================================"
        Write-ColorOutput Green "Access your application:"
        Write-ColorOutput Green "========================================"
        Write-ColorOutput Yellow "NodePort URL: http://localhost:$NodePort"
        Write-ColorOutput Yellow "Health Check: http://localhost:$NodePort/health"
        Write-ColorOutput Yellow "Swagger: http://localhost:$NodePort/swagger"
    }
    
    "delete" {
        Write-ColorOutput Yellow "Deleting Kubernetes resources..."
        kubectl delete -f "$ProjectDir\k8s\" -n $Namespace
        Write-ColorOutput Green "✓ Resources deleted"
    }
    
    "status" {
        Write-ColorOutput Yellow "Deployment Status:"
        kubectl get deployments -n $Namespace
        
        Write-ColorOutput Yellow "`nPods:"
        kubectl get pods -l app=mentorplatform-api -n $Namespace
        
        Write-ColorOutput Yellow "`nServices:"
        kubectl get svc -n $Namespace
    }
    
    "logs" {
        Write-ColorOutput Yellow "Fetching logs..."
        kubectl logs -f deployment/mentorplatform-api -n $Namespace
    }
    
    default {
        Write-ColorOutput Red "Unknown action: $Action"
        Write-ColorOutput Yellow "Available actions: deploy, delete, status, logs"
        exit 1
    }
}

Write-ColorOutput Green "`n========================================"
Write-ColorOutput Green "Useful Commands:"
Write-ColorOutput Green "========================================"
Write-Output "View logs: kubectl logs -f deployment/mentorplatform-api -n $Namespace"
Write-Output "View pods: kubectl get pods -n $Namespace"
Write-Output "Restart deployment: kubectl rollout restart deployment/mentorplatform-api -n $Namespace"
Write-Output "Scale replicas: kubectl scale deployment/mentorplatform-api --replicas=3 -n $Namespace"

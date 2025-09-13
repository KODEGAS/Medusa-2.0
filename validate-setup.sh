#!/bin/bash

echo "🔍 Validating Backend Deployment Setup..."
echo "=========================================="

# Check if Dockerfile exists and is valid
if [ -f "backend/Dockerfile" ]; then
    echo "✅ Dockerfile exists"
    if grep -q "FROM node:" backend/Dockerfile; then
        echo "✅ Dockerfile uses Node.js base image"
    else
        echo "❌ Dockerfile missing Node.js base image"
    fi
    if grep -q "EXPOSE 8080" backend/Dockerfile; then
        echo "✅ Dockerfile exposes port 8080"
    else
        echo "❌ Dockerfile should expose port 8080"
    fi
    if grep -q "HEALTHCHECK" backend/Dockerfile; then
        echo "✅ Dockerfile has health check"
    else
        echo "❌ Dockerfile missing health check"
    fi
else
    echo "❌ Dockerfile not found"
fi

# Check if package.json has required scripts
if [ -f "backend/package.json" ]; then
    echo "✅ package.json exists"
    if grep -q '"start"' backend/package.json; then
        echo "✅ package.json has start script"
    else
        echo "❌ package.json missing start script"
    fi
else
    echo "❌ package.json not found"
fi

# Check if workflow file exists
if [ -f ".github/workflows/backend.yml" ]; then
    echo "✅ GitHub Actions workflow exists"
    if grep -q "backend/Dockerfile" .github/workflows/backend.yml; then
        echo "✅ Workflow references correct Dockerfile path"
    else
        echo "❌ Workflow missing Dockerfile reference"
    fi
    if grep -q "secrets.GCP_SA_KEY" .github/workflows/backend.yml; then
        echo "✅ Workflow uses GCP service account secret"
    else
        echo "❌ Workflow missing GCP secret reference"
    fi
else
    echo "❌ GitHub Actions workflow not found"
fi

# Check if .env.example exists
if [ -f "backend/.env.example" ]; then
    echo "✅ Environment template exists"
    if grep -q "MONGODB_URI" backend/.env.example; then
        echo "✅ Environment template has MongoDB URI"
    else
        echo "❌ Environment template missing MongoDB URI"
    fi
else
    echo "❌ Environment template not found"
fi

# Check if .gitignore is updated
if [ -f ".gitignore" ]; then
    if grep -q "backend/.env" .gitignore; then
        echo "✅ .gitignore excludes backend environment files"
    else
        echo "❌ .gitignore should exclude backend/.env files"
    fi
else
    echo "❌ .gitignore not found"
fi

echo ""
echo "🎯 Validation Complete!"
echo "======================"
echo "If all checks are ✅, your workflow should run successfully."
echo "Make sure to set these GitHub secrets:"
echo "  - GCP_SA_KEY: Your Google Cloud service account JSON"
echo "  - MONGODB_URI: Your MongoDB Atlas connection string"
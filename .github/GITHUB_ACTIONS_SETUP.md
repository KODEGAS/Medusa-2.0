# GitHub Actions Setup Guide

This guide explains how to set up and use the GitHub Actions workflows for the Medusa 2.0 project.

## 🚀 Available Workflows

### 1. CI/CD (`ci.yml`)
- **Triggers**: Push/PR to main/develop branches
- **Purpose**: Build, test, and deploy to GitHub Pages
- **Status**: ✅ Active

### 2. Docker Build (`docker.yml`)
- **Triggers**: Push/PR to main/develop branches, tags, manual dispatch
- **Purpose**: Build Docker images and push to GitHub Container Registry
- **Features**:
  - Multi-platform builds (AMD64/ARM64)
  - Security scanning
  - Staging/Production deployment
  - Automatic cleanup

### 3. Docker Hub (`dockerhub.yml`)
- **Triggers**: Push/PR to main/develop branches, tags, manual dispatch
- **Purpose**: Build and push images to Docker Hub
- **Note**: Requires Docker Hub credentials

### 4. Security Scan (`security.yml`)
- **Triggers**: Push/PR, weekly schedule
- **Purpose**: Security vulnerability scanning
- **Tools**: Trivy, npm audit, ESLint security rules

### 5. Manual Deploy (`deploy.yml`)
- **Triggers**: Manual trigger only
- **Purpose**: Deploy specific versions to staging/production
- **Features**: Confirmation required, environment selection

## 🔧 Required Secrets

### For GitHub Container Registry (docker.yml)
No additional secrets required - uses `GITHUB_TOKEN`

### For Docker Hub (dockerhub.yml)
```bash
DOCKERHUB_USERNAME=your_dockerhub_username
DOCKERHUB_TOKEN=your_dockerhub_access_token
```

### For Server Deployment (deploy.yml)
```bash
# Production Server
PRODUCTION_SERVER_HOST=your.production.server.com
PRODUCTION_SERVER_USER=username
PRODUCTION_SSH_KEY=your_private_ssh_key

# Staging Server
STAGING_SERVER_HOST=your.staging.server.com
STAGING_SERVER_USER=username
STAGING_SSH_KEY=your_private_ssh_key
```

## 📝 Setup Instructions

### 1. Enable GitHub Container Registry
1. Go to your repository settings
2. Navigate to "Packages" → "Container registry"
3. Ensure "Inherit access from repository" is enabled

### 2. Add Repository Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Add the required secrets listed above

### 3. Configure Environments (Optional)
1. Go to repository Settings → Environments
2. Create "staging" and "production" environments
3. Add environment secrets if needed
4. Configure required reviewers for production

### 4. Docker Hub Setup (Optional)
1. Create account at [hub.docker.com](https://hub.docker.com)
2. Generate access token in Account Settings → Security
3. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets

## 🎯 Usage Examples

### Automatic Deployment
```bash
# Push to main branch → triggers production deployment
git checkout main
git push origin main

# Push to develop branch → triggers staging deployment
git checkout develop
git push origin develop
```

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Manual Deploy" workflow
3. Click "Run workflow"
4. Choose environment (staging/production)
5. Enter image tag (optional)
6. Type "yes" to confirm
7. Click "Run workflow"

### Tagging for Release
```bash
# Create and push tag → triggers Docker build with version tags
git tag v1.0.0
git push origin v1.0.0
```

## 🔍 Monitoring & Troubleshooting

### View Build Status
- Go to Actions tab
- Click on specific workflow run
- Check logs for errors

### Common Issues

#### Docker Build Fails
- Check if Dockerfile syntax is correct
- Verify build context (files in .dockerignore)
- Check available disk space in runner

#### Deployment Fails
- Verify server credentials and SSH access
- Check if Docker is installed on target server
- Ensure docker-compose.yml exists on server

#### Security Scan Fails
- Review vulnerability report
- Update dependencies if needed
- Check if base images need updating

### Logs and Artifacts
- Build artifacts are available in workflow runs
- Security scan results appear in Security tab
- Docker images are stored in Packages section

## 🔒 Security Best Practices

1. **Use environment protection rules** for production deployments
2. **Require reviews** for production environment
3. **Rotate secrets regularly**
4. **Use least-privilege principles** for server access
5. **Monitor security scan results** weekly

## 📊 Workflow Status Badges

Add these badges to your README:

```markdown
[![CI/CD](https://github.com/your-username/medusa-2.0/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/medusa-2.0/actions/workflows/ci.yml)
[![Docker Build](https://github.com/your-username/medusa-2.0/actions/workflows/docker.yml/badge.svg)](https://github.com/your-username/medusa-2.0/actions/workflows/docker.yml)
[![Security Scan](https://github.com/your-username/medusa-2.0/actions/workflows/security.yml/badge.svg)](https://github.com/your-username/medusa-2.0/actions/workflows/security.yml)
```

## 🚨 Emergency Procedures

### Rollback Deployment
1. Go to Actions → Manual Deploy
2. Select previous working image tag
3. Deploy to affected environment

### Stop Deployment
1. Go to running workflow
2. Click "Cancel workflow"

### Access Server Directly
```bash
ssh user@your-server.com
cd /path/to/medusa-app
docker-compose logs
docker-compose restart
```

---

**Need Help?** Check the workflow logs or create an issue in the repository.

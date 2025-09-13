# Backend Deployment Guide

This guide explains how to deploy the Medusa backend to Google Cloud with automated Docker builds to GitHub Container Registry (GHCR).

## Prerequisites

1. **Google Cloud Project**: Set up a GCP project with Cloud Run enabled
2. **Service Account**: Create a service account with Cloud Run Admin and Storage Admin roles
3. **GitHub Secrets**: Configure the following secrets in your GitHub repository:
   - `GCP_SA_KEY`: Service account key JSON (download from GCP console)
   - `MONGODB_URI`: MongoDB connection string

## Setup Steps

### 1. Google Cloud Configuration

1. Create a new GCP project or use an existing one
2. Enable the following APIs:
   - Cloud Run API
   - Container Registry API (if using GCR instead of GHCR)
   - Cloud Build API

3. Create a service account:
   ```bash
   gcloud iam service-accounts create medusa-backend-sa \
     --description="Service account for Medusa backend deployment" \
     --display-name="Medusa Backend SA"
   ```

4. Grant necessary permissions:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:medusa-backend-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:medusa-backend-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   ```

5. Generate and download the service account key JSON file

### 2. GitHub Configuration

1. Go to your repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `GCP_SA_KEY`: Paste the entire JSON content of the service account key
   - `MONGODB_URI`: Your MongoDB connection string

### 3. Environment Variables

1. Copy `backend/.env.example` to `backend/.env`
2. Update the values according to your environment
3. The production environment variables are set in the GitHub Actions workflow

## Deployment Process

The backend deployment is fully automated through GitHub Actions:

1. **Trigger**: Push to `main` or `develop` branch affecting `backend/` directory
2. **Build**: Docker image is built using the `backend/Dockerfile`
3. **Push**: Image is pushed to GitHub Container Registry (GHCR)
4. **Deploy**: Image is deployed to Google Cloud Run

### Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub Actions tab
2. Select "Backend CI/CD" workflow
3. Click "Run workflow"
4. Choose environment (staging/production)

## Service Configuration

The Cloud Run service is configured with:
- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Max instances**: 10
- **Timeout**: 300 seconds
- **Port**: 8080 (internal), mapped to 443 externally

## Health Checks

The service includes health check endpoint at `/api/health`

## Monitoring

Monitor your deployment through:
- Google Cloud Console > Cloud Run
- GitHub Actions logs
- Application logs in Cloud Run

## Troubleshooting

### Common Issues

1. **Service Account Permissions**: Ensure the SA has proper roles
2. **MongoDB Connection**: Verify the connection string and network access
3. **Environment Variables**: Check that all required secrets are set
4. **Docker Build**: Ensure the Dockerfile is correct and dependencies are available

### Logs

Check logs in:
- GitHub Actions: Workflow runs
- Cloud Run: Logs tab in GCP console
- Application: Container logs

## Security Notes

- The service account key is stored securely in GitHub secrets
- Environment variables containing sensitive data are not logged
- Images are scanned for vulnerabilities before deployment
- Old images are automatically cleaned up to save storage
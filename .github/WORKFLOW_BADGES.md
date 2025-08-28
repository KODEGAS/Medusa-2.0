# Workflow Status Badges

Add these badges to your README.md to show the status of your CI/CD pipelines:

```markdown
[![CI/CD](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/ci.yml)
[![Docker Build](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/docker.yml/badge.svg)](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/docker.yml)
[![Security Scan](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/security.yml/badge.svg)](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/security.yml)
[![Docker Hub](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/dockerhub.yml/badge.svg)](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/dockerhub.yml)
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 📊 Example Implementation

Here's how the badges look in action:

[![CI/CD](https://github.com/actions/actions/workflows/ci/badge.svg)](https://github.com/actions/actions/workflows/ci/badge.svg)
[![Docker Build](https://github.com/actions/actions/workflows/docker/badge.svg)](https://github.com/actions/actions/workflows/docker/badge.svg)
[![Security Scan](https://github.com/actions/actions/workflows/security/badge.svg)](https://github.com/actions/actions/workflows/security/badge.svg)

## 🎨 Customization

You can customize the branch or workflow:

```markdown
<!-- Specific branch -->
[![CI/CD](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/ci.yml)

<!-- Different style -->
[![CI/CD](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/ci.yml/badge.svg?style=flat-square)](https://github.com/YOUR_USERNAME/medusa-2.0/actions/workflows/ci.yml)
```

Available styles: `flat`, `flat-square`, `plastic`, `for-the-badge`

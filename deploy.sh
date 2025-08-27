#!/bin/bash

# Medusa 2.0 Deployment Script
# Usage: ./deploy.sh [environment] [method]
# Environment: production (default) or staging
# Method: traditional (default), docker, or docker-compose

set -e

echo "🚀 Medusa 2.0 Deployment Script"
echo "================================="

# Configuration
DOMAIN="medusa.ecsc-uok.com"
ENVIRONMENT=${1:-production}
DEPLOY_METHOD=${2:-traditional}
BUILD_DIR="dist"
REMOTE_PATH="/var/www/${DOMAIN}/html"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if required commands exist
    command -v bun >/dev/null 2>&1 || { log_error "bun is required but not installed."; exit 1; }

    # Check if dist directory exists and clean it
    if [ -d "$BUILD_DIR" ]; then
        log_info "Cleaning previous build..."
        rm -rf "$BUILD_DIR"
    fi

    # Check for required files
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi

    log_info "Pre-deployment checks passed!"
}

# Build application
build_application() {
    log_info "Building application for $ENVIRONMENT..."

    if [ "$ENVIRONMENT" = "production" ]; then
        bun run build:production
    else
        bun run build
    fi

    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed. $BUILD_DIR directory not found."
        exit 1
    fi

    log_info "Build completed successfully!"
}

# Validate build
validate_build() {
    log_info "Validating build..."

    # Check for essential files
    essential_files=("index.html" "assets/" "robots.txt" "sitemap.xml")
    for file in "${essential_files[@]}"; do
        if [ ! -e "$BUILD_DIR/$file" ]; then
            log_error "Essential file missing: $file"
            exit 1
        fi
    done

    # Check file sizes
    index_size=$(stat -f%z "$BUILD_DIR/index.html" 2>/dev/null || stat -c%s "$BUILD_DIR/index.html" 2>/dev/null)
    if [ "$index_size" -lt 1000 ]; then
        log_warn "index.html seems small ($index_size bytes). Please verify build."
    fi

    log_info "Build validation passed!"
}

# Show deployment summary
show_deployment_summary() {
    log_info "Deployment Summary"
    echo "=================="
    echo "Domain: https://$DOMAIN"
    echo "Environment: $ENVIRONMENT"
    echo "Build Directory: $BUILD_DIR"
    echo "Remote Path: $REMOTE_PATH"
    echo ""

    # Show file sizes
    echo "Build Contents:"
    if command -v du >/dev/null 2>&1; then
        du -sh "$BUILD_DIR"/*
    else
        ls -lah "$BUILD_DIR"/
    fi
    echo ""

    # Show important URLs
    echo "Important URLs:"
    echo "• Homepage: https://$DOMAIN"
    echo "• Registration: https://$DOMAIN/register"
    echo "• Sitemap: https://$DOMAIN/sitemap.xml"
    echo "• Robots: https://$DOMAIN/robots.txt"
    echo ""
}

# Deployment instructions
show_deployment_instructions() {
    log_info "Deployment Instructions"
    echo "========================"
    echo ""
    echo "1. Upload the '$BUILD_DIR' folder contents to your web server"
    echo "2. Target directory: $REMOTE_PATH"
    echo "3. Ensure proper file permissions (755 for directories, 644 for files)"
    echo "4. Configure your web server (Apache/Nginx) with the settings in DEPLOYMENT_GUIDE.md"
    echo "5. Set up SSL certificate for HTTPS"
    echo "6. Test the website functionality"
    echo "7. Submit sitemap to Google Search Console"
    echo ""
    echo "Quick upload commands:"
    echo "# Using rsync (recommended):"
    echo "rsync -avz --delete $BUILD_DIR/ user@server:$REMOTE_PATH/"
    echo ""
    echo "# Using scp:"
    echo "scp -r $BUILD_DIR/* user@server:$REMOTE_PATH/"
    echo ""
    echo "# Using FTP:"
    echo "ftp> cd $REMOTE_PATH"
    echo "ftp> mput $BUILD_DIR/*"
    echo ""
}

# Docker deployment
docker_deployment() {
    log_info "Deploying with Docker..."

    # Check if Docker is installed
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed."; exit 1; }

    # Build Docker image
    log_info "Building Docker image..."
    docker build -t medusa-2.0:$ENVIRONMENT .

    # Stop and remove existing container if running
    if docker ps -q -f name=medusa-frontend | grep -q .; then
        log_info "Stopping existing container..."
        docker stop medusa-frontend
    fi

    if docker ps -a -q -f name=medusa-frontend | grep -q .; then
        log_info "Removing existing container..."
        docker rm medusa-frontend
    fi

    # Run new container
    log_info "Starting new container..."
    docker run -d \
        --name medusa-frontend \
        -p 3000:80 \
        --restart unless-stopped \
        medusa-2.0:$ENVIRONMENT

    log_info "Docker deployment completed!"
    log_info "Application is running at: http://localhost:3000"
}

# Docker Compose deployment
docker_compose_deployment() {
    log_info "Deploying with Docker Compose..."

    # Check if docker-compose is installed
    if command -v docker-compose >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        log_error "docker-compose is required but not installed."
        exit 1
    fi

    # Deploy based on environment
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "Starting development environment..."
        $DOCKER_COMPOSE_CMD --profile dev up -d
        log_info "Development server running at: http://localhost:8080"
    else
        log_info "Starting production environment..."
        $DOCKER_COMPOSE_CMD up -d medusa-frontend
        log_info "Production server running at: http://localhost:3000"
    fi

    log_info "Docker Compose deployment completed!"
}

# Main deployment process
main() {
    echo "Starting deployment for $ENVIRONMENT environment using $DEPLOY_METHOD method..."
    echo ""

    case $DEPLOY_METHOD in
        "docker")
            pre_deployment_checks
            docker_deployment
            ;;
        "docker-compose")
            docker_compose_deployment
            ;;
        "traditional")
            pre_deployment_checks
            build_application
            validate_build
            show_deployment_summary
            show_deployment_instructions
            log_info "🎉 Deployment preparation complete!"
            log_info "Follow the instructions above to deploy to your server."
            ;;
        *)
            log_error "Unknown deployment method: $DEPLOY_METHOD"
            log_error "Available methods: traditional, docker, docker-compose"
            exit 1
            ;;
    esac

    log_info "Don't forget to test the website after deployment!"
}

# Run main function
main "$@"

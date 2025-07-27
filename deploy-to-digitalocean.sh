#!/bin/bash

# ClutchZone Digital Ocean Deployment Script
# This script sets up the complete infrastructure on Digital Ocean

set -e

echo "🎮 ClutchZone Digital Ocean Deployment Starting..."

# Configuration
DROPLET_NAME="clutchzone-prod"
DROPLET_SIZE="s-2vcpu-4gb"
DROPLET_IMAGE="ubuntu-22-04-x64"
DROPLET_REGION="nyc1"
DOMAIN="clutchzone.app"

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

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    log_error "doctl is not installed. Please install it first:"
    echo "https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if user is authenticated
if ! doctl account get &> /dev/null; then
    log_error "Please authenticate with Digital Ocean first:"
    echo "doctl auth init"
    exit 1
fi

log_info "Setting up Digital Ocean infrastructure..."

# Create SSH key if it doesn't exist
SSH_KEY_NAME="clutchzone-key"
if ! doctl compute ssh-key list | grep -q "$SSH_KEY_NAME"; then
    log_info "Creating SSH key..."
    if [ ! -f ~/.ssh/clutchzone_rsa ]; then
        ssh-keygen -t rsa -b 4096 -C "clutchzone@deployment" -f ~/.ssh/clutchzone_rsa -N ""
    fi
    doctl compute ssh-key import $SSH_KEY_NAME --public-key-file ~/.ssh/clutchzone_rsa.pub
fi

# Get SSH key ID
SSH_KEY_ID=$(doctl compute ssh-key list --format ID,Name --no-header | grep "$SSH_KEY_NAME" | cut -d' ' -f1)

# Create Container Registry
log_info "Setting up Container Registry..."
if ! doctl registry get clutchzone &> /dev/null; then
    doctl registry create clutchzone --subscription-tier basic
fi

# Create VPC Network
log_info "Creating VPC network..."
VPC_ID=$(doctl vpcs create clutchzone-vpc --region $DROPLET_REGION --ip-range 10.116.0.0/20 --format ID --no-header)
log_info "VPC created with ID: $VPC_ID"

# Create Database Cluster
log_info "Setting up managed PostgreSQL database..."
DB_CLUSTER_NAME="clutchzone-db"
if ! doctl databases cluster list | grep -q "$DB_CLUSTER_NAME"; then
    doctl databases cluster create $DB_CLUSTER_NAME \
        --engine pg \
        --version 15 \
        --size db-s-1vcpu-1gb \
        --region $DROPLET_REGION \
        --num-nodes 1
    
    log_info "Waiting for database cluster to be ready..."
    while [ "$(doctl databases cluster get $DB_CLUSTER_NAME --format Status --no-header)" != "online" ]; do
        sleep 30
        echo "Database cluster status: $(doctl databases cluster get $DB_CLUSTER_NAME --format Status --no-header)"
    done
fi

# Create Redis Cluster
log_info "Setting up managed Redis cluster..."
REDIS_CLUSTER_NAME="clutchzone-redis"
if ! doctl databases cluster list | grep -q "$REDIS_CLUSTER_NAME"; then
    doctl databases cluster create $REDIS_CLUSTER_NAME \
        --engine redis \
        --version 7 \
        --size db-s-1vcpu-1gb \
        --region $DROPLET_REGION \
        --num-nodes 1
    
    log_info "Waiting for Redis cluster to be ready..."
    while [ "$(doctl databases cluster get $REDIS_CLUSTER_NAME --format Status --no-header)" != "online" ]; do
        sleep 30
        echo "Redis cluster status: $(doctl databases cluster get $REDIS_CLUSTER_NAME --format Status --no-header)"
    done
fi

# Create Load Balancer
log_info "Setting up Load Balancer..."
LB_NAME="clutchzone-lb"
if ! doctl compute load-balancer list | grep -q "$LB_NAME"; then
    doctl compute load-balancer create \
        --name $LB_NAME \
        --region $DROPLET_REGION \
        --forwarding-rules entry_protocol:https,entry_port:443,target_protocol:http,target_port:80,certificate_id:,tls_passthrough:false \
        --forwarding-rules entry_protocol:http,entry_port:80,target_protocol:http,target_port:80 \
        --health-check protocol:http,port:80,path:/health,check_interval_seconds:10,response_timeout_seconds:5,healthy_threshold:3,unhealthy_threshold:3 \
        --vpc-uuid $VPC_ID
fi

# Create Droplet
log_info "Creating production droplet..."
if ! doctl compute droplet list | grep -q "$DROPLET_NAME"; then
    DROPLET_ID=$(doctl compute droplet create $DROPLET_NAME \
        --size $DROPLET_SIZE \
        --image $DROPLET_IMAGE \
        --region $DROPLET_REGION \
        --ssh-keys $SSH_KEY_ID \
        --vpc-uuid $VPC_ID \
        --user-data-file - <<EOF
#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose-plugin git nginx certbot python3-certbot-nginx
systemctl enable docker
systemctl start docker
usermod -aG docker root

# Install doctl
cd /tmp
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
mv doctl /usr/local/bin

# Clone repository
cd /opt
git clone https://github.com/yourusername/clutchzone.git
cd clutchzone

# Set up environment
echo "Setting up production environment..."
echo "ENVIRONMENT=production" > .env
EOF
        --format ID --no-header)
    
    log_info "Droplet created with ID: $DROPLET_ID"
    
    # Wait for droplet to be ready
    log_info "Waiting for droplet to be ready..."
    while [ "$(doctl compute droplet get $DROPLET_ID --format Status --no-header)" != "active" ]; do
        sleep 10
    done
fi

# Get droplet IP
DROPLET_IP=$(doctl compute droplet list --format Name,PublicIPv4 --no-header | grep "$DROPLET_NAME" | awk '{print $2}')
log_info "Droplet IP: $DROPLET_IP"

# Add droplet to load balancer
LB_ID=$(doctl compute load-balancer list --format ID,Name --no-header | grep "$LB_NAME" | cut -d' ' -f1)
DROPLET_ID=$(doctl compute droplet list --format ID,Name --no-header | grep "$DROPLET_NAME" | cut -d' ' -f1)
doctl compute load-balancer add-droplets $LB_ID --droplet-ids $DROPLET_ID

# Set up domain
log_info "Setting up domain..."
if ! doctl compute domain list | grep -q "$DOMAIN"; then
    doctl compute domain create $DOMAIN --ip-address $DROPLET_IP
fi

# Create DNS records
doctl compute domain records create $DOMAIN --record-type A --record-name www --record-data $DROPLET_IP
doctl compute domain records create $DOMAIN --record-type A --record-name monitoring --record-data $DROPLET_IP
doctl compute domain records create $DOMAIN --record-type A --record-name api --record-data $DROPLET_IP

# Set up SSL certificate
log_info "Setting up SSL certificate..."
LB_IP=$(doctl compute load-balancer list --format IP --no-header | grep -v "IP")

# Wait for DNS propagation
log_info "Waiting for DNS propagation (this may take a few minutes)..."
sleep 60

# SSH into droplet and complete setup
log_info "Completing server setup..."
ssh -i ~/.ssh/clutchzone_rsa -o StrictHostKeyChecking=no root@$DROPLET_IP << 'ENDSSH'
# Get SSL certificate
certbot --nginx -d clutchzone.app -d www.clutchzone.app -d monitoring.clutchzone.app --non-interactive --agree-tos --email admin@clutchzone.app

# Set up authentication for monitoring
htpasswd -cb /etc/nginx/.htpasswd admin "$(openssl rand -base64 32)"

# Get database connection details
echo "Getting database connection details..."

# Set up environment variables (these would come from your secrets)
cd /opt/clutchzone
cat > .env << EOF
DATABASE_URL=postgresql://clutchzone:yourpassword@your-db-host:25060/clutchzone?sslmode=require
REDIS_URL=redis://default:yourpassword@your-redis-host:25061
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1395698909732405388/ziKiswty7F9Ce6D86RBnSUDpPlFsjQD2XvBW54eMM1NKfKe1_r1_tRZ8oT17QeLG5FWH
SECRET_KEY=$(openssl rand -hex 32)
ENVIRONMENT=production
EOF

# Start services
docker-compose up -d

# Set up log rotation
cat > /etc/logrotate.d/clutchzone << 'LOGEOF'
/opt/clutchzone/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    copytruncate
    notifempty
}
LOGEOF

echo "Server setup completed!"
ENDSSH

# Create monitoring setup
log_info "Setting up monitoring..."
mkdir -p monitoring

cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'clutchzone-api'
    static_configs:
      - targets: ['clutchzone-api:8000']
    metrics_path: '/api/metrics'
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

cat > monitoring/grafana/dashboards/clutchzone.json << 'EOF'
{
  "dashboard": {
    "title": "ClutchZone Analytics",
    "panels": [
      {
        "title": "API Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(api_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_users"
          }
        ]
      }
    ]
  }
}
EOF

# Final setup
log_info "Final deployment steps..."

# Get database and Redis connection info
DB_HOST=$(doctl databases cluster get $DB_CLUSTER_NAME --format Host --no-header)
DB_PASSWORD=$(doctl databases cluster get $DB_CLUSTER_NAME --format Password --no-header)
REDIS_HOST=$(doctl databases cluster get $REDIS_CLUSTER_NAME --format Host --no-header)
REDIS_PASSWORD=$(doctl databases cluster get $REDIS_CLUSTER_NAME --format Password --no-header)

# Update environment variables on server
ssh -i ~/.ssh/clutchzone_rsa root@$DROPLET_IP << ENDSSH2
cd /opt/clutchzone
sed -i "s|your-db-host|$DB_HOST|g" .env
sed -i "s|yourpassword|$DB_PASSWORD|g" .env
sed -i "s|your-redis-host|$REDIS_HOST|g" .env
docker-compose down
docker-compose up -d
ENDSSH2

# Display deployment information
log_info "🎉 ClutchZone deployment completed successfully!"
echo ""
echo "=== Deployment Information ==="
echo "🌐 Website: https://$DOMAIN"
echo "📊 Monitoring: https://monitoring.$DOMAIN"
echo "🔧 API: https://api.$DOMAIN"
echo "🖥️  Server IP: $DROPLET_IP"
echo "🗄️  Database: $DB_HOST"
echo "🔴 Redis: $REDIS_HOST"
echo ""
echo "=== Next Steps ==="
echo "1. Update GitHub secrets with the following:"
echo "   - DROPLET_IP: $DROPLET_IP"
echo "   - DROPLET_SSH_KEY: (content of ~/.ssh/clutchzone_rsa)"
echo "   - DB_PASSWORD: $DB_PASSWORD"
echo "   - SECRET_KEY: (generated in .env file)"
echo ""
echo "2. Configure your Discord bot token if you have one"
echo "3. Set up monitoring alerts in Grafana"
echo "4. Test the deployment thoroughly"
echo ""
echo "🚀 Your ClutchZone platform is now live!"

# Save deployment info
cat > deployment-info.txt << EOF
ClutchZone Deployment Information
Generated: $(date)

URLs:
- Website: https://$DOMAIN
- Monitoring: https://monitoring.$DOMAIN
- API: https://api.$DOMAIN

Infrastructure:
- Server IP: $DROPLET_IP
- Database Host: $DB_HOST
- Redis Host: $REDIS_HOST
- Load Balancer ID: $LB_ID
- VPC ID: $VPC_ID

SSH Access:
ssh -i ~/.ssh/clutchzone_rsa root@$DROPLET_IP

Container Registry:
registry.digitalocean.com/clutchzone
EOF

log_info "Deployment information saved to deployment-info.txt"

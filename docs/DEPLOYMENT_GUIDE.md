# EpilepsyGuard Deployment Guide

**Version:** 2.0.0  
**Platform:** Linux/WSL (Ubuntu 20.04+)  
**Last Updated:** December 27, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System:** Ubuntu 20.04+ (or  WSL2 on Windows)
- **RAM:** Minimum 8GB (16GB recommended)
- **Disk Space:** 50GB free space
- **Network:** Stable internet connection

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Java | 11 | Cassandra, Kafka, Flink|
| Python | 3.8 | Data processing, ML |
| Node.js | 16.x or 18.x | Backend API |
| npm | 8.x+ | Frontend dependencies |
| Apache Cassandra | 4.x | Distributed database |
| Apache Kafka | 2.8+ | Message streaming |
| Apache Flink | 1.14.6 | Stream processing |

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/EpilepsyGuard.git
cd EpilepsyGuard
```

### Step 2: Set up Python Environment

```bash
# Create virtual environment
python3.8 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Install Node.js Dependencies

```bash
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### Step 4: Start All Services

The easiest way to start all services is using the provided script:

```bash
chmod +x start_demo.sh
./start_demo.sh
```

This script will start:
1. Cassandra database
2. Zookeeper
3. Kafka broker
4. Data generator
5. Flink processor
6. Backend API
7. Frontend React app

**Wait time:** Allow 2-3 minutes for all services to fully initialize.

### Step 5: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

### Step 6: Stopping Services

To stop all running services:

```bash
chmod +x stop_all.sh
./stop_all.sh
```

---

## Production Deployment

### Architecture Overview

```
┌──────────────┐
│  Load        │
│  Balancer    │  (Nginx/HAProxy)
└──────┬───────┘
       │
   ┌───┴────────────────┐
   │                    │
┌──▼─────┐      ┌──────▼──┐
│Frontend│      │ Backend │
│(React) │      │(Node.js)│
└────────┘      └─────┬───┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    ┌───▼───┐    ┌───▼───┐    ┌───▼────┐
    │Kafka  │    │Flink  │    │Cassandra│
    │Cluster│    │Cluster│    │ Cluster │
    └───────┘    └───────┘    └─────────┘
```

### Environment Configuration

Create a `.env` file in the root directory:

```bash
# Backend
PORT=5000
NODE_ENV=production
CASSANDRA_HOSTS=cassandra1,cassandra2,cassandra3
CASSANDRA_KEYSPACE=epilepsy_monitoring
CASSANDRA_DATACENTER=datacenter1

# Frontend
REACT_APP_API_URL=https://api.epilepsyguard.com

# Kafka
KAFKA_BROKERS=kafka1:9092,kafka2:9092,kafka3:9092
KAFKA_TOPIC=epilepsy_telemetry

# Security
JWT_SECRET=your-secret-key-here
ENABLE_CORS=false
ALLOWED_ORIGINS=https://dashboard.epilepsyguard.com
```

### Production Build

#### Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/build/`.

#### Backend

The Node.js backend doesn't require  a build step, but ensure you're using production dependencies:

```bash
cd backend
npm ci --production
```

### Deployment Steps

1. **Set up reverse proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name dashboard.epilepsyguard.com;
    
    location / {
        root /var/www/epilepsyguard/frontend/build;
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Set up SSL with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.epilepsyguard.com
```

3. **Configure systemd service for backend**

Create `/etc/systemd/system/epilepsyguard-backend.service`:

```ini
[Unit]
Description=EpilepsyGuard Backend API
After=network.target

[Service]
Type=simple
User=epilepsyguard
WorkingDirectory=/opt/epilepsyguard/backend
ExecStart=/usr/bin/node flask_app.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable epilepsyguard-backend
sudo systemctl start epilepsyguard-backend
```

---

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  cassandra:
    image: cassandra:4.0
    ports:
      - "9042:9042"
    environment:
      - CASSANDRA_CLUSTER_NAME=epilepsyguard
      - CASSANDRA_DC=dc1
      - CASSANDRA_RACK=rack1
    volumes:
      - cassandra_data:/var/lib/cassandra
    healthcheck:
      test: ["CMD-SHELL", "cqlsh -e 'describe cluster'"]
      interval: 30s
      timeout: 10s
      retries: 5

  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.0.1
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    depends_on:
      - cassandra
      - kafka
    environment:
      - CASSANDRA_HOSTS=cassandra
      - KAFKA_BROKERS=kafka:9092

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  cassandra_data:
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5000

CMD ["node", "flask_app.js"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v
```

---

## Cloud Deployment

### AWS Deployment

#### Architecture

- **Frontend:** S3 + CloudFront
- **Backend:** EC2 or ECS
- **Database:** Managed Cassandra (Amazon Keyspaces)
- **Kafka:** Amazon MSK (Managed Streaming for Kafka)
- **Flink:** Amazon Kinesis Data Analytics

#### Steps

1. **Set up Amazon Keyspaces (Cassandra)**
```bash
aws keyspaces create-keyspace --keyspace-name epilepsy_monitoring
```

2. **Deploy backend to EC2/ECS**
```bash
# Create EC2 instance
aws ec2 run-instances \
  --image-id ami-xxxxxxxxx \
  --instance-type t3.medium \
  --key-name your-key \
  --security-groups epilepsyguard-sg
```

3. **Deploy frontend to S3 + CloudFront**
```bash
# Build frontend
cd frontend && npm run build

# Upload to S3
aws s3 sync build/ s3://epilepsyguard-frontend/

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name epilepsyguard-frontend.s3.amazonaws.com
```

### Google Cloud Platform (GCP)

- **Frontend:** Cloud Storage + Cloud CDN
- **Backend:** Cloud Run or GKE
- **Database:** Managed Cassandra (Datastax Astra)
- **Kafka:** Confluent Cloud
- **Flink:** Dataflow

### Azure Deployment

- **Frontend:** Azure Storage + Azure CDN
- **Backend:** Azure App Service or AKS
- **Database:** Azure Cosmos DB (Cassandra API)
- **Kafka:** Azure Event Hubs
- **Flink:** Azure Stream Analytics

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Cassandra health
cqlsh -e "SELECT now() FROM system.local;"

# Kafka health
kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Logging

Configure logging for production:

**Backend (Node.js  - using Winston):**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Monitoring Tools

- **Application Monitoring:** Prometheus + Grafana
- **Log Aggregation:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **APM:** New Relic or Datadog
- **Uptime Monitoring:** UptimeRobot or Pingdom

---

## Troubleshooting

### Common Issues

#### Cassandra Won't Start
```bash
# Check logs
tail -f /var/log/cassandra/system.log

# Verify Java version
java -version  # Should be Java 11

# Check  port availability
netstat -tuln | grep 9042
```

#### Kafka Connection Issues
```bash
# Check if Kafka is running
ps aux | grep kafka

# Test connectivity
kafka-console-producer.sh --broker-list localhost:9092 --topic test

# View consumer groups
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

#### Backend API Errors
```bash
# Check backend logs
tail -f backend/backend.log

# Verify Cassandra connection
cqlsh -e "DESCRIBE epilepsy_monitoring.vitals_data;"

# Test API endpoint
curl http://localhost:5000/api/health
```

---

## Security Considerations

### Production Security Checklist

- [ ] Enable HTTPS/TLS for all communications
- [ ] Implement authentication (JWT)
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable Cassandra authentication
- [ ] Implement API request logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Cassandra Security

```cql
-- Create admin user
CREATE ROLE admin WITH PASSWORD = 'strong_password' AND LOGIN = true AND SUPERUSER = true;

-- Create app user with limited permissions
CREATE ROLE app_user WITH PASSWORD = 'app_password' AND LOGIN = true;
GRANT SELECT, MODIFY ON KEYSPACE epilepsy_monitoring TO app_user;
```

---

## Backup & Disaster Recovery

### Cassandra Backup

```bash
# Take snapshot
nodetool snapshot epilepsy_monitoring

# List snapshots
nodetool listsnapshots

# Restore from snapshot
# (Copy snapshot files to data directory and restart Cassandra)
```

### Automated Backups

Set up  cron job for daily backups:
```bash
0 2 * * * /opt/epilepsyguard/scripts/backup.sh
```

---

## Performance Optimization

### Database Tuning

- Adjust Cassandra heap size based on data volume
- Configure compaction strategies
- Monitor garbage collection
- Use appropriate replication factor

### Backend Optimization

- Enable Node.js clustering
- Implement caching (Redis)
- Use connection pooling for Cassandra
- Optimize queries (avoid ALLOW FILTERING)

### Frontend Optimization

- Enable gzip compression
- Implement code splitting
- Use CDN for static assets
- Optimize images and assets
- Lazy load components

---

**Support:** For deployment issues, contact PES1PG24CA269@pesu.pes.edu

---

*Last Updated: December 27, 2025*  
*Version: 2.0.0*  
*Author: Manu N M*

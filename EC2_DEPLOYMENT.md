# AWS EC2 Deployment Guide for Notes Manager

## Prerequisites
- AWS Account
- SSH Key Pair
- Basic knowledge of Linux commands

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose AMI: **Ubuntu Server 22.04 LTS** (free tier eligible)
3. Instance Type: **t2.micro** (free tier)
4. Key Pair: Create or select your SSH key pair
5. Security Group:
   - SSH (22) - My IP
   - HTTP (80) - Anywhere (or 0.0.0.0/0)
   - Custom TCP (3000) - Anywhere (for direct access)
6. Storage: 8GB (default)
7. Launch Instance

## Step 2: Connect to Your Instance

```bash
# Replace with your instance's public IP
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## Step 3: Update System and Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Verify installations
node --version
npm --version
psql --version
pm2 --version
```

## Step 4: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE notes_db;
CREATE USER notes_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE notes_db TO notes_user;
ALTER USER notes_user CREATEDB;
\q
```

## Step 5: Clone and Set Up Application

```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/notes-manager.git
cd notes-manager

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
```

In the `.env` file, update:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_db
DB_USER=notes_user
DB_PASSWORD=your_secure_password_here
PORT=3000
NODE_ENV=production
```

## Step 6: Set Up Database Schema

```bash
# Run database setup
sudo -u postgres psql -d notes_db -f database_setup.sql
```

## Step 7: Test and Start Application

```bash
# Test the application
npm start

# If it works, stop it (Ctrl+C) and use PM2 for production
pm2 start server.js --name notes-manager
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs notes-manager
```

## Step 8: Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/notes-manager

# Add this content:
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/notes-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 9: Access Your Application

- **Direct Access**: `http://YOUR_EC2_PUBLIC_IP:3000`
- **Via Nginx**: `http://YOUR_EC2_PUBLIC_IP`

## Step 10: Monitoring and Logs

```bash
# Check application logs
pm2 logs notes-manager

# Monitor resources
pm2 monit

# Restart application
pm2 restart notes-manager

# Check PM2 status
pm2 status
```

## Security Best Practices

1. **Change default SSH port** (optional)
2. **Use HTTPS** (Let's Encrypt for free SSL)
3. **Regular updates**: `sudo apt update && sudo apt upgrade`
4. **Firewall**: `sudo ufw enable`
5. **Strong passwords** for database
6. **Environment variables** for sensitive data

## Troubleshooting

### Application not starting?
```bash
# Check logs
pm2 logs notes-manager

# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Test database connection
psql -h localhost -U notes_user -d notes_db
```

### Database connection issues?
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l
```

### Permission issues?
```bash
# Check file permissions
ls -la ~/notes-manager/

# Fix permissions if needed
chmod +x ~/notes-manager/server.js
```

## Cost Optimization

- Use **t2.micro** for development (free tier)
- Stop instance when not in use
- Set up auto-scaling for production
- Use RDS instead of EC2 PostgreSQL for better performance

## Backup Strategy

```bash
# Database backup
pg_dump -U notes_user -h localhost notes_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup (if needed)
tar -czf app_backup_$(date +%Y%m%d).tar.gz ~/notes-manager
```

## Next Steps

1. Set up domain name and DNS
2. Configure HTTPS with Let's Encrypt
3. Set up monitoring (CloudWatch)
4. Implement CI/CD pipeline
5. Add load balancer for scaling
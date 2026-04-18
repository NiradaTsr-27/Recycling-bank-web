# คู่มือ Deployment

## วิธีที่ 1: Vercel (ที่สุดแนะนำสำหรับ Next.js)

### ข้อมูลประจำตัว:
- ✅ ใช้ได้ง่าย (ใช้ GitHub)
- ✅ Database ต่างประเทศ (Vercel Postgres, Neon, สูง, Railway)
- ✅ Auto deploy จาก GitHub
- ✅ SSL/HTTPS อัตโนมัติ

### ขั้นตอน:

1. **สร้าง Database ที่ Provider ใดหนึ่ง:**
   - [Vercel Postgres](https://vercel.com/storage/postgres) - ฟรีสำหรับ hobby
   - [Neon.tech](https://neon.tech) - ฟรี 3 projects
   - [Railway](https://railway.app) - \$5/month credit
   - [AWS RDS](https://aws.amazon.com/rds)

2. **ใน Vercel Dashboard:**
   ```
   1. New Project → Import GitHub repo
   2. Environment Variables:
      - DATABASE_URL: your_db_connection_string
      - NEXTAUTH_URL: https://yourdomain.vercel.app
      - NEXTAUTH_SECRET: (generate ด้วย: openssl rand -base64 32)
   3. Deploy
   ```

3. **Run Migrations หลัง Deploy:**
   ```bash
   npx prisma migrate deploy
   ```

---

## วิธีที่ 2: Docker + VPS (Self-hosted)

### ข้อมูลประจำตัว:
- ✅ ควบคุมแบบเต็มที่
- ✅ ลดค่าใช้งาน
- ❌ ต้องจัดการเอง (maintenance, backups)

### ขั้นตอน:

1. **Prepare VPS:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone your repo and setup:**
   ```bash
   git clone your-repo-url
   cd recycling-bank-final
   
   # Copy env file
   cp .env.example .env
   
   # Edit .env with your settings
   nano .env
   ```

3. **Run with Docker Compose:**
   ```bash
   # Build and start (จะ create database + run migrations)
   docker-compose up -d
   
   # Check logs
   docker-compose logs -f app
   ```

4. **Setup SSL (recommend Nginx + Let's Encrypt):**
   ```bash
   sudo apt install nginx-core certbot python3-certbot-nginx -y
   
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/yourdomain.com
   ```

   **Nginx Config example:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable config
   sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl start nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com
   ```

---

## วิธีที่ 3: Railway.app (ง่าย + จ่ายแบบ usage)

### ขั้นตอน:
1. ไป [railway.app](https://railway.app)
2. Login ด้วย GitHub
3. Create new project → Deploy from GitHub repo
4. Add PostgreSQL plugin (automatic)
5. Set environment variables
6. Deploy

---

## Environment Variables ที่จำเป็น:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db_name
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-value
NODE_ENV=production
```

---

## Database Backup

### สำหรับ Docker:
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres recycling_bank > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres recycling_bank < backup.sql
```

### สำหรับ Cloud Provider (Vercel/Railway):
- มีระบบ automatic backup แล้ว
- Access ผ่าน dashboard ของ provider

---

## Troubleshooting

### Migration ล้มเหลว:
```bash
# Manual run
npx prisma migrate deploy

# Reset (warning: จะลบ data ทั้งหมด!)
npx prisma migrate reset
```

### Database connection error:
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db push
```

### Check logs:
```bash
# Vercel
vercel logs

# Docker
docker-compose logs -f

# VPS app using PM2
pm2 logs
```

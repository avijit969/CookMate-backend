# CookMate Backend 🍳

CookMate-backend is the server-side application for the CookMate platform, facilitating recipe management, social interactions (likes, comments, saves), and user authentication. Built with **Bun** and **Hono** for high performance, it utilizes **PostgreSQL** (managed with **Drizzle ORM**) for data persistence and **Redis** for caching.

## 🚀 Technical Architecture

- **Runtime**: [Bun](https://bun.sh/) - A fast JavaScript all-in-one toolkit.
- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework for the Edges.
- **Database**: PostgreSQL (via [Neon](https://neon.tech/) or generic Postgres).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Lightweight and type-safe.
- **Caching**: [Redis](https://redis.io/) - For rapid data retrieval.
- **Microservices/External**:
  - **Storage**: Cloudflare R2 (S3 compatible) via AWS SDK.
  - **Email**: [Resend](https://resend.com/).
  - **Notifications**: Expo Push Notifications.

## 📖 API Documentation

The complete API reference is available at:
👉 **[https://cookmate.avijit.site/docs](https://cookmate.avijit.site/docs)**

## 🛠️ Local Development Setup

### Prerequisites
- [Bun](https://bun.sh/) installed.
- PostgreSQL database URL.
- Redis instance (local or remote).
- Cloudflare R2 / AWS S3 credentials.
- Resend API Key.

### 1. Clone the repository
```bash
git clone https://github.com/avijit969/CookMate-backend.git
cd CookMate-backend
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgres://user:pass@host:5432/db_name"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your_jwt_secret"

# AWS / Cloudflare R2
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="auto"
AWS_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
BUCKET_NAME="your_bucket_name"

# Email (Resend)
RESEND_API_KEY="re_..."
```

### 4. Database Migration
Push the schema to your database:
```bash
bun run db:push
```

### 5. Run Locally
```bash
bun run dev
```
Server will start at `http://localhost:3000`.

## 🐳 Docker Deployment

You can run the entire stack (Backend + Redis) using Docker Compose.

1. Ensure your `.env` file is set up.
2. Run the container:
```bash
docker-compose up --build -d
```

## ☁️ Deployment on Azure VM

Follow these steps to deploy on an Azure Virtual Machine (Ubuntu).

### 1. Provision VM
- Create an Ubuntu Server VM on Azure.
- Allow Inbound Port **3000** (or 80/443 if using a reverse proxy/load balancer) in the Networking settings.

### 2. Install Docker & Bun (Optional)
ssh into your VM:
```bash
ssh azureuser@<vm-public-ip>
```

Install Docker:
```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3. Deploy Application
Clone your repo and set up environment:
```bash
git clone https://github.com/avijit969/CookMate-backend.git
cd CookMate-backend
nano .env # Paste your environment variables here
```

Run with Docker Compose:
```bash
sudo docker compose up --build -d
```

Your API should now be accessible at `http://<vm-public-ip>:3000`.

### 4. Nginx Reverse Proxy & SSL Setup
To serve your API on a domain (e.g., `api.example.com`) with HTTPS, use Nginx as a reverse proxy.

#### Step 1: Install Nginx
```bash
sudo apt install nginx
```

#### Step 2: Configure Nginx
Create a new configuration file:
```bash
sudo nano /etc/nginx/sites-available/cookmate
```

Paste the following configuration (replace `your-domain.com` with your actual domain/subdomain):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/cookmate /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Optional: remove default site
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 3: Cloudflare & SSL Configuration
1.  **Cloudflare DNS**:
    *   Go to your Cloudflare Dashboard.
    *   Add an **A Record** for your subdomain (e.g., `api`) pointing to your Azure VM's **Public IP**.
    *   Ensure the **Proxy status** is enabled (Orange Cloud ☁️).

2.  **SSL Encryption (Cloudflare -> VM)**:
    *   In Cloudflare, go to **SSL/TLS** > **Overview**.
    *   Set encryption mode to **Full**.
    *   Back on your VM, install Certbot to generate an SSL certificate (Let's Encrypt) so traffic between Cloudflare and your VM is encrypted:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```
    *   Follow the prompts. Certbot will automatically update your Nginx config to listen on port 443 with SSL.

Now your API will be secure at `https://your-domain.com`!

---
**Happy Coding! 👨‍🍳**

# Alhosni SaaS - Production Deployment

This directory contains everything needed to deploy the Alhosni SaaS platform to a production server (VPS, Hostinger, DigitalOcean, etc.) using Docker.

## Prerequisites

- **Docker** and **Docker Compose** installed on the server.
- A domain name pointing to the server IP (optional but recommended for production).

## Deployment Steps

1. **Upload Files**
   Upload this entire `final-saas` directory to your server (e.g., via SCP or FTP).
   ```bash
   scp -r final-saas user@your-server-ip:/opt/alhosni-saas
   ```

2. **Configure Environment**
   Navigate to the directory and create the `.env` file from the example.
   ```bash
   cd /opt/alhosni-saas
   cp .env.example .env
   ```
   Open `.env` and fill in your secure passwords and configuration:
   - `POSTGRES_PASSWORD`: db password
   - `JWT_SECRET`: a long random string
   - `MINIO_ROOT_PASSWORD`: minio admin password
   - `NEXT_PUBLIC_API_URL`: The public URL of your backend (e.g., `https://api.yourdomain.com` or `http://server-ip:4000`)

3. **Start Services**
   Run the application in detached mode:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Deployment**
   - **Frontend**: http://localhost:3000 (or your server IP:3000)
   - **Backend**: http://localhost:4000 (or your server IP:4000)
   - **Minio Console**: http://localhost:9001 (login with minio credentials)

## Health Checks

Check the status of containers:
```bash
docker compose ps
```

View logs if something isn't working:
```bash
docker compose logs -f
```

## Troubleshooting

- **Database Connection**: Ensure `DATABASE_URL` in `.env` matches the internal docker network URL (already configured in docker-compose.yml).
- **Minio Access**: If 403/Connection Refused, check Minio firewall ports (9000/9001).

## Ports Used

- **3000**: Frontend (Next.js)
- **4000**: Backend (NestJS)
- **5432**: PostgreSQL
- **9000**: Minio API
- **9001**: Minio Console

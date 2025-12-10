# MAGNUS Backend Setup Script
# Run this from your Magnussatdeskmanager folder

Write-Host "🚀 MAGNUS Backend Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Run this from the Magnussatdeskmanager folder" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Creating backend folder structure..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "backend" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\routes" | Out-Null

# Create package.json
Write-Host "✅ Creating backend/package.json..." -ForegroundColor Green
@"
{
  "name": "magnus-backend",
  "version": "1.0.0",
  "description": "MAGNUS Garmin Backend API - WordPress Webhook Integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["magnus", "garmin", "webhook", "woocommerce"],
  "author": "MAGNUS",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
"@ | Out-File -FilePath "backend\package.json" -Encoding utf8

# Create .env.example
Write-Host "✅ Creating backend/.env.example..." -ForegroundColor Green
@"
NODE_ENV=production
PORT=10000
WORDPRESS_WEBHOOK_SECRET=your_secret_key_here
CORS_ORIGINS=http://localhost:3000,https://sat.magnus.co.il
"@ | Out-File -FilePath "backend\.env.example" -Encoding utf8

# Create .gitignore
Write-Host "✅ Creating/updating .gitignore..." -ForegroundColor Green
@"
node_modules/
package-lock.json
*.log
.env
.DS_Store
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

Write-Host ""
Write-Host "✅ Backend folder structure created!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Download server.js from: computer:///mnt/user-data/outputs/backend/server.js"
Write-Host "   Save to: backend\server.js"
Write-Host ""
Write-Host "2. Download webhooks.js from: computer:///mnt/user-data/outputs/backend/routes/webhooks.js"
Write-Host "   Save to: backend\routes\webhooks.js"
Write-Host ""
Write-Host "3. Then run these Git commands:"
Write-Host "   git add backend/"
Write-Host "   git add .gitignore"
Write-Host "   git commit -m 'Add backend API server'"
Write-Host "   git push"
Write-Host ""
Write-Host "4. In Render.com, set Root Directory to: backend"
Write-Host ""
Write-Host "📁 Current backend folder contents:" -ForegroundColor Cyan
ls backend
ls backend\routes

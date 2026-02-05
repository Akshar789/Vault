@echo off
echo ========================================
echo Deploying Backend to Fly.io
echo ========================================
echo.

cd apps\backend

echo Step 1: Setting environment secrets...
echo.

fly secrets set ^
  DATABASE_URL="postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres" ^
  DIRECT_URL="postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:5432/postgres" ^
  SUPABASE_URL="https://zkmolpbnqdgsvsulyzec.supabase.co" ^
  SUPABASE_ANON_KEY="sb_publishable_DnG9gbdp_jQFVHRtwdrsBQ_iN0wZX-5" ^
  SUPABASE_SERVICE_ROLE_KEY="sb_secret_buFMVAi8EkvUqTpG0DROwQ_Qc8YNncD" ^
  REDIS_URL="rediss://default:AffpAAIncDFiMWNjMmY5ZGIxMjc0MzcyODQ1YjQxMzczZDNmYTAwNnAxNjM0NjU@concrete-starling-63465.upstash.io:6379" ^
  JWT_SECRET="K8vN2mP9xR4tY7wZ1aB5cD8eF3gH6jK0lM4nQ7rS2uV9xA1bC5dE8fG3hJ6kL0mN4pQ7rS2tU9vW1xY5zA8bC" ^
  JWT_REFRESH_SECRET="X9yZ2aB5cD8eF1gH4jK7lM0nP3qR6sT9uV2wX5yA8bC1dE4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG" ^
  JWT_ACCESS_EXPIRES_IN="15m" ^
  JWT_REFRESH_EXPIRES_IN="7d" ^
  CORS_ORIGINS="https://vault-vert-eight.vercel.app,http://localhost:3002"

echo.
echo Step 2: Deploying to Fly.io...
echo.

fly deploy

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your backend is now live at:
echo https://vault-backend-akshar.fly.dev
echo.
echo Test the health endpoint:
echo https://vault-backend-akshar.fly.dev/health
echo.
echo Next steps:
echo 1. Update Vercel environment variable
echo 2. Push changes to GitHub
echo 3. Test the app!
echo.

cd ..\..

pause

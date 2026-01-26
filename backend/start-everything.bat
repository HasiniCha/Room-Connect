@echo off

REM Start PostgreSQL (
docker start roomconnect-postgres-1
timeout /t 3 /nobreak >nul

REM Start MongoDB 
docker start roomconnect-mongodb-1
timeout /t 3 /nobreak >nul

REM Start Redis 
docker start roomconnect-redis-1
timeout /t 3 /nobreak >nul

REM Start RabbitMQ 
docker start roomconnect-rabbitmq-1
timeout /t 3 /nobreak >nul

REM Start Nginx
cd /d C:\nginx\nginx-1.24.0
start nginx.exe -c conf\roomconnect.conf
timeout /t 2 /nobreak >nul

pause
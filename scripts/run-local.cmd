@echo off
setlocal

REM Local run helper for Windows + Docker compose services.
REM Forces app to use the Docker Postgres on localhost:5432.

REM Use 127.0.0.1 (IPv4) explicitly to avoid accidentally hitting a local IPv6 Postgres on ::1:5432
REM Docker compose maps container 5432 -> host 5433 (see docker-compose.yml)
set "DATABASE_URL=jdbc:postgresql://127.0.0.1:5433/commerce"
set "DATABASE_USER=postgres"
set "DATABASE_PASSWORD=postgres"

REM Optional: make logs less noisy in dev
REM set "SPRING_PROFILES_ACTIVE=local"

call "%~dp0..\mvnw.cmd" -DskipTests spring-boot:run



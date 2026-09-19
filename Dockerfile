# Multi-stage Dockerfile for Swaranidhi React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Nginx Production Server
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 10000

CMD ["nginx", "-g", "daemon off;"]

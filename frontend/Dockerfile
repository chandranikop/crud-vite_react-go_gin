# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dulu (cache layer)
COPY package.json package-lock.json ./
RUN npm install

# Copy semua kode
COPY . .

# Build untuk production
RUN npm run build

# Stage 2: Serve hasil build dengan Nginx
FROM nginx:alpine

# Copy hasil build ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy konfigurasi Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

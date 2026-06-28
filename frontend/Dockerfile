FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Vite project for production
RUN npm run build

# Serve stage
FROM nginx:alpine AS runner

# Copy compiled frontend build to Nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default Nginx port (not actually exposed to host, just to docker network)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
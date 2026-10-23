# Build Angular app
FROM node:20 AS build
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Configure npm for better reliability and install dependencies
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000 && \
    npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build -- --configuration production

# Serve with nginx
FROM nginx:stable-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist/swam-frontend /usr/share/nginx/html

EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]

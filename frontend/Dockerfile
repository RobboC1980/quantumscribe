# Build stage
FROM node:20.13.1-alpine3.19 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Production stage
FROM nginx:1.25.4-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
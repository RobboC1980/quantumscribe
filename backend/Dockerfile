FROM node:20.13.1-alpine3.19 AS builder
# Set base workdir
WORKDIR /app

# Copy only package files first for cache efficiency
COPY package*.json ./backend/
# Copy the root tsconfig.json which is needed for the build
COPY tsconfig.json ./tsconfig.json

# Change to backend dir and install dependencies
WORKDIR /app/backend
RUN npm install

# Copy the rest of the backend source code
# Note: We are already in /app/backend, so source is copied relative to here
COPY . ./

# Build the project (tsc -p tsconfig.json uses ./tsconfig.json)
RUN npm run build

# production image
FROM node:20.13.1-alpine3.19
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and necessary files from builder stage
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
# We don't need tsconfig in production

RUN npm install --omit=dev
CMD ["node", "dist/app.js"]
# ---------- Build stage ----------
FROM node:24-alpine AS build
WORKDIR /app

# Install deps with good caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build NestJS -> dist/
RUN npm run build

# Remove devDependencies for smaller runtime
# RUN npm prune --omit=dev


# ---------- Runtime stage ----------
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Security: run as non-root
RUN addgroup -S app && adduser -S app -G app

# Copy only what we need
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]

FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install root deps (Prisma CLI + client) and server deps (Express + MariaDB adapter)
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
RUN npm ci && cd server && npm ci

# Copy the rest of the project (node_modules / .env excluded via .dockerignore)
COPY . .

# Generate the Prisma client at build time (no DB needed for generation)
# `|| true` guards against missing DATABASE_URL at build; the start command regenerates/auths at runtime
RUN npx prisma generate || true

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && node server/bootstrap.js && node server/index.js"]
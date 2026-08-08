FROM node:24-alpine

WORKDIR /app

# Install all deps first (root deps include the Prisma CLI + client,
# server deps include the Express app and MariaDB adapter)
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
RUN npm ci && cd server && npm ci

# Copy the rest of the project
COPY . .

# Generate the Prisma client (build-time)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate || true

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push --skip-generate --accept-data-loss && node server/index.js"]
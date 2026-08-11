FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install root deps (Prisma CLI + client) and server deps (Express + MariaDB adapter)
# npm install (not ci) tolerates the committed lockfiles drifting from package.json
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY server/package-lock.json server/package-lock.json
RUN npm install --dangerously-allow-all-scripts && cd server && npm install --dangerously-allow-all-scripts

# Copy the rest of the project (node_modules / .env excluded via .dockerignore)
COPY . .

# Generate the Prisma client at build time (no DB needed for generation)
# `|| true` guards against missing DATABASE_URL at build; the start command regenerates/auths at runtime
RUN npx prisma generate || true

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && node server/bootstrap.js && node server/index.js"]
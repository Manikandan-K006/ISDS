FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install server deps first for layer caching
# npm install (not ci) tolerates the committed lockfile drifting from package.json
COPY server/package.json server/package-lock.json ./
RUN npm install --dangerously-allow-all-scripts

# Copy the rest of the server (node_modules / .env excluded via .dockerignore)
COPY server/ .

# Generate the Prisma client at build time (no DB needed for generation)
# `|| true` guards against missing DATABASE_URL at build; the start command regenerates at runtime
RUN npx prisma generate || true

EXPOSE 5000

# db push syncs the schema; bootstrap seeds only on an empty DB
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && node bootstrap.js && node index.js"]

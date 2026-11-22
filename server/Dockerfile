# Rezepte-API – Node.js + Express + SQLite
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Abhängigkeiten zuerst (wird gecacht, solange package*.json gleich bleibt)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY openapi.yaml ./

# Datenbank und Bilder liegen in /app/data -> als Volume einhängen
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
VOLUME /app/data

ENV PORT=3002 \
    HOST=0.0.0.0 \
    DB_FILE=/app/data/recipes.db \
    UPLOAD_DIR=/app/data/uploads

USER node
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--disable-warning=ExperimentalWarning", "src/index.js"]

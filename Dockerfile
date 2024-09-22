FROM oven/bun:1.1-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY ./package.json ./
COPY ./node_modules ./node_modules
COPY ./assets ./assets
COPY ./config/ ./config/
COPY ./dist/ ./dist/
EXPOSE 4000
ENV NODE_CONFIG_DIR=/usr/src/app/config
CMD bun start:prod

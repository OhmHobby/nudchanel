FROM oven/bun:1.1-slim
RUN apt update && \
    apt install -y --no-install-recommends libjemalloc2 && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD=libjemalloc.so.2
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY ./package.json ./
COPY ./node_modules ./node_modules
COPY ./assets ./assets
COPY ./config/ ./config/
COPY ./dist/ ./dist/
EXPOSE 4000
ENV NODE_CONFIG_DIR=/usr/src/app/config
CMD bun --smol run start:prod

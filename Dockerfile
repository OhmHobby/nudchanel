FROM oven/bun:1.1-alpine
RUN apk add --update --no-cache \
    --repository http://dl-3.alpinelinux.org/alpine/edge/community \
    --repository http://dl-3.alpinelinux.org/alpine/edge/main \
    vips-dev build-base jemalloc
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

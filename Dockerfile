FROM node:24-alpine
RUN apk add --no-cache jemalloc
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
CMD npm run start:prod

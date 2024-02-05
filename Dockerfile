FROM node:20-alpine AS base
RUN npm i -g pnpm@8
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY ./package.json ./
COPY ./pnpm-*.yaml ./

FROM base AS webservice
COPY ./package.json ./package.json
RUN pnpm install --frozen-lockfile
COPY ./config/ ./config/
COPY ./dist/ ./dist/
EXPOSE 4000
ENV NODE_CONFIG_DIR=/usr/src/app/config
CMD pnpm run start

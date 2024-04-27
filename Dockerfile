FROM node:20-alpine AS base
RUN npm i -g pnpm@8
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY ./package.json ./

FROM base AS node_modules
COPY ./.npmrc ./.npmrc
COPY ./pnpm-*.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS webservice
COPY --from=node_modules /usr/src/app/node_modules ./node_modules
COPY ./config/ ./config/
COPY ./dist/ ./dist/
EXPOSE 4000
ENV NODE_CONFIG_DIR=/usr/src/app/config
CMD pnpm run start

# Node 26 ne fournit plus Yarn (Corepack n'est plus livré depuis Node 25) : version de `packageManager`
FROM node:26-alpine AS base
RUN npm install --global yarn@1.22.22

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

FROM base AS build
WORKDIR /app
ARG ORIGIN=http://localhost:3000
ENV ORIGIN=$ORIGIN
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/build ./build
USER node
EXPOSE 3000
CMD ["node", "build"]

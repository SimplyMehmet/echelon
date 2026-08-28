FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json *package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app

# The SSR server bundle needs its runtime dependencies; devDependencies are not
# used at runtime.
COPY package.json *package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/front-end/server/server.mjs"]

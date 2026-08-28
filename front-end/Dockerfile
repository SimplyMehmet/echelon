FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json *package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginx:alpine3.22 AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
# outputMode is "static": the build prerenders every route into browser/, so
# there is no Node server to run.
COPY --from=builder /app/dist/front-end/browser /usr/share/nginx/html

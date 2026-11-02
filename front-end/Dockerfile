FROM node:24-alpine AS builder

RUN apk add --no-cache gettext

ARG API_DOMAIN_URL
ARG HOSTED_DOMAIN
ENV API_DOMAIN_URL=${API_DOMAIN_URL}
ENV HOSTED_DOMAIN=${HOSTED_DOMAIN}
WORKDIR /app

COPY package.json *package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN envsubst '${API_DOMAIN_URL},${HOSTED_DOMAIN}' < src/environments/environment.template.ts > src/environments/environment.ts
RUN npm run build

FROM nginx:alpine3.22 AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/front-end/browser /usr/share/nginx/html



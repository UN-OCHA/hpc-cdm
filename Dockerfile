FROM unocha/nodejs-builder:8.11.3 AS builder

WORKDIR /srv/src

COPY . .
ARG ENVIRONMENT=devServer
RUN npm install && \
  npm run build -- --output-path=/srv/src/dist --configuration=$ENVIRONMENT

FROM alpine:3.9

RUN apk add --update-cache \
        nginx && \
    mkdir -p /run/nginx && \
    rm -rf /var/www/* && \
    rm -rf /var/cache/apk/*

COPY  --from=builder /srv/src/config/etc/nginx/conf.d /etc/nginx/conf.d
COPY  --from=builder /srv/src/dist/cdm /var/www/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]

EXPOSE 80

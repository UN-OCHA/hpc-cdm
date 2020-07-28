FROM unocha/nodejs:12 AS builder

# Install Core Packages
RUN apk add -U nginx

WORKDIR /srv/src

# Copy package-json separately so that we only need to reinstall npm packages
# when the packages change.
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install

# Copy remaining files and run build
COPY ./ ./
RUN npm run build-cdm-prod
COPY env/etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY env/etc/services.d/ /etc/services.d/

# Fix missing directory
# https://github.com/gliderlabs/docker-alpine/issues/185
RUN mkdir -p /run/nginx
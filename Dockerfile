FROM unocha/nodejs-builder:10.14.2 AS builder
WORKDIR /srv/src
COPY . .
ARG ENVIRONMENT=dev
# fix npm --no-bin-links recursion errors.
# see https://github.com/npm/npm/issues/10776
# see https://github.com/npm/npm/issues/9953
# fix npm recursion errors by not using it.
# see https://yarnpkg.com/lang/en/docs/migrating-from-npm/
# see the whole internet :-)
RUN npm install && \
  npm run build -- --output-path=/srv/src/dist --configuration=$ENVIRONMENT
FROM unocha/nginx:1.14
COPY  --from=builder /srv/src/dist/ /var/www/
COPY  --from=builder /srv/src/env/etc/nginx/conf.d/default.conf /etc/nginx/conf.d/
ENTRYPOINT ["nginx", "-g", "daemon off;"]
EXPOSE 80

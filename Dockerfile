FROM unocha/nodejs:12

ENV PORT 3000

WORKDIR /srv/src

COPY . .

RUN npm run remove-unneeded-deps && \
    npm install && \
    npm run build-cdm-prod && \
    cp env/etc/services.d/node/run /etc/services.d/node/run

EXPOSE 3000

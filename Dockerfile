FROM unocha/nodejs:12

WORKDIR /srv/src

COPY . .

RUN npm install && \
    npm run build-cdm-prod && \
    cp env/etc/services.d/node/run /etc/services.d/node/run

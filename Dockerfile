FROM public.ecr.aws/unocha/nodejs-builder:20-alpine AS builder
WORKDIR /srv/src
COPY . .
ARG ENVIRONMENT=production
RUN npm run remove-unneeded-deps && \
    npm install && \
    # Output path is relative to working directory
    npm run build hpc-ftsadmin -- --output-path=dist/ --configuration=$ENVIRONMENT

FROM public.ecr.aws/unocha/nginx:stable-beagle

ARG COMMIT_SHA
ARG TREE_SHA
ENV HPC_ACTIONS_COMMIT_SHA $COMMIT_SHA
ENV HPC_ACTIONS_TREE_SHA $TREE_SHA

COPY  --from=builder /srv/src/dist/ /var/www/
COPY  --from=builder /srv/src/env/etc/nginx/http.d/ /etc/nginx/http.d/

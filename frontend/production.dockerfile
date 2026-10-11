FROM node:lts-alpine AS builder
ARG API_URL
ENV VITE_BACKEND_API_BASE_URL=$API_URL
ARG DEGREE_EVAL=false
ENV VITE_DEGREE_EVAL=$DEGREE_EVAL
# Set the current working directory inside the container
WORKDIR /app
# @circles/degree-eval is a file: dependency (../packages/degree-eval); npm does not install its deps
COPY --from=degree-eval package.json package-lock.json /packages/degree-eval/
RUN cd /packages/degree-eval && npm ci --omit=dev
COPY --from=degree-eval src /packages/degree-eval/src
# stand-in degree documents for the evaluator (VITE_DEGREE_EVAL) until the backend serves them
COPY --from=degree-eval test-data/examples /packages/degree-eval/test-data/examples
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2.10.0-alpine
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/build /srv 

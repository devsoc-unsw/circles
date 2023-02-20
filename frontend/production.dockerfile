FROM node:lts-alpine as builder
ARG API_URL
ENV VITE_BACKEND_API_BASE_URL $API_URL
# Set the current working directory inside the container
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2.6.2-alpine
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/build /srv 


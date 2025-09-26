FROM node:20-alpine AS build

ENV NPM_TOKEN="" \
    npm_config__authToken="" \
    NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

WORKDIR /app

COPY package*.json ./
# Remove any npm credentials that may have been baked into previous caches.
RUN rm -f .npmrc /root/.npmrc /etc/npmrc \
    && npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_BASE=http://localhost:8080
ARG VITE_GOOGLE_CLIENT_ID=missing-google-client-id
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
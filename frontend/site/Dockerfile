FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
RUN mkdir -p dist/frontend && cp -R site/frontend/login site/frontend/signup site/js dist/frontend/

EXPOSE 3000

CMD ["node", "site/server.js"]
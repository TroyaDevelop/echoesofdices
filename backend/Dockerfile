FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=5017

EXPOSE 5017

CMD ["node", "dist/index.js"]

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./
COPY Hottest_Brunch ./Hottest_Brunch
USER node
EXPOSE 3000
CMD ["node", "server.js"]

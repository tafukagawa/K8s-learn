FROM node:20-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm install
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY categories ./categories
RUN mkdir -p /data
ENV NODE_ENV=production
ENV CATEGORIES_DIR=/app/categories
ENV DB_PATH=/data/progress.db
EXPOSE 3000
CMD ["node", "dist/index.js"]

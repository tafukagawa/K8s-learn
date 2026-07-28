FROM node:20-alpine AS build
WORKDIR /app
COPY ui/package.json ui/package-lock.json ./
RUN npm install
COPY ui/tsconfig.json ./
COPY ui/src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ui/views ./views
ENV NODE_ENV=production
ENV API_BASE_URL=http://k8s-learning-app
EXPOSE 3001
CMD ["node", "dist/index.js"]
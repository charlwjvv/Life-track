FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npx tsc
WORKDIR /app
COPY --from=0 /app/backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
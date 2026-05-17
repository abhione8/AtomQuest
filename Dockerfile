FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npm run prisma:generate
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

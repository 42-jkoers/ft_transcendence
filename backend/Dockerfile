FROM node:18 As development
WORKDIR /usr/src/app
COPY package*.json ./
# COPY prisma ./prisma/
RUN npm install -g rimraf
RUN npm — only=development
COPY . .
RUN npm run start:dev
FROM node:18 as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
# COPY prisma ./prisma/
RUN npm install -g rimraf
RUN npm — only=production
COPY . .
COPY — from=development /usr/src/app/dist ./dist/
CMD [“node”, “dist/main”]
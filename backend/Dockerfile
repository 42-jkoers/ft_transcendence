# develoment container
FROM node:18 As development
WORKDIR /app
ENV NODE_ENV=development
EXPOSE 3000
CMD npm run start:dev

# production container
FROM node:18 as production
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD node dist/main

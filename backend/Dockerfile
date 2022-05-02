# develoment container
FROM node:18 As development
WORKDIR /app
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD npm run start:dev

# production container
FROM node:18 as production
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
COPY --from=development /app/dist ./dist/

EXPOSE 3000
CMD node dist/main

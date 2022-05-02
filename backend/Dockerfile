# develoment container
FROM node:18 As development
WORKDIR /app
ENV NODE_ENV=development
EXPOSE 3000
CMD npm run start:dev

# production container
FROM node:18 as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
# RUN npm install -g rimraf
RUN npm install --only=production
COPY . .
COPY --from=development /usr/src/app/dist ./dist/
EXPOSE 3000
CMD [“node”, “dist/main”]

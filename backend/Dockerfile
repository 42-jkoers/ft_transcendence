# Specifiy image && Name it as development
FROM node:18 As development

# Set working directory inside container
WORKDIR /app

# Sets "NODE_ENV" env variable to "development" value
ENV NODE_ENV=development

# Copy package files from host inside the containers working directory
COPY package.json package-lock.json ./

#Install dependencies inside container
RUN npm install

# Bundle App Sources
COPY . .

# Build nest application
RUN npm run build

# Inform Docker that container listens on 3000 at runtime
EXPOSE 3000

# Start nest in watch mode
CMD npm run start:dev

# production container
# FROM node:18 as production
# ENV NODE_ENV=production
# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install --production
# COPY . .
# COPY --from=development /app/dist ./dist/

# EXPOSE 3000
# CMD node dist/main

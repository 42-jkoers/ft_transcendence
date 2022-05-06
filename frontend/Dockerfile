# Specifiy image && Name it as development
FROM node:18 As development

# Set working directory inside container
WORKDIR /app

# Copy package files from host inside the containers working directory
COPY package.json package-lock.json ./

#Install dependencies inside container
RUN npm install
RUN npm install -g @vue/cli-service

# Bundle App Sources
COPY . .

# Inform Docker that container listens on 3000 at runtime
EXPOSE 8080

# Start a dev server
CMD npm run serve

##########################
#    PRODUCTION          #
##########################

# FROM node:18 As production

# WORKDIR /app

# # FIXME install simple http server for serving static content
# RUN npm install -g http-server

# COPY package.json package-lock.json ./

# RUN npm install

# COPY . .

# # build app for production with minification
# RUN npm run build

# EXPOSE 8080

# #FIXME where to run it.
# CMD [ "http-server", "dist" ]

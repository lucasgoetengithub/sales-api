FROM node:14
WORKDIR .
COPY package*.json ./
run yarn
copy . .
expose 8082
cmd ["node", "app.js"]
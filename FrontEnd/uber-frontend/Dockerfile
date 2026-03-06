# Stage 1: Build
FROM node:20-alpine
WORKDIR /app/ui
COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install
COPY . .
EXPOSE 4200
CMD [ "ng","serve","--host","0.0.0.0","--port","4200" ]

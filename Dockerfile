FROM node:8.10

RUN mkdir /app
WORKDIR /app
COPY src/ .

RUN yarn install

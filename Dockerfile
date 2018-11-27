FROM node:8.10

RUN mkdir /app
WORKDIR /app
COPY src/package.json src/yarn.lock ./
RUN yarn install

COPY src/ ./

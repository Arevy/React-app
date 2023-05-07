FROM node:18.7.0

RUN mkdir /app
WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

COPY . .

RUN yarn build:prod

EXPOSE 3011

ENTRYPOINT [ "yarn", "start:prod" ]
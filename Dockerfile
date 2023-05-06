FROM node:16-alpine

WORKDIR /onvif2mqtt
ADD . /onvif2mqtt

RUN npm ci && npm run build

CMD npm start

FROM node:12.16.1

WORKDIR /onvif2mqtt
ADD . /onvif2mqtt

RUN npm install && npm run build 

CMD npm start

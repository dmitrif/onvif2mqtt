FROM node:12.16.1

ADD . ./

RUN npm install
RUN npm run build 

CMD npm start
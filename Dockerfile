FROM node:4

WORKDIR /vagrant
ADD . .

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]

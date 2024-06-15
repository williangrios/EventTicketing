FROM node:alpine

WORKDIR /app
# copiando o package.json para o WORKDIR
# (faço isso antes para que só compile quando houver nova dependencia)
COPY package.json .

RUN npm install

# copiando tudo dentro do src directory
COPY . .

CMD ["npm", "run", "dev"]
# Usa un'immagine di Node.js come base
FROM node:latest
COPY . /app
WORKDIR /app
# Installa le dipendenze
RUN npm install
# Compila il progetto
RUN npm run build
CMD ["npm", "run", "serve"]
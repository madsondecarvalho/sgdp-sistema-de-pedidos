FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the API will run on
EXPOSE 3000

# Default command - can be overridden in docker-compose
CMD ["npm", "run", "start:dev"]
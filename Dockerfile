# Use official Node.js 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose the port that Fly.io provides
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
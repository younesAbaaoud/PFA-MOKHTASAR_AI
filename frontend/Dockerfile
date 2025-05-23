# Development stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]

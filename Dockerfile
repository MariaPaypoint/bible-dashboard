FROM node:18.19.1-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining files
COPY . .

# Expose Vite port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev"]

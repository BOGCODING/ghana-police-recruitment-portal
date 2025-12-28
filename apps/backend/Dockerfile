FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source code
COPY . ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "server.js"]

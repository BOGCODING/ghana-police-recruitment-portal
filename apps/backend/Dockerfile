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

# Security: Run as non-root user
# 'node' user comes built-in with node:alpine images
RUN chown -R node:node /app
USER node

# Start the application
CMD ["node", "server.js"]

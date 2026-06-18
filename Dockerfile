# Built on the official Playwright image so Chromium and all its system
# libraries are already present — that's the part that's painful otherwise.
FROM mcr.microsoft.com/playwright:v1.61.0-noble

WORKDIR /app

# Install deps first for better layer caching.
COPY package*.json ./
RUN npm ci

# Copy the rest and build the frontend into dist/client.
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
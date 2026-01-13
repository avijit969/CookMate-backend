FROM oven/bun:1-alpine
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port (Bun default)
EXPOSE 3000

# Start command
CMD ["bun", "run", "start"]

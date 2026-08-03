FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.31.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173
# The --host flag is necessary for Vite to listen on all network interfaces in a Docker container
CMD ["pnpm", "dev", "--host"]

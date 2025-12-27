#!/bin/bash
echo "Setting up Ghana Police Recruitment Portal environment..."

# Check dependencies
command -v pnpm >/dev/null 2>&1 || { echo >&2 "pnpm is required. Please install it."; exit 1; }

# Install workspace dependencies
pnpm install

# Initialize backend environment
cp apps/backend/.env.example apps/backend/.env

echo "Setup complete. Please configure your .env files."

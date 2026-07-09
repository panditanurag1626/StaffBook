#!/bin/bash

cd /home/staffbook/staffbook-frontend || exit

echo "Pulling latest code..."
git pull origin master

echo "Installing dependencies..."
npm install

echo "Building app..."
npm run build

echo "Restarting app..."
pm2 reload nextapp

echo "Deployment complete"

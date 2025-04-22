#!/bin/bash

# Update the package list
sudo apt-get update

# Install required packages
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings

# Add Docker's official GPG key:
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker:
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Create a Docker network for the application
docker network create viixoo-hemago-mrp

# Create project directory
mkdir -p /home/ubuntu/projects
cd /home/ubuntu/projects
# Clone the repository
git clone https://github.com/viixoo/viixoo_hemago_mrp_app.git

# Change to the project directory
cd viixoo_hemago_mrp_app/viixoo_app_engine/

# Build and run the backend in production mode
ENV=production docker compose up -d --build backend_prod

# Build and run the frontend in production mode
VITE_API_URL=http://52.23.24.207:8000 docker compose up -d --build frontend

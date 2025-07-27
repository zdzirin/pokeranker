# Stage 1: Build the React frontend
FROM node:20-alpine AS builder

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy package configuration files
COPY frontend/package.json frontend/package-lock.json* ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build


# Stage 2: Create the final Python image
FROM python:3.11-slim

# Set the working directory for the API
WORKDIR /app

# Copy Python dependency requirements
COPY api/requirements.txt .

# Install Python dependencies
ENV TMPDIR=/tmp
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire API directory
COPY api/ .

# Copy the built frontend from the builder stage to the static directory
COPY --from=builder /app/frontend/dist ./static

# Expose the port the app will run on
EXPOSE 8000

# Command to run the FastAPI application. It uses the PORT environment variable if set, otherwise defaults to 8000.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

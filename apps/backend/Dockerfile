# Use Python 3.11.10 as the base image (compatible with the dependencies)
FROM python:3.13.3-slim-bookworm

ENV HTTP_PROXY=""  
ENV HTTPS_PROXY="" 
ENV http_proxy=""  
ENV https_proxy=""

# Set working directory in the container
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY apps/backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY apps/backend/ .

# Set environment variables
ENV MODEL="meta-llama/llama-4-maverick-17b-128e-instruct"

# Expose the port that FastAPI will run on
EXPOSE 8000

# Command to run the application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Add these lines after FROM
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    # your other dependencies...
    && rm -rf /var/lib/apt/lists/*
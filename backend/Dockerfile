FROM python:3.10-slim

WORKDIR /app

# Install system dependencies and python3-venv
RUN apt-get update && apt-get install -y \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment named pfa_venv in /app
RUN python3 -m venv /app/pfa_venv

# Activate venv by adjusting PATH
ENV PATH="/app/pfa_venv/bin:$PATH"

# Upgrade pip inside the venv
RUN pip install --upgrade pip

# Copy requirements and install them in venv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend project files
COPY . .

# Expose backend port (FastAPI default is 8000)
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

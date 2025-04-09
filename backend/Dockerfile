FROM python:3.10-slim

WORKDIR /app

# Install system and Python dependencies
RUN apt-get update && apt-get install -y \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python3 -m venv /pfa_venv

# Activate and upgrade pip
RUN /pfa_venv/bin/pip install --upgrade pip

# Set environment path
ENV PATH="/pfa_venv/bin:$PATH"

# Copy requirements and install them inside the venv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

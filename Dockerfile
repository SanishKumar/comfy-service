# Builder stage: install dependencies
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt . 
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage: copy runtime
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local /usr/local
# Copy ComfyUI and our code
COPY lib/ComfyUI /app/lib/ComfyUI
COPY flows /app/flows
COPY comfy_generate.py api_server.py requirements.txt ./

# Expose port 8000
EXPOSE 8000
# Run the FastAPI server
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]

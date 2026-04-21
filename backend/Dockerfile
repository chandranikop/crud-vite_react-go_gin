# Stage 1: Build binary Go
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy dependency files dulu (cache layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy semua kode
COPY . .

# Build binary
RUN go build -o main .

# Stage 2: Image final yang ringan
FROM alpine:latest

WORKDIR /app

# Copy binary hasil build dari stage 1
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]

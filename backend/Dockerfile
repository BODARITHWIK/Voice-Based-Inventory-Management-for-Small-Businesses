# Multi-stage Dockerfile for Swaranidhi Spring Boot Backend
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime Image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S swaranidhi && adduser -S swaranidhi -G swaranidhi
USER swaranidhi

COPY --from=builder /build/target/swaranidhi-backend-1.0.0.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

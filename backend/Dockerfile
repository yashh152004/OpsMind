FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY src src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built JAR from builder stage
COPY --from=builder /build/target/opsmind-backend-*.jar /app/app.jar

# Create non-root user
RUN addgroup -S opsmind && adduser -S opsmind -G opsmind
RUN chown -R opsmind:opsmind /app
USER opsmind

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:InitiatingHeapOccupancyPercent=35"

# Start application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

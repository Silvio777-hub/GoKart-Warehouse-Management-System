# Build stage
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only pom.xml first for better caching
COPY pom.xml .

# Download dependencies in a separate layer (this will be cached)
RUN mvn dependency:go-offline -B -Dmaven.repo.local=/root/.m2/repository || true

# Copy source code
COPY src ./src

# Build the application with optimized settings
RUN mvn clean package -DskipTests -B \
    -Dmaven.repo.local=/root/.m2/repository \
    -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the built JAR
COPY --from=build /app/target/swam-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

# Add healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=150s --retries=3 \
    CMD curl -f http://localhost:8081/api/auth/health || exit 1

ENTRYPOINT ["java","-jar","/app/app.jar"]

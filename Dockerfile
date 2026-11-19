# MealMesh: one container serves the React frontend and the Spring Boot API on port 8080.
# Used for public hosting (e.g. Render). Locally you can simply run run/START-MEALMESH.bat instead.

# 1) Build the React frontend
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# 2) Build the Spring Boot backend with the frontend bundled as static files
FROM maven:3.9-eclipse-temurin-21-alpine AS api
WORKDIR /api
COPY backend/pom.xml .
COPY backend/src ./src
RUN rm -rf src/main/resources/static && mkdir -p src/main/resources/static
COPY --from=web /web/dist/ ./src/main/resources/static/
RUN mvn -q -B clean package -DskipTests

# 3) Small runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=api /api/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx384m"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

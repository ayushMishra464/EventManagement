# ----------- BUILD STAGE -----------
    FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

    WORKDIR /app
    
    # Copy everything
    COPY . .
    
    # Build the jar
    RUN mvn clean package -DskipTests
    
    # ----------- RUNTIME STAGE -----------
    FROM eclipse-temurin:17-jdk-alpine
    
    WORKDIR /app
    
    # Copy built jar from build stage
    COPY --from=build /app/target/*.jar app.jar
    
    EXPOSE 8080
    
    CMD ["java", "-jar", "app.jar"]
    
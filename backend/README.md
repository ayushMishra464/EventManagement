# Event Management — Backend

Spring Boot REST API for the Event Management System.

## Member attribution

- **Member 1:** `pom.xml`, `application.yml`, `EventManagementApplication.java`
- **Member 2:** `entity/` (Event, Venue, User, Registration)
- **Member 3:** `repository/` (JPA repositories)
- **Member 4:** `service/` (EventService, VenueService, UserService)
- **Member 5:** `dto/`, `controller/`, `exception/GlobalExceptionHandler`

## Run

```bash
mvn spring-boot:run
```

API: `http://localhost:8080/api`

## Configure MySQL

The app uses **username** `root` and **password** from env or local config.

**Option A – Environment variable (recommended)**  
Set your MySQL password before running:

- Windows (CMD): `set MYSQL_PASSWORD=your_actual_password`
- Windows (PowerShell): `$env:MYSQL_PASSWORD="your_actual_password"`
- Linux/macOS: `export MYSQL_PASSWORD=your_actual_password`

Then run: `mvn spring-boot:run`

**Option B – Local config file**  
1. Copy `src/main/resources/application-local.yml.example` to `application-local.yml` in the same folder.  
2. Set `spring.datasource.password` to your MySQL root password.  
3. Run with local profile: `mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"`

**If your MySQL root has no password**  
No change needed; the default password is empty.

## Endpoints

- `GET/POST /api/events`, `GET/PUT/DELETE /api/events/{id}`
- `GET/POST /api/venues`, `GET/PUT/DELETE /api/venues/{id}`
- `GET/POST /api/users`, `GET/PUT/DELETE /api/users/{id}`

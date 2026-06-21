# LOCAL_MONITORING_GUIDE.md

## 🏠 Monitoring Your Local Environment

OpsMind is pre-configured to monitor the host machine without external agents.

### 1. Hardware Monitoring (Pre-Enabled)
- **Engine**: OSHI (Hardware Abstraction Layer).
- **Scope**: CPU, RAM, Disk.
- **Interval**: 5 seconds.
- **Detection**: Autonomous Incidents trigger if CPU > 90% or RAM > 95%.

### 2. Spring Boot Internals
- **Engine**: Actuator + Micrometer.
- **Endpoint**: `http://localhost:8080/actuator/prometheus`
- **Scope**: JVM Heap, GC, Threads, HTTP Throughput.

### 3. Database Health
- **Engine**: MySQL Performance Sentinel.
- **Scope**: Thread count, Slow queries, Storage availability.

### 4. Demonstrating "Real-Time" Detection
1. Open Task Manager to observe your actual CPU.
2. Launch a heavy application (e.g., Video render or complex compilation).
3. Switch to OpsMind: You will see the **Performance Area Chart** spike in sync with your machine.
4. If sustained, a **P1 Incident** will appear in the sidebar automatically.

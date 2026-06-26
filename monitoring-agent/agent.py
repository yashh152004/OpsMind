import psutil
import requests
import json
import time
import socket
import platform
import datetime
import os

# Configuration
BACKEND_URL = "http://localhost:8080/api/telemetry/report"
INTERVAL = 5  # seconds
HOSTNAME = socket.gethostname()

def get_ip_address():
    try:
        return socket.gethostbyname(HOSTNAME)
    except:
        return "127.0.0.1"

def collect_metrics():
    # CPU
    cpu_percent = psutil.cpu_percent(interval=1)
    cpu_count = psutil.cpu_count()
    
    # Memory
    mem = psutil.virtual_memory()
    mem_total_mb = mem.total / (1024 * 1024)
    mem_used_percent = mem.percent
    
    # Disk
    disk = psutil.disk_usage('/')
    disk_total_gb = disk.total / (1024 * 1024 * 1024)
    disk_used_percent = disk.percent
    
    # Net
    net = psutil.net_io_counters()
    
    # Uptime
    boot_time = psutil.boot_time()
    uptime_seconds = int(time.time() - boot_time)

    metrics = {
        "cpu_usage_percent": cpu_percent,
        "memory_usage_percent": mem_used_percent,
        "memory_total_mb": mem_total_mb,
        "disk_usage_percent": disk_used_percent,
        "disk_total_gb": disk_total_gb,
        "net_sent_mb": net.bytes_sent / (1024 * 1024),
        "net_recv_mb": net.bytes_recv / (1024 * 1024),
    }

    # Battery
    battery = psutil.sensors_battery()
    if battery:
        metrics["battery_percent"] = battery.percent
        metrics["battery_plugged"] = 1.0 if battery.power_plugged else 0.0

    # Processes
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info', 'username']):
        try:
            pinfo = proc.info
            # Only include high-impact or specific app processes to save bandwidth
            if pinfo['cpu_percent'] > 1.0 or pinfo['name'].lower() in ['java', 'python', 'node', 'mysqld', 'docker']:
                processes.append({
                    "pid": pinfo['pid'],
                    "name": pinfo['name'],
                    "cpuPercent": pinfo['cpu_percent'],
                    "memoryMb": pinfo['memory_info'].rss / (1024 * 1024),
                    "username": pinfo['username']
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    # Docker (Optional)
    containers = []
    try:
        import docker
        client = docker.from_env()
        for container in client.containers.list(all=True):
            containers.append({
                "containerId": container.short_id,
                "name": container.name,
                "image": container.image.tags[0] if container.image.tags else "unknown",
                "state": container.status,
                "status": container.attrs['Status']
            })
    except Exception as e:
        # print(f"Docker not available: {e}")
        pass

    # Service discovery (Simulated for local machine services)
    services = [
        {"name": "OpsMind-Backend", "status": "active" if is_port_open(8080) else "inactive"},
        {"name": "OpsMind-Frontend", "status": "active" if is_port_open(5173) else "inactive"},
        {"name": "MySQL", "status": "active" if is_port_open(3306) else "inactive"},
        {"name": "AI-Engine", "status": "active" if is_port_open(8000) else "inactive"}
    ]

    payload = {
        "hostname": HOSTNAME,
        "ipAddress": get_ip_address(),
        "os": platform.system() + " " + platform.release(),
        "architecture": platform.machine(),
        "uptime": uptime_seconds,
        "cpuCount": cpu_count,
        "totalMemoryMb": mem_total_mb,
        "totalDiskMb": disk_total_gb * 1024,
        "systemMetrics": metrics,
        "processes": processes[:20],  # Top 20 relevant
        "containers": containers,
        "services": services
    }
    
    return payload

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def run_agent():
    print(f"OpsMind Monitoring Agent started for {HOSTNAME}")
    print(f"Reporting to {BACKEND_URL} every {INTERVAL}s")
    
    while True:
        try:
            payload = collect_metrics()
            response = requests.post(BACKEND_URL, json=payload, timeout=5)
            if response.status_code == 200:
                print(f"[{datetime.datetime.now()}] Telemetry reported successfully.")
            else:
                print(f"[{datetime.datetime.now()}] Failed to report telemetry: {response.status_code}")
        except Exception as e:
            print(f"[{datetime.datetime.now()}] Error connecting to backend: {e}")
        
        time.sleep(INTERVAL)

if __name__ == "__main__":
    run_agent()

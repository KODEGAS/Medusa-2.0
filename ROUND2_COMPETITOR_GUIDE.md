# 🏆 Medusa 2.0 – The Cyber Gauntlet Competitor Guide

## 📢 Welcome to Round 2

This comprehensive guide contains everything you need to know about Round 2 of the MEDUSA CTF competition. Please read this document carefully before the competition begins.

---

## 📋 Table of Contents

1. [Competition Overview](#competition-overview)
2. [Challenge Structure](#challenge-structure)
3. [Scoring System](#scoring-system)
4. [Prerequisites & Setup](#prerequisites--setup)
5. [Access & Authentication](#access--authentication)
6. [Challenge Details](#challenge-details)
7. [Hint System](#hint-system)
8. [Submission Guidelines](#submission-guidelines)
9. [Rules & Guidelines](#rules--guidelines)
10. [FAQs](#faqs)

---

## 🎯 Competition Overview

### What is Round 2?

Round 2 consists of **TWO separate advanced challenges** with a total of **THREE flags** to capture:

1. **🤖 Perseus Android Challenge** (1 flag)
   - Mobile security and reverse engineering
   - APK analysis and exploitation
   - Flag format: `MEDUSA{...}`

2. **💥 Container Escape PWN Challenge** (2 flags)
   - Web exploitation and privilege escalation
   - Container breakout techniques
   - Flag format: `HashX{...}`

### Key Information

- **Total Points Available**: 1500 points
- **Challenge Types**: Android exploitation + Container escape
- **Attempts**: 
  - Android: 3 attempts
  - PWN (combined): 3 attempts (shared between user and root flags)
- **Duration**: Time-based scoring with decay over 6 hours
- **Hints Available**: 3 hints per challenge (cost points)

---

## 🏗️ Challenge Structure

### Challenge 1: Perseus (Android Exploitation)

**Objective**: Reverse engineer an Android application to find the hidden flag

**Points**: 750 points (50% of total)

**Skills Required**:
- Android app reverse engineering
- APK decompilation and analysis
- Java/Kotlin code analysis
- Database forensics
- Cryptography basics

**What You'll Get**:
- APK file download link
- Access credentials after authentication

### Challenge 2: Container Escape (PWN Challenge)

**Objective**: Exploit a containerized web service and escalate privileges

**Points**: 450 points (user flag) + 300 points (root flag) = 750 total

**Skills Required**:
- Web application exploitation
- Linux privilege escalation
- Container security concepts
- Binary exploitation basics
- Post-exploitation techniques

**What You'll Get**:
- Web service access
- Two separate flags to capture (user-level + root-level)

---

## 📊 Scoring System

### Total Points Distribution

| Challenge | Base Points | Percentage |
|-----------|-------------|------------|
| Perseus (Android) | 750 pts | 50% |
| PWN User Flag | 450 pts | 30% |
| PWN Root Flag | 300 pts | 20% |
| **TOTAL** | **1500 pts** | **100%** |

### Scoring Formula

```
Final Points = (Base Points × Time Multiplier × Attempt Penalty) - Hint Penalty
```

#### 1️⃣ Time Multiplier (Time-Based Decay)

Points decay over 6 hours from competition start:

| Time Elapsed | Multiplier | Percentage |
|--------------|------------|------------|
| 0-2 hours | 1.0 | 100% |
| 2-4 hours | 0.8 | 80% |
| 4-6 hours | 0.6 | 60% |
| 6+ hours | 0.6 | 60% (minimum) |

**Formula**: `timeMultiplier = Math.max(0.6, 1 - (hoursElapsed / 12))`

**Example**: If you solve the Android challenge after 3 hours, you get 80% of the base points.

#### 2️⃣ Attempt Penalty

Each wrong attempt reduces your final score:

| Attempt Number | Multiplier | Penalty |
|----------------|------------|---------|
| 1st attempt | 1.0 | 0% |
| 2nd attempt | 0.75 | 25% |
| 3rd attempt | 0.60 | 40% |

**Important**: 
- Android challenge: 3 attempts total
- PWN challenge: 3 attempts total (shared between user and root flags)

#### 3️⃣ Hint Penalty (Flat Deduction)

Unlocking hints **deducts points** from your final score:

| Hint Number | Cost per Challenge |
|-------------|-------------------|
| Hint 1 | -50 points |
| Hint 2 | -100 points |
| Hint 3 | -150 points |

**Rules**:
- Hints must be unlocked sequentially (1 → 2 → 3)
- Each challenge has its own set of 3 hints
- Total possible hint penalty: 300 points per challenge

### Scoring Examples

#### Example 1: Perfect Android Submission
- Challenge: Android (750 base pts)
- Time: 1 hour after start (100% multiplier)
- Attempts: 1st attempt (100%)
- Hints: None
- **Calculation**: (750 × 1.0 × 1.0) - 0 = **750 points** ✅

#### Example 2: PWN User with Hint
- Challenge: PWN User (450 base pts)
- Time: 3 hours after start (80% multiplier)
- Attempts: 1st attempt (100%)
- Hints: Hint 1 unlocked (-50 pts)
- **Calculation**: (450 × 0.8 × 1.0) - 50 = 360 - 50 = **310 points**

#### Example 3: Late PWN Root with Multiple Attempts
- Challenge: PWN Root (300 base pts)
- Time: 5 hours after start (60% multiplier)
- Attempts: 3rd attempt (60%)
- Hints: Hints 1 & 2 unlocked (-150 pts)
- **Calculation**: (300 × 0.6 × 0.6) - 150 = 108 - 150 = **0 points** (minimum is 0)

---

## 🛠️ Prerequisites & Setup

### Required Tools

#### Essential Tools (Must Have)

1. **Android Debug Bridge (ADB)**
   ```bash
   # macOS
   brew install android-platform-tools
   
   # Linux (Debian/Ubuntu)
   sudo apt-get install android-tools-adb
   
   # Windows
   # Download from: https://developer.android.com/tools/releases/platform-tools
   ```

2. **SQLite3**
   ```bash
   # macOS
   brew install sqlite3
   
   # Linux
   sudo apt-get install sqlite3
   
   # Windows
   # Download from: https://www.sqlite.org/download.html
   ```

3. **Python 3.7+**
   ```bash
   python3 --version
   # Should show 3.7 or higher
   ```

4. **Java Development Kit (JDK 11+)**
   ```bash
   java -version
   javac -version
   ```

#### Recommended Tools (Highly Useful)

5. **apktool** - APK decompilation
   ```bash
   # macOS
   brew install apktool
   
   # Linux
   sudo apt-get install apktool
   ```

6. **jadx** - Dex to Java decompiler
   ```bash
   # macOS
   brew install jadx
   
   # Download from: https://github.com/skylot/jadx/releases
   ```

7. **SSH Client** - For PWN challenge access
   ```bash
   ssh --version
   # Pre-installed on macOS/Linux
   # Windows: Use PuTTY or Windows Terminal
   ```

8. **Burp Suite / OWASP ZAP** - Web exploitation (optional)
   - Useful for intercepting and analyzing web traffic
   - Download from: https://portswigger.net/burp

#### Optional Advanced Tools

- **Frida** - Dynamic instrumentation
- **objection** - Mobile security toolkit
- **GDB** - GNU Debugger for binary analysis
- **pwntools** - CTF exploitation framework

### System Requirements

#### For Android Challenge

- **Android Device/Emulator**:
  - Minimum: Android 5.0 (API 21)
  - Recommended: Android 9.0+ (API 28+)
  - Storage: 500MB free space
  - USB Debugging enabled (physical device)

- **Computer**:
  - OS: Windows 10/11, macOS 10.14+, Linux (Ubuntu 20.04+)
  - RAM: 4GB minimum, 8GB recommended
  - Storage: 5GB free space

#### For PWN Challenge

- **Computer**:
  - OS: Any (Windows/macOS/Linux)
  - RAM: 2GB minimum
  - Network: Stable internet connection
  - Terminal/SSH client installed

### Android Device Setup

#### Option 1: Physical Android Device (Recommended)

1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Enter your PIN/Pattern if prompted

2. **Enable USB Debugging**:
   - Go to Settings → System → Developer Options
   - Enable "USB Debugging"
   - Connect to computer via USB
   - Authorize the computer when prompted

3. **Verify Connection**:
   ```bash
   adb devices
   # Should show your device listed
   ```

#### Option 2: Android Emulator

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio

2. **Create Virtual Device**:
   - Open Android Studio
   - Tools → Device Manager → Create Device
   - Choose: Pixel 5 or Pixel 6
   - System Image: API 33 (Android 13) or higher
   - Use x86_64 architecture for better performance

3. **Launch Emulator**:
   ```bash
   emulator -list-avds
   emulator -avd <avd_name>
   ```

4. **Verify Connection**:
   ```bash
   adb devices
   # Should show emulator-5554 or similar
   ```

### Pre-Competition Checklist

Complete this before the competition starts:

- [ ] ADB installed and working (`adb --version`)
- [ ] ADB can detect your device (`adb devices`)
- [ ] SQLite3 installed (`sqlite3 --version`)
- [ ] Python 3 installed (`python3 --version`)
- [ ] Java/JDK installed (`java -version`, `keytool`)
- [ ] apktool installed (`apktool --version`)
- [ ] jadx installed (`jadx --version`)
- [ ] SSH client available (`ssh -V`)
- [ ] Android device/emulator ready and connected
- [ ] Can install APK (`adb install test.apk` works)
- [ ] Text editor ready (VSCode, Sublime, Notepad++, vim)
- [ ] Note-taking tool ready for recording findings

---

## 🔐 Access & Authentication

### Step 1: Team Login

1. Navigate to the MEDUSA CTF platform
2. Login with your registered team credentials:
   - Team name
   - Password (set during registration)

### Step 2: Round 2 Access

1. Click on **"Round 2"** from the main dashboard
2. You'll be prompted for Round 2 authentication
3. Enter the **Round 2 password** (provided separately via email/Discord)
4. Once authenticated, you'll gain access to both challenges

### Step 3: Download Challenge Materials

#### For Android Challenge:
1. Click **"Download Perseus APK"** button
2. Save the APK file to your computer
3. Install on your Android device/emulator:
   ```bash
   adb install perseus.apk
   ```

#### For PWN Challenge:
1. Access via web browser or command-line tools
2. Begin reconnaissance and exploitation

### Important Notes

- **One-time Authentication**: Round 2 password only needs to be entered once per session
- **Session Management**: Your session is saved in browser storage
- **Multiple Devices**: You can access from multiple devices with the same team credentials
- **Security**: Never share your Round 2 password with other teams

---

## 🎮 Challenge Details

### Challenge 1: Perseus (Android Exploitation)

#### Challenge Description

Perseus is a custom Android application that holds a valuable secret. Your mission is to reverse engineer the APK, analyze its components, and extract the hidden flag.

#### What to Look For

- **Decompiled Code**: Java/Kotlin classes with interesting logic
- **Resources**: Strings, assets, configuration files
- **Native Libraries**: .so files that might contain flag components
- **Databases**: SQLite databases with encrypted data
- **Shared Preferences**: XML files with stored credentials/keys
- **Network Traffic**: API endpoints or external communications
- **Encryption/Encoding**: Base64, AES, custom algorithms

#### Common Attack Vectors

1. **Static Analysis**:
   - Decompile APK with apktool
   - Analyze Java code with jadx
   - Search for hardcoded credentials or keys
   - Examine AndroidManifest.xml for permissions/components

2. **Database Analysis**:
   - Extract app data using ADB
   - Examine SQLite databases
   - Look for encrypted/encoded flag components

3. **String Analysis**:
   - Search for MEDUSA{} patterns
   - Look for Base64 encoded strings
   - Analyze obfuscated code

4. **Dynamic Analysis**:
   - Run the app and observe behavior
   - Monitor file system changes
   - Intercept network traffic
   - Use Frida for runtime hooking (advanced)

#### Flag Format

```
MEDUSA{...}
```

The flag will be in this exact format. Case-sensitive.

#### Tips & Hints

- Start with static analysis before moving to dynamic
- APK files are just ZIP archives - you can unzip them
- Look for suspicious database files or encrypted strings
- The flag might be split across multiple locations
- Pay attention to cryptographic operations in the code

### Challenge 2: Container Escape (PWN Challenge)

#### Two-Stage Attack

**Stage 1: User-Level Access** (450 points)
- Exploit the web application
- Gain shell access inside the container
- Locate and capture the user flag: `HashX{user_flag...}`

**Stage 2: Root-Level Access** (300 points)
- Escalate privileges within the container
- Exploit Docker misconfigurations
- Break out to the host system
- Capture the root flag: `HashX{root_flag...}`

#### Flag Formats

```
User Flag: HashX{...}
Root Flag: HashX{...}
```

Both flags use the same format. Case-sensitive.

## 💡 Hint System

### How Hints Work

The Android challenge has **3 hints** and the PWN challenge has **3 hints** (shared between user and root flags). Hints provide guidance but **cost points**.

**Total Available**: 6 hints (3 for Android + 3 for PWN)

### Hint Progression

Hints are designed with increasing specificity:

**Level 1 (50 points)**: 
- General methodology and approach
- Points you in the right direction
- Mentions key concepts and areas to investigate

**Level 2 (100 points)**:
- Specific techniques and tools
- Narrows down the attack vector
- Provides concrete steps to follow

**Level 3 (150 points)**:
- Very detailed guidance
- Near step-by-step instructions
- May include specific commands or code locations

#### Android Challenge Hint Topics
1. **Hint 1**: Initial Reconnaissance - APK structure analysis and extraction methods
2. **Hint 2**: Database Analysis - Locating and examining encrypted data in SQLite
3. **Hint 3**: Decryption Key - Finding the key in native libraries or Java code

#### PWN Challenge Hint Topics (Both Stages)
1. **Hint 1**: Web Exploitation - Finding vulnerabilities and achieving RCE for user flag
2. **Hint 2**: Container Enumeration - Identifying Docker misconfigurations and escape vectors
3. **Hint 3**: Container Escape - Specific exploitation technique for host access and root flag

### Hint Costs

| Hint Level | Cost | Total Deduction |
|------------|------|-----------------|
| Hint 1 | 50 points | -50 pts |
| Hint 2 | 100 points | -150 pts |
| Hint 3 | 150 points | -300 pts |

### Sequential Unlock Rule

⚠️ **Important**: Hints must be unlocked in order (1 → 2 → 3)

- You cannot unlock Hint 2 without first unlocking Hint 1
- You cannot unlock Hint 3 without unlocking Hints 1 and 2
- Once unlocked, you cannot "un-unlock" a hint

### How to Unlock Hints

1. Navigate to Round 2 page after authentication
2. Scroll to the **"Hint System"** section
3. Select the challenge:
   - **Android Challenge**: 3 hints specific to Perseus APK
   - **PWN Challenge**: 3 hints covering both user and root flag strategies
4. Click **"Unlock"** button for the desired hint
5. Confirm the point deduction
6. Hint content will be revealed immediately

**Important**: PWN hints are shared between user and root flags. Unlocking a PWN hint helps with both stages of the container escape challenge.

### Hint Strategy

**When to Use Hints**:
- ✅ After spending significant time without progress
- ✅ When completely stuck on a challenge
- ✅ If time is running out and points are better than nothing
- ✅ Early hints (50-100 pts) might be worth it for faster completion

**When to Avoid Hints**:
- ❌ At the very beginning without attempting the challenge
- ❌ If you're making steady progress
- ❌ When you've already invested too many hints (diminishing returns)
- ❌ In the final hour if the deduction would make your score negative

### Hint Impact Example

**Scenario**: Solving PWN User challenge at 3 hours with 2 PWN hints unlocked

```
Base Points: 450
Time Multiplier: 0.8 (3 hours = 80%)
Attempt: 1st (100%)
Hints Used: PWN Hint 1 + PWN Hint 2 = 150 points

Calculation:
Raw Points = 450 × 0.8 × 1.0 = 360
Final Points = 360 - 150 = 210 points

Without hints: 360 points
With 2 hints: 210 points
Loss: 150 points (41% reduction)
```

**Note**: These same PWN hints will also apply to the PWN Root flag, so the penalty is shared across both flags.

**Recommendation**: Use hints wisely. The first hint (50 pts) is often worth it, but subsequent hints get expensive quickly. Since PWN hints help with both user and root flags, they provide double value.

---

## 📝 Submission Guidelines

### How to Submit Flags

#### Via Web Interface (Recommended)

1. **Login** to MEDUSA CTF platform
2. Navigate to **Round 2** page
3. Enter Round 2 password if not already authenticated
4. Locate the appropriate submission section:
   - **Perseus Android**: Green submission box
   - **PWN User Flag**: Yellow submission box
   - **PWN Root Flag**: Red submission box
5. Enter the flag in the correct format
6. Click **"Submit"** button
7. Wait for validation response

#### Flag Format Validation

⚠️ **Critical**: Flags must match the exact format:

- **Android**: `MEDUSA{...}` (case-sensitive)
- **PWN**: `HashX{...}` (case-sensitive)

### Submission Response

After submitting, you'll receive response


**Android Challenge**:
- Total: 2 attempts
- Tracked independently

**PWN Challenge**:
- Total: 3 attempts (shared)
- User flag attempt counts against PWN total
- Root flag attempt counts against PWN total
- Example: 1 wrong user flag + 1 wrong root flag = 2 attempts used

### After All Attempts Used

If you exhaust all attempts without finding the correct flag:
- You can still unlock hints to try again (if allowed by rules)
- Your score for that challenge will be 0
- Focus on other challenges to maximize total points
- Learn from the experience for future competitions

### Best Practices

1. **Double-check flags** before submitting (copy-paste carefully)
2. **Use first attempt wisely** - no penalty, full points possible
3. **Document your work** - helps if you need to retrace steps
4. **Save your progress** - containers may reset, document everything
5. **Communicate with team** - avoid duplicate submissions

---

## 📜 Rules & Guidelines

### General Rules

1. **Fair Play**:
   - No attacking the CTF infrastructure
   - No denial-of-service attacks
   - No brute-forcing authentication systems
   - No interfering with other teams

2. **Team Conduct**:
   - Only registered team members may participate
   - No sharing flags or solutions with other teams
   - No account sharing between teams
   - Maximum team size as per registration rules

3. **Challenge Interaction**:
   - You may use any tools and techniques for solving challenges
   - Automation is allowed (scripts, tools, frameworks)
   - No attacking other teams' devices or networks
   - Report vulnerabilities in the platform (not challenges) to organizers

4. **Submission Rules**:
   - Only submit flags you've actually obtained
   - No guessing or brute-forcing flag formats
   - Each flag can only be submitted once per team
   - Submissions are final (no take-backs)

5. **Time Management**:
   - Competition starts at announced time
   - Time-based scoring begins from global start time
   - All submissions must be made before competition ends
   - Late submissions will not be accepted

### Prohibited Activities

❌ **Strictly Forbidden**:
- Attacking the CTF platform or servers
- DDoS or flooding attacks
- Attempting to access other teams' accounts
- Sharing credentials or flags with other teams
- Using multiple accounts for one team
- Social engineering competition staff
- Tampering with leaderboard or scoring system

### Penalties for Rule Violations

- **Warning**: First minor offense
- **Point Deduction**: Repeated minor offenses
- **Disqualification**: Major violations or repeated offenses
- **Ban**: Severe violations (may affect future competitions)

### Reporting Issues

If you encounter:
- **Technical Issues**: Platform bugs, submission errors, connectivity problems
- **Security Vulnerabilities**: Platform vulnerabilities (not challenge vulnerabilities)
- **Unfair Conduct**: Other teams cheating or violating rules

**How to Report**:
- Contact organizers via WhatsApp (preferred)
- Email: contact@medusa.ecsc-uok.com
- In-platform support ticket

**Don't Report**:
- Challenge difficulties (use hints instead)
- Your own mistakes or wrong flags
- Other teams legitimately solving challenges faster

---

## ❓ FAQs

### General Questions

**Q: How long is Round 2?**
A: Round 2 duration varies, but time-based scoring decay occurs over 6 hours. Check competition schedule for exact duration.

**Q: Can I work on both challenges simultaneously?**
A: Yes! You can switch between Android and PWN challenges at any time.

**Q: What happens if I get disconnected?**
A: Your progress is saved. Simply log back in with your team credentials.

**Q: Can I take breaks during the competition?**
A: Yes, but remember that time-based scoring is active. The longer you take, the fewer points you'll earn.

### Technical Questions

**Q: Can I use a rooted Android device?**
A: Yes, rooted devices are allowed and may be helpful for deeper analysis.

**Q: What if the PWN challenge IP is unreachable?**
A: Check your network connection first. If the issue persists, contact organizers immediately.

**Q: What if the container resets while I'm exploiting it?**
A: This is normal for CTF challenges. Document your steps so you can reproduce your exploit quickly.

### Scoring Questions

**Q: If I submit the same flag multiple times, does it count as multiple attempts?**
A: No. Duplicate submissions are ignored and don't count against your attempts.

**Q: Can I get partial credit for partial flags?**
A: No. Flags must be complete and exact to receive points.

**Q: If I unlock a hint but don't use it, am I still charged?**
A: Yes. Once unlocked, the point cost is immediately deducted.

### Challenge-Specific Questions

**Q: Do I need a real Android device or can I use an emulator?**
A: Either works. Emulators are easier to set up but may be slower.

**Q: For PWN challenge, do I need both flags to get any points?**
A: No. User flag and root flag are scored independently. You can earn 450 points for just the user flag.

**Q: What if I find an unintended solution?**
A: That's perfectly fine! Unintended solutions count and are often celebrated in CTFs.

**Q: Can I reset my attempts if I made mistakes?**
A: No. Attempts cannot be reset. Use your attempts wisely.

### Hint Questions

**Q: Are hints the same for all teams?**
A: Yes, hints are standardized for fairness.

**Q: How detailed are the hints?**
A: Hint 1 is usually a gentle nudge, Hint 2 is more specific, Hint 3 is very direct.

**Q: Can I unlock hints after solving the challenge?**
A: Yes, but there's no benefit. Hints are only useful before solving.

**Q: If I unlock a hint by accident, can I get a refund?**
A: No. All hint unlocks are final.

**Q: Do PWN hints help with both user and root flags?**
A: Yes! PWN hints are designed to guide you through the entire container escape process, from initial exploitation to privilege escalation and breakout. They cover both stages and apply to capturing both flags.

---

### Tool Documentation

- [ADB Documentation](https://developer.android.com/tools/adb)
- [apktool Documentation](https://apktool.org/docs/)
- [jadx GitHub](https://github.com/skylot/jadx)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Frida Documentation](https://frida.re/docs/home/)

---

## 🏁 Quick Start Checklist

Use this checklist on competition day:

### 30 Minutes Before Start

- [ ] Computer is charged/plugged in
- [ ] All required tools are installed and tested
- [ ] Android device/emulator is ready and connected
- [ ] ADB is working (`adb devices`)
- [ ] Internet connection is stable
- [ ] Team communication channel is ready (Discord, Slack, etc.)
- [ ] Note-taking tool is open
- [ ] Downloaded any reference materials you might need
- [ ] Reviewed flag formats (MEDUSA{}, HashX{})
- [ ] Read through this guide one more time

### At Competition Start

- [ ] Log in to MEDUSA CTF platform
- [ ] Navigate to Round 2
- [ ] Enter Round 2 password
- [ ] Download Perseus APK immediately
- [ ] Install APK on device: `adb install perseus.apk`
- [ ] Decide team strategy (split challenges or work together?)
- [ ] Start timer to track 6-hour scoring window
- [ ] Begin reconnaissance on both challenges

### During Competition

- [ ] Document all findings in notes
- [ ] Save any scripts or tools you create
- [ ] Take screenshots of important discoveries
- [ ] Communicate with teammates regularly
- [ ] Monitor remaining attempts before submitting
- [ ] Check leaderboard periodically for motivation
- [ ] Take short breaks to avoid burnout
- [ ] Keep track of time for strategic hint usage

### Before Submitting Flags

- [ ] Verify flag format (MEDUSA{} or HashX{})
- [ ] Check for typos or extra spaces
- [ ] Confirm you're submitting to the correct challenge
- [ ] Verify you have attempts remaining
- [ ] Double-check capitalization
- [ ] Copy-paste carefully (don't type manually)

---

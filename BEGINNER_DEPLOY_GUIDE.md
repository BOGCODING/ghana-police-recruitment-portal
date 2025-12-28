# 🚀 Beginner's Guide: Deploying the Ghana Police Recruitment Portal

Welcome! This guide will take you from your computer to a live website in just 10-15 minutes. We will use **Render** (to host the code), **Supabase** (for the database), and **Upstash** (for the speed/notifications).

---

## 🛠️ Step 1: Requirements
Before starting, make sure you have:
1. A **GitHub** account with your code pushed to a repository.
2. A **Render.com** account (Free).
3. A **Supabase.com** account (Free).
4. An **Upstash.com** account (Free).

---

## 🐘 Step 2: Set up the Database (Supabase)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and name it "Ghana Police Recruitment".
3. Set a **Database Password** and save it somewhere safe!
4. Once created, go to **Project Settings** (gear icon) -> **Database**.
5. Scroll down to **Connection String** -> **URI**.
6. **Copy that link!** It looks like this: `postgresql://postgres:[YOUR-PASSWORD]@...`
   - *Tip: Replace `[YOUR-PASSWORD]` with the password you created.*

---

## ⚡ Step 3: Set up Redis (Upstash)
1. Go to [Upstash Console](https://console.upstash.com/).
2. Click **Create Database**.
3. Name it "GPS-Cache", select a region near you, and click **Create**.
4. Scroll down to **Connect your database** and select the **Node.js** tab.
5. Look for the **REDIS_URL**.
6. **Copy that link!** It looks like this: `rediss://default:[TOKEN]@...:6379`

---

## 🚀 Step 4: Deploy to Render (The "Magic" Step)
We use a **Blueprint**, which means Render will read our configuration file and set everything up for you automatically.

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button at the top right.
3. Select **Blueprint**.
4. Connect your GitHub account and find your `ghana-police-recruitment-portal` repository.
5. Render will show you a list of services (Backend, Frontend, Admin). Click **Apply**.
6. **Important Part: Environment Variables.** Render will ask you for 3 values:
   - `DATABASE_URL`: Paste the link from **Step 2**.
   - `REDIS_URL`: Paste the link from **Step 3**.
   - `CORS_ORIGIN`: For now, just type `*` (you can change this later to your real website addresses for better security).

7. Click **Apply Changes**.

---

## 🏁 Step 5: Verification
Now, wait for about 5 minutes. Render is building your applications.
1. Once **gps-backend** says "Live", click its URL and add `/api/health` to the end. It should show a "Healthy" message.
2. Once **gps-frontend** is "Live", click its URL to see your recruitment portal!
3. Once **gps-admin** is "Live", click its URL to see the admin dashboard!

---

## ⚠️ Common Beginner Issues
- **First Build Failure**: If it fails the very first time, click "Manual Deploy" -> "Clear Cache & Deploy" on the service that failed.
- **Database Errors**: Make sure you replaced `[YOUR-PASSWORD]` in your Supabase link with your actual password!

**Congratulations! You are now a cloud-deployed developer!** 🚔🏛️

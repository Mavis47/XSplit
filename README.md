XSplit

A production-ready expense-sharing platform inspired by Splitwise, built with Next.js 16, Prisma, PostgreSQL, Kafka, Redis, Docker, and NextAuth.

Live Demo

https://x-split-three.vercel.app

Features
Authentication using NextAuth/Auth.js
Friend Requests
Expense Sharing
Group Expenses
Equal & Unequal Split
Notification System
Kafka Event Streaming
Redis Caching
Dockerized Development
Prisma ORM
PostgreSQL
Responsive UI
REST APIs
Background Workers
Tech Stack
Category	Technologies
Frontend	Next.js 16, React, TypeScript, TailwindCSS
Backend	Next.js Route Handlers
Database	PostgreSQL
ORM	Prisma
Authentication	NextAuth
Cache	Redis
Message Broker	Apache Kafka
Containerization	Docker
Deployment	Vercel
System Architecture
                  +----------------+
                  |     Client     |
                  |  Next.js App   |
                  +-------+--------+
                          |
                          |
                    REST API Calls
                          |
                          v
          +-------------------------------+
          |       Next.js Backend         |
          +---------------+---------------+
                          |
      +-------------------+--------------------+
      |                   |                    |
      |                   |                    |
      v                   v                    v
 PostgreSQL            Redis Cache         Kafka Producer
      |                                        |
      |                                        |
      +----------------------------+-----------+
                                   |
                                   v
                           Kafka Consumer
                                   |
                                   v
                           Notifications Table
Project Workflow
Login
User
   │
   ▼
NextAuth
   │
   ▼
JWT Session
   │
   ▼
Protected Routes

Friend Request Flow

User A
   │
   ▼
Send Friend Request
   │
   ▼
Database
   │
   ▼
Publish Kafka Event
   │
   ▼
Kafka Topic
   │
   ▼
Notification Worker
   │
   ▼
Notification Table
   │
   ▼
User B sees Notification

Accept Friend Request Workflow

Accept Request
      │
      ▼
Update FriendRequest
      │
      ▼
Create Friendship
      │
      ▼
Publish Kafka Event
      │
      ▼
Consumer
      │
      ▼
Notification Created

Expense Creation Workflow
Create Expense
      │
      ▼
Validate Members
      │
      ▼
Save Expense
      │
      ▼
Publish Kafka Event
      │
      ▼
Notification Worker
      │
      ▼
Create Notifications

Redis Workflow

Request
   │
   ▼
Check Redis
   │
   ├──────────────► Cache Hit
   │                    │
   │                    ▼
   │               Return Data
   │
   ▼
Cache Miss
   │
   ▼
Database
   │
   ▼
Save into Redis
   │
   ▼
Return Data

Kafka Workflow
API Request
      │
      ▼
Kafka Producer
      │
      ▼
Kafka Topic
      │
      ▼
Kafka Consumer
      │
      ▼
Notification Service
      │
      ▼
Database

Folder Structure
app
│
├── api
│     ├── auth
│     ├── expenses
│     ├── friends
│     ├── groups
│     └── notifications
│
├── components
│
├── context
│
├── lib
│      ├── prisma
│      ├── kafka
│      └── redis
│
├── generated
│
└── workers
      └── notification-worker.ts

API Documentation
Authentication
Register
POST /api/auth/register

Body

{
  "name":"John",
  "username":"john",
  "email":"john@gmail.com",
  "password":"password"
}
Login
POST /api/auth/login
Friends
Search Users
GET /api/friends/search?q=john
Send Friend Request
POST /api/friends/request
{
    "receiverId":12
}
Accept Friend Request
PUT /api/friends/request/accept
{
    "requestId":5
}
Reject Friend Request
PUT /api/friends/request/reject
Get Friends
GET /api/friends
Groups
Create Group
POST /api/groups
Get Groups
GET /api/groups
Add Member
POST /api/groups/addmember
Expenses
Create Expense
POST /api/expenses
Get Personal Expenses
GET /api/expenses/personal
Get Group Expenses
GET /api/expenses/group
Search Expenses
GET /api/expenses/search
Notifications
Get Notifications
GET /api/notifications
Mark Read
PATCH /api/notifications/read
Docker

Start all services

docker compose up -d

Stop

docker compose down
Environment Variables
DATABASE_URL=

AUTH_SECRET=

AUTH_URL=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

KAFKA_BROKER=

REDIS_HOST=

REDIS_PORT=

USE_KAFKA=true

USE_REDIS=true
Local Development
git clone https://github.com/Mavis47/XSplit

cd XSplit

npm install

docker compose up -d

npx prisma migrate dev

npm run dev

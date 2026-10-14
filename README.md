# My Fullstack Blog

โปรเจกต์บล็อกแบบ Full-stack สำหรับฝึกพัฒนาเว็บ โดยใช้ React สำหรับส่วนติดต่อผู้ใช้, Express สำหรับ API และ MongoDB สำหรับจัดเก็บข้อมูล



## ธีม UI

หน้าเว็บใช้สไตล์ **Minimal Editorial / Journal** เน้นพื้นหลังสว่าง โทนสีขาว-ดำและสีเทา ตัวอักษรน้ำหนักเบา ระยะห่างโปร่ง และหัวข้อที่เว้นระยะตัวอักษรเพื่อให้ความรู้สึกเหมือนวารสาร หน้าอ่านบทความใช้ตัวอักษรแบบ serif เพื่อให้อ่านเนื้อหาได้สบาย ส่วนหน้ารายการบทความและหน้าบัญชีใช้ sans-serif ปัจจุบันยังไม่มีตัวเลือกสลับธีมหรือ dark mode

## เทคโนโลยี

- **Frontend:** React, Vite, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs
- **Database:** MongoDB

## โครงสร้างโปรเจกต์

```text
my-blog-backend/   # Express API และการเชื่อมต่อ MongoDB
my-blog-frontend/  # React application
```

## สิ่งที่ต้องติดตั้ง

- Node.js และ npm
- MongoDB database (เช่น MongoDB Atlas)

## เริ่มใช้งานในเครื่อง

### 1. ตั้งค่า Backend

เปิด terminal ในโฟลเดอร์ `my-blog-backend` แล้วติดตั้ง dependencies:

```bash
npm install
```

สร้างไฟล์ `.env` ใน `my-blog-backend`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

แทนค่าตัวอย่างด้วยค่าจริงของคุณ โดย `MONGODB_URI` ต้องชี้ไปยังฐานข้อมูล MongoDB ที่ backend เข้าถึงได้ และควรเก็บไฟล์ `.env` ไว้เป็นความลับ

เริ่ม API ในโหมดพัฒนา:

```bash
npm run dev
```

Backend จะเริ่มทำงานที่ `http://localhost:5000` (หรือพอร์ตที่กำหนดใน `PORT`)

### 2. ตั้งค่า Frontend

เปิด terminal อีกหน้าต่างในโฟลเดอร์ `my-blog-frontend` แล้วติดตั้ง dependencies:

```bash
npm install
```

หาก backend ไม่ได้ใช้ `http://localhost:5000` ให้สร้างไฟล์ `.env` ใน `my-blog-frontend` และกำหนด URL ของ API:

```env
VITE_API_URL=http://localhost:5000
```

เริ่ม frontend:

```bash
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal โดยปกติคือ `http://localhost:5173`

## การใช้งานบัญชี

- สร้างบัญชีผู้ใช้จากหน้า Register ได้ ผู้ใช้ที่สมัครใหม่จะมี role `user`
- เข้าสู่ระบบผู้ดูแลด้วย `ADMIN_USERNAME` และ `ADMIN_PASSWORD` ที่ตั้งไว้ใน backend
- เฉพาะผู้ดูแลระบบเท่านั้นที่สร้างหรือลบบทความได้

## API

Base URL ในเครื่อง: `http://localhost:5000`

| Method | Endpoint | รายละเอียด | สิทธิ์ |
| --- | --- | --- | --- |
| `POST` | `/api/register` | สมัครสมาชิกด้วย `username` และ `password` | สาธารณะ |
| `POST` | `/api/login` | เข้าสู่ระบบด้วย `username` และ `password` | สาธารณะ |
| `GET` | `/api/posts` | ดูบทความทั้งหมด เรียงจากใหม่ไปเก่า | สาธารณะ |
| `POST` | `/api/posts` | สร้างบทความด้วย `title` และ `content` | ผู้ดูแลระบบ |
| `DELETE` | `/api/posts/:id` | ลบบทความตาม ID | ผู้ดูแลระบบ |

คำขอที่ต้องใช้สิทธิ์ผู้ดูแลต้องส่ง JWT ใน header `Authorization` โดยใช้รูปแบบ `Bearer` ตามด้วย token

## Scripts

**Backend (`my-blog-backend`):**

- `npm run dev` — เริ่มเซิร์ฟเวอร์ด้วย nodemon

**Frontend (`my-blog-frontend`):**

- `npm run dev` — เริ่ม Vite development server
- `npm run build` — สร้างไฟล์สำหรับ production
- `npm run preview` — เปิดดู production build ในเครื่อง
- `npm run lint` — ตรวจสอบโค้ดด้วย ESLint

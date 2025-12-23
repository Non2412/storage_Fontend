# คู่มือการ Login Admin

## ปัญหาที่พบ
ไม่สามารถ login เข้าหน้า admin ได้

## สาเหตุที่เป็นไปได้

### 1. ไม่มี User Admin ในระบบ
Backend อาจยังไม่มี user ที่มี `role: 'admin'` ในฐานข้อมูล

### 2. ข้อมูล Login ไม่ถูกต้อง
- Email หรือ Password ผิด
- Role ไม่ถูกต้อง

## วิธีแก้ไข

### วิธีที่ 1: สร้าง Admin User ผ่าน Backend
คุณต้องเข้าไปที่ Backend และสร้าง user ที่มี role เป็น 'admin'

```javascript
// ตัวอย่างการสร้าง admin user ใน MongoDB
{
  "name": "Admin User",
  "email": "admin@example.com",
  "username": "admin",
  "password": "hashed_password", // ต้อง hash ด้วย bcrypt
  "role": "admin",
  "phone": "0812345678"
}
```

### วิธีที่ 2: ตรวจสอบ Response จาก API
1. เปิด Browser DevTools (F12)
2. ไปที่ tab Network
3. พยายาม login
4. ดูที่ request `/api/auth/login`
5. ตรวจสอบ response ว่า:
   - `success: true` หรือไม่
   - `data.user.role` เป็น `'admin'` หรือไม่

### วิธีที่ 3: ใช้ Demo Mode (Temporary Fix)
ถ้าต้องการทดสอบหน้า admin โดยไม่ต้องมี backend:

1. Login ด้วย user ธรรมดา
2. เปิด Browser Console (F12)
3. รันคำสั่ง:

```javascript
// เปลี่ยน role เป็น admin
const user = JSON.parse(localStorage.getItem('ndr_currentUser'));
user.role = 'admin';
localStorage.setItem('ndr_currentUser', JSON.stringify(user));
// Reload หน้า
window.location.href = '/admin';
```

## ข้อมูล Admin ที่ควรมี

สำหรับ Production ควรมี admin user อย่างน้อย 1 คน:

```
Email: admin@materially.com
Password: [กำหนดเอง - ควรเป็น strong password]
Role: admin
```

## การตรวจสอบว่า Login สำเร็จ

หลังจาก login สำเร็จ:
1. ระบบจะ redirect ไปที่ `/admin` ถ้า role เป็น 'admin'
2. ระบบจะ redirect ไปที่ `/dashboard` ถ้า role เป็น 'shelter_staff' หรือ 'warehouse_staff'

## ตรวจสอบ Current User

เปิด Browser Console และรัน:

```javascript
console.log(JSON.parse(localStorage.getItem('ndr_currentUser')));
```

ควรเห็น:
```json
{
  "id": "...",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

## ติดต่อ Backend Team

ถ้าปัญหายังไม่หาย ให้ติดต่อทีม Backend เพื่อ:
1. สร้าง admin user ในฐานข้อมูล
2. ตรวจสอบว่า API `/api/auth/login` return role ถูกต้อง
3. ตรวจสอบว่า middleware authentication ทำงานถูกต้อง

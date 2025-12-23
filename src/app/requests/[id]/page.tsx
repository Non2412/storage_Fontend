"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function RequestDetail() {
  const params = useParams();
  const id = params?.id || 'unknown';

  return (
    <div style={{ padding: 24 }}>
      <h1>Request {id}</h1>
      <p>รายละเอียดคำขอ {id} (ตัวอย่างข้อมูล)</p>
      <Link href="/dashboard">← Back to dashboard</Link>
    </div>
  );
}

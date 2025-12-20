import Link from "next/link";
export default function LogisticsPage() {
  return (
    <div style={{padding:24}}>
      <h1>Logistics</h1>
      <p>จัดการการขนส่งและยานพาหนะ</p>
      <Link href="/dashboard">← Back to dashboard</Link>
    </div>
  );
}

import Link from "next/link";
export default function SheltersPage() {
  return (
    <div style={{padding:24}}>
      <h1>Shelters</h1>
      <p>ข้อมูลศูนย์พักพิงทั้งหมด</p>
      <Link href="/dashboard">← Back to dashboard</Link>
    </div>
  );
}

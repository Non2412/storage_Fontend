import Link from "next/link";
export default function SettingsPage() {
  return (
    <div style={{padding:24}}>
      <h1>Settings</h1>
      <p>ตั้งค่าระบบ และข้อมูลบัญชี</p>
      <Link href="/dashboard">← Back to dashboard</Link>
    </div>
  );
}

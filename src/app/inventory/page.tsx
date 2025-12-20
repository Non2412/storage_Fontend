import Link from "next/link";
export default function InventoryPage() {
  return (
    <div style={{padding:24}}>
      <h1>Inventory</h1>
      <p>รายการคลังสินค้าและสต็อกทั้งหมด</p>
      <Link href="/dashboard">← Back to dashboard</Link>
    </div>
  );
}

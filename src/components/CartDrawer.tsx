"use client";

import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, Send } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { submitRequest, getCurrentUser } from '@/lib/api';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    shelterId: string;
}

export default function CartDrawer({ isOpen, onClose, shelterId }: CartDrawerProps) {
    const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (cart.length === 0) {
            alert('ตะกร้าว่างเปล่า กรุณาเลือกสินค้าก่อน');
            return;
        }

        if (!reason.trim()) {
            alert('กรุณาระบุเหตุผลในการขอสินค้า');
            return;
        }

        setIsSubmitting(true);

        try {
            const items = cart.map(item => ({
                itemId: item.itemId,
                quantityRequested: item.quantity
            }));

            const result = await submitRequest(shelterId, items, reason);

            if (result.success) {
                alert('✅ ส่งคำขอสินค้าเรียบร้อยแล้ว!\n\nสินค้าถูกพักไว้รอการอนุมัติจากแอดมิน');
                clearCart();
                setReason('');
                onClose();

                // Reload page to update inventory
                window.location.reload();
            } else {
                alert('เกิดข้อผิดพลาด: ' + (result.message || 'ไม่สามารถส่งคำขอได้'));
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('เกิดข้อผิดพลาดในการส่งคำขอ');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const user = getCurrentUser();

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.drawer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <ShoppingCart size={24} />
                        <div>
                            <h2 className={styles.title}>ตะกร้าสินค้า</h2>
                            <p className={styles.subtitle}>{getTotalItems()} รายการ</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className={styles.content}>
                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <ShoppingCart size={64} color="#adb5bd" />
                            <p>ตะกร้าว่างเปล่า</p>
                            <span>เลือกสินค้าที่ต้องการขอจากคลัง</span>
                        </div>
                    ) : (
                        <>
                            <div className={styles.itemsList}>
                                {cart.map(item => (
                                    <div key={item.itemId} className={styles.cartItem}>
                                        <div className={styles.itemInfo}>
                                            <h3 className={styles.itemName}>{item.itemName}</h3>
                                            <p className={styles.itemUnit}>หน่วย: {item.unit}</p>
                                            <p className={styles.itemAvailable}>มีในคลัง: {item.maxAvailable.toLocaleString()} {item.unit}</p>
                                        </div>

                                        <div className={styles.itemActions}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <input
                                                    type="number"
                                                    className={styles.qtyInput}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.itemId, parseInt(e.target.value) || 1)}
                                                    min={1}
                                                    max={item.maxAvailable}
                                                />
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.maxAvailable}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => removeFromCart(item.itemId)}
                                                title="ลบออกจากตะกร้า"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reason Input */}
                            <div className={styles.reasonSection}>
                                <label className={styles.reasonLabel}>เหตุผลในการขอสินค้า *</label>
                                <textarea
                                    className={styles.reasonInput}
                                    placeholder="ระบุเหตุผลหรือความจำเป็นในการขอสินค้า เช่น จำนวนผู้ประสบภัยเพิ่มขึ้น, สินค้าใกล้หมด, เป็นต้น"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* User Info */}
                            {user && (
                                <div className={styles.userInfo}>
                                    <p><strong>ผู้ขอ:</strong> {user.name}</p>
                                    <p><strong>อีเมล:</strong> {user.email}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className={styles.footer}>
                        <button
                            className={styles.clearBtn}
                            onClick={() => {
                                if (confirm('ต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?')) {
                                    clearCart();
                                }
                            }}
                        >
                            ล้างตะกร้า
                        </button>
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <Send size={18} />
                            {isSubmitting ? 'กำลังส่ง...' : `ส่งคำขอ (${getTotalItems()} รายการ)`}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

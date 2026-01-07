"use client";

import React, { useState } from 'react';
import styles from './QuantityModal.module.css';

interface QuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
    itemName: string;
    unit: string;
    maxAvailable: number;
}

export default function QuantityModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    unit,
    maxAvailable
}: QuantityModalProps) {
    const [quantity, setQuantity] = useState(1);

    // Reset quantity when modal opens (using key or controlled reset)
    const handleClose = () => {
        setQuantity(1);
        onClose();
    };

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (quantity > 0 && quantity <= maxAvailable) {
            onConfirm(quantity);
            onClose();
        }
    };

    const handleIncrement = () => {
        if (quantity < maxAvailable) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        // Prevent negative numbers and zero
        if (!isNaN(value)) {
            if (value >= 1) {
                setQuantity(value);
            } else {
                // If user tries to enter 0 or negative, set to 1
                setQuantity(1);
            }
        } else if (e.target.value === '') {
            setQuantity(1);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className={styles.backdrop} onClick={handleClose} />

            {/* Modal */}
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>ระบุจำนวน</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.itemInfo}>
                        <div className={styles.itemIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={styles.itemName}>{itemName}</h3>
                            <p className={styles.availableText}>
                                มีในคลัง: <span className={styles.availableAmount}>{maxAvailable} {unit}</span>
                            </p>
                        </div>
                    </div>

                    <div className={styles.quantitySection}>
                        <label className={styles.label}>จำนวนที่ต้องการ</label>
                        <div className={styles.quantityControl}>
                            <button
                                className={styles.quantityButton}
                                onClick={handleDecrement}
                                disabled={quantity <= 1}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                            <input
                                type="number"
                                className={`${styles.quantityInput} ${quantity > maxAvailable ? styles.quantityInputError : ''}`}
                                value={quantity}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    // Prevent typing minus (-), plus (+), dot (.), and 'e' (scientific notation)
                                    if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                                min={1}
                            />
                            <button
                                className={styles.quantityButton}
                                onClick={handleIncrement}
                                disabled={quantity >= maxAvailable}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                        <p className={styles.unitText}>{unit}</p>
                    </div>

                    {quantity > maxAvailable && (
                        <div className={styles.warningMessage}>
                            ⚠️ จำนวนสิ่งของที่ต้องการไม่เพียงพอ
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={handleClose}>
                        ยกเลิก
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={quantity <= 0 || quantity > maxAvailable}
                    >
                        ✓ เพิ่มลงตะกร้า
                    </button>
                </div>
            </div>
        </>
    );
}

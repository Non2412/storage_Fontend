"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './needs.module.css';

export default function NeedsPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'general',
        quantity: 1,
        unit: 'ชิ้น',
        urgency: 'normal',
        description: '',
        requesterName: '',
        requesterContact: ''
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        try {
            const raw = localStorage.getItem('ndr_currentUser');
            if (!raw) {
                router.replace('/login');
                return;
            }
        } catch {
            router.replace('/login');
        }
    }, [router, isMounted]);

    if (!isMounted) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Get current user (though requesterName is in form, we might want to ensure consistency or just use form data)
            // For history consistency, we use the logged in user context if needed, but the form has 'requesterName'.
            // Let's use the form's requesterName as the 'user' in history.

            const newRequest = {
                id: Date.now().toString(),
                type: 'request',
                itemName: formData.title,
                quantity: formData.quantity,
                unit: formData.unit || 'ชิ้น',
                user: formData.requesterName,
                timestamp: new Date().toISOString(),
                details: `${formData.description} (ความเร่งด่วน: ${formData.urgency})`,
                status: 'รอดำเนินการ'
            };

            // Save to localStorage
            const existingRequests = JSON.parse(localStorage.getItem('ems_user_requests') || '[]');
            localStorage.setItem('ems_user_requests', JSON.stringify([newRequest, ...existingRequests]));

            console.log('Form submitted:', formData);
            alert('บันทึกความต้องการเรียบร้อยแล้ว');

            // Reset form
            setFormData({
                title: '',
                category: 'general',
                quantity: 1,
                unit: 'ชิ้น',
                urgency: 'normal',
                description: '',
                requesterName: '',
                requesterContact: ''
            });
        } catch (error) {
            console.error('Error saving request:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    return (
        <AppLayout>
            <div className={styles.pageContainer}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>แจ้งความต้องการสิ่งของ</h1>
                    <p className={styles.pageSubtitle}>กรอกรายละเอียดสิ่งของที่ต้องการขอความช่วยเหลือ</p>
                </div>

                <div className={styles.contentWrapper}>
                    <form className={styles.formCard} onSubmit={handleSubmit}>
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>รายละเอียดสิ่งของ</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="title">หัวข้อ / รายการที่ต้องการ <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="เช่น ยาพาราเซตามอล, ข้าวสาร 50 กก."
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">หมวดหมู่</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        <option value="food">อาหารและเครื่องดื่ม</option>
                                        <option value="clothing">เสื้อผ้าและเครื่องนุ่มห่ม</option>
                                        <option value="medical">ยาและเวชภัณฑ์</option>
                                        <option value="hygiene">อุปกรณ์สุขอนามัย</option>
                                        <option value="general">อุปกรณ์ทั่วไป</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="urgency">ความเร่งด่วน</label>
                                    <select
                                        id="urgency"
                                        name="urgency"
                                        value={formData.urgency}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        <option value="normal">ปกติ (ภายใน 3-5 วัน)</option>
                                        <option value="urgent">ด่วน (ภายใน 24 ชม.)</option>
                                        <option value="critical">ด่วนมาก (ทันที)</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="quantity">จำนวน <span className={styles.required}>*</span></label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="unit">หน่วยนับ</label>
                                    <input
                                        type="text"
                                        id="unit"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        placeholder="เช่น ชิ้น, กล่อง, แพ้ค"
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">รายละเอียดเพิ่มเติม</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสิ่งของ สถานที่จัดส่ง หรือข้อมูลอื่นๆ ที่จำเป็น"
                                    className={styles.textarea}
                                />
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>ข้อมูลผู้แจ้ง</h2>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="requesterName">ชื่อผู้แจ้ง <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        id="requesterName"
                                        name="requesterName"
                                        value={formData.requesterName}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="requesterContact">เบอร์โทรศัพท์ / ช่องทางติดต่อ <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        id="requesterContact"
                                        name="requesterContact"
                                        value={formData.requesterContact}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" className={styles.cancelButton} onClick={() => router.back()}>
                                ยกเลิก
                            </button>
                            <button type="submit" className={styles.submitButton}>
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

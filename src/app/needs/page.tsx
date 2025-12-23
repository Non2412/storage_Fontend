"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import styles from './needs.module.css';
import { getItems, getShelters, submitRequest, getCurrentUser, type Item, type Shelter } from '@/lib/api';

export default function NeedsPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [formData, setFormData] = useState({
        shelterId: '',
        itemId: '',
        quantity: 1,
        urgency: 'normal',
        description: ''
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        try {
            const user = getCurrentUser();
            if (!user) {
                router.replace('/login');
                return;
            }
        } catch {
            router.replace('/login');
            return;
        }

        // Load items and shelters
        loadFormData();
    }, [router, isMounted]);

    const loadFormData = async () => {
        setLoading(true);
        try {
            const [itemsResult, sheltersResult] = await Promise.all([
                getItems(),
                getShelters()
            ]);

            if (itemsResult.success && itemsResult.data) {
                setItems(itemsResult.data);
            }

            if (sheltersResult.success && sheltersResult.data) {
                setShelters(sheltersResult.data);
            }
        } catch (err) {
            console.error('Error loading form data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.shelterId || !formData.itemId || formData.quantity < 1) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitRequest(
                formData.shelterId,
                [{
                    itemId: formData.itemId,
                    quantityRequested: formData.quantity
                }],
                formData.description
            );

            if (result.success) {
                alert('บันทึกความต้องการเรียบร้อยแล้ว');

                // Reset form
                setFormData({
                    shelterId: '',
                    itemId: '',
                    quantity: 1,
                    urgency: 'normal',
                    description: ''
                });
            } else {
                alert(result.message || 'ไม่สามารถบันทึกข้อมูลได้');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className={styles.pageContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>แจ้งความต้องการสิ่งของ</h1>
                        <p className={styles.pageSubtitle}>กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className={styles.pageContainer}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>แจ้งความต้องการสิ่งของ</h1>
                    <p className={styles.pageSubtitle}>กรอกข้อมูลเพื่อขอสิ่งของจากคลัง</p>
                </div>

                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {/* Shelter Selection */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>ข้อมูลศูนย์พักพิง</h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    ศูนย์พักพิง <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="shelterId"
                                    value={formData.shelterId}
                                    onChange={handleChange}
                                    className={styles.select}
                                    required
                                    disabled={submitting}
                                >
                                    <option value="">เลือกศูนย์พักพิง</option>
                                    {shelters.map(shelter => (
                                        <option key={shelter._id} value={shelter._id}>
                                            {shelter.name} - {shelter.district}, {shelter.province}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Item Request */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>รายการสิ่งของที่ต้องการ</h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    สิ่งของ <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="itemId"
                                    value={formData.itemId}
                                    onChange={handleChange}
                                    className={styles.select}
                                    required
                                    disabled={submitting}
                                >
                                    <option value="">เลือกสิ่งของ</option>
                                    {items.map(item => (
                                        <option key={item._id} value={item._id}>
                                            {item.name} ({item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    จำนวน <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className={styles.input}
                                    min="1"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>ความเร่งด่วน</label>
                                <select
                                    name="urgency"
                                    value={formData.urgency}
                                    onChange={handleChange}
                                    className={styles.select}
                                    disabled={submitting}
                                >
                                    <option value="low">ต่ำ</option>
                                    <option value="normal">ปกติ</option>
                                    <option value="high">สูง</option>
                                    <option value="urgent">ด่วนมาก</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>รายละเอียดเพิ่มเติม</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={4}
                                    placeholder="ระบุรายละเอียดเพิ่มเติม..."
                                    disabled={submitting}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => router.back()}
                                disabled={submitting}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={submitting}
                            >
                                {submitting ? 'กำลังบันทึก...' : 'บันทึกความต้องการ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

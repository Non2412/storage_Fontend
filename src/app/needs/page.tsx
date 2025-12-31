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
    const [shelterSearchQuery, setShelterSearchQuery] = useState('');
    const [showShelterDropdown, setShowShelterDropdown] = useState(false);
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [showItemDropdown, setShowItemDropdown] = useState(false);

    useEffect(() => {
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
                // Save to localStorage for requests page
                try {
                    const selectedShelter = shelters.find(s => s._id === formData.shelterId);
                    const selectedItem = items.find(i => i._id === formData.itemId);

                    if (selectedShelter && selectedItem) {
                        const existingRequests = JSON.parse(localStorage.getItem('user_requests') || '[]');
                        const newRequest = {
                            id: `REQ-${String(existingRequests.length + 1).padStart(3, '0')}`,
                            itemName: selectedItem.name,
                            quantity: formData.quantity,
                            unit: selectedItem.unit,
                            urgency: formData.urgency === 'urgent' ? 'ด่วน' : formData.urgency === 'normal' ? 'ปกติ' : 'ทั่วไป',
                            status: 'pending',
                            shelterName: selectedShelter.name,
                            requestDate: new Date().toISOString(),
                            note: formData.description || undefined
                        };
                        existingRequests.unshift(newRequest); // Add to beginning
                        localStorage.setItem('user_requests', JSON.stringify(existingRequests));
                    }
                } catch (err) {
                    console.error('Error saving to localStorage:', err);
                }

                alert('บันทึกความต้องการเรียบร้อยแล้ว');

                // Reset form
                setFormData({
                    shelterId: '',
                    itemId: '',
                    quantity: 1,
                    urgency: 'normal',
                    description: ''
                });
                setShelterSearchQuery('');
                setShowShelterDropdown(false);
                setItemSearchQuery('');
                setShowItemDropdown(false);
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
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="shelterSearch"
                                        value={shelterSearchQuery}
                                        onChange={(e) => {
                                            setShelterSearchQuery(e.target.value);
                                            setShowShelterDropdown(true);
                                        }}
                                        onFocus={() => setShowShelterDropdown(true)}
                                        className={styles.select}
                                        placeholder="พิมพ์เพื่อค้นหาศูนย์พักพิง..."
                                        disabled={submitting}
                                        autoComplete="off"
                                    />
                                    {showShelterDropdown && (
                                        <>
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    zIndex: 9
                                                }}
                                                onClick={() => setShowShelterDropdown(false)}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '8px',
                                                    marginTop: '4px',
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    zIndex: 10
                                                }}
                                            >
                                                {shelters
                                                    .filter(shelter =>
                                                        shelter.name.toLowerCase().includes(shelterSearchQuery.toLowerCase()) ||
                                                        shelter.province.toLowerCase().includes(shelterSearchQuery.toLowerCase()) ||
                                                        shelter.district.toLowerCase().includes(shelterSearchQuery.toLowerCase())
                                                    )
                                                    .map(shelter => (
                                                        <div
                                                            key={shelter._id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, shelterId: shelter._id }));
                                                                setShelterSearchQuery(`${shelter.name} - ${shelter.district}, ${shelter.province}`);
                                                                setShowShelterDropdown(false);
                                                            }}
                                                            style={{
                                                                padding: '12px 16px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #f1f3f5',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                        >
                                                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#212529' }}>
                                                                {shelter.name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#868e96', marginTop: '2px' }}>
                                                                {shelter.district}, {shelter.province}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                {shelters.filter(shelter =>
                                                    shelter.name.toLowerCase().includes(shelterSearchQuery.toLowerCase()) ||
                                                    shelter.province.toLowerCase().includes(shelterSearchQuery.toLowerCase()) ||
                                                    shelter.district.toLowerCase().includes(shelterSearchQuery.toLowerCase())
                                                ).length === 0 && (
                                                        <div style={{ padding: '16px', textAlign: 'center', color: '#868e96' }}>
                                                            ไม่พบศูนย์พักพิงที่ค้นหา
                                                        </div>
                                                    )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Item Request */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>รายการสิ่งของที่ต้องการ</h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    สิ่งของ <span className={styles.required}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="itemSearch"
                                        value={itemSearchQuery}
                                        onChange={(e) => {
                                            setItemSearchQuery(e.target.value);
                                            setShowItemDropdown(true);
                                        }}
                                        onFocus={() => setShowItemDropdown(true)}
                                        className={styles.select}
                                        placeholder="พิมพ์เพื่อค้นหาสิ่งของ..."
                                        disabled={submitting}
                                        autoComplete="off"
                                    />
                                    {showItemDropdown && (
                                        <>
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    zIndex: 9
                                                }}
                                                onClick={() => setShowItemDropdown(false)}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '8px',
                                                    marginTop: '4px',
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    zIndex: 10
                                                }}
                                            >
                                                {items
                                                    .filter(item =>
                                                        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                                                        item.categoryId?.name?.toLowerCase().includes(itemSearchQuery.toLowerCase())
                                                    )
                                                    .map(item => (
                                                        <div
                                                            key={item._id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, itemId: item._id }));
                                                                setItemSearchQuery(`${item.name} (${item.unit})`);
                                                                setShowItemDropdown(false);
                                                            }}
                                                            style={{
                                                                padding: '12px 16px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #f1f3f5',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                        >
                                                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#212529' }}>
                                                                {item.name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#868e96', marginTop: '2px' }}>
                                                                หน่วย: {item.unit} {item.categoryId?.name && `• หมวดหมู่: ${item.categoryId.name}`}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                {items.filter(item =>
                                                    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                                                    item.categoryId?.name?.toLowerCase().includes(itemSearchQuery.toLowerCase())
                                                ).length === 0 && (
                                                        <div style={{ padding: '16px', textAlign: 'center', color: '#868e96' }}>
                                                            ไม่พบสิ่งของที่ค้นหา
                                                        </div>
                                                    )}
                                            </div>
                                        </>
                                    )}
                                </div>
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

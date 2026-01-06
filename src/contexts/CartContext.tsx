"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    maxAvailable: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem('ndr_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to load cart:', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('ndr_cart', JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    const addToCart = (item: CartItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.itemId === item.itemId);

            if (existingItem) {
                // Update quantity if item already in cart
                return prevCart.map(i =>
                    i.itemId === item.itemId
                        ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.maxAvailable) }
                        : i
                );
            } else {
                // Add new item to cart
                return [...prevCart, item];
            }
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.itemId !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.itemId === itemId
                    ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxAvailable)) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalItems = () => {
        return cart.length;
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

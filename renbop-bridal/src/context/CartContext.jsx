import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cartItems');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error('Failed to load cart from localStorage', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Failed to save cart to localStorage', error);
        }
    }, [cartItems]);

    const addToCart = (itemPayload) => {
        // itemPayload contains:
        // { product, quantity, orderType, productItemId, size, rentalStartDate, rentalEndDate, notes, price }
        setCartItems(prevItems => {
            // Đối với đồ Mua (PURCHASE), nếu trùng item trong kho (productItemId) thì có thể tăng quantity
            // Đối với Thuê/May Đo, tốt nhất tạo một dòng riêng (vì có ngày thuê/ghi chú khác nhau)
            if (itemPayload.orderType === 'PURCHASE') {
                const existingIndex = prevItems.findIndex(
                    i => i.product.id === itemPayload.product.id && i.productItemId === itemPayload.productItemId && i.orderType === 'PURCHASE'
                );
                if (existingIndex > -1) {
                    const newItems = [...prevItems];
                    newItems[existingIndex].quantity += itemPayload.quantity;
                    return newItems;
                }
            }

            // Tạo một item mới hoàn toàn
            const newItem = {
                ...itemPayload,
                cartItemId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            };
            return [...prevItems, newItem];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            subtotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

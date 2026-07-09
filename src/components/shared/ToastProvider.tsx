'use client';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-left"
            containerClassName="!z-[999999]"
            containerStyle={{ zIndex: 999999 }}
            toastOptions={{
                duration: 3000,
                success: {
                    style: {
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                    },
                    iconTheme: {
                        primary: '#166534',
                        secondary: '#f0fdf4',
                    },
                },
                error: {
                    style: {
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                    },
                    iconTheme: {
                        primary: '#991b1b',
                        secondary: '#fef2f2',
                    },
                },
            }}
        />
    );
}

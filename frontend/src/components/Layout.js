// src/components/Layout.js
import { Outlet } from 'react-router-dom';
import { SocketProvider } from '../contexts/SocketContext';
import Header from './Header';

export default function Layout() {
    return (
        <SocketProvider>
            <Header />

            <main style={{ padding: 20 }}>
                <Outlet />
            </main>
        </SocketProvider>
    );
}
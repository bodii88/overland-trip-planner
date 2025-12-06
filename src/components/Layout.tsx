import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Car, Settings, Home, Shield } from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    return (
        <div className="flex h-screen bg-transparent text-gray-100 font-sans">
            {/* Desktop Sidebar Navigation */}
            <nav className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900/90 backdrop-blur-lg border-r border-gray-800">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white mb-8">Trip Planner</h1>
                    <div className="space-y-2">
                        <NavLink
                            to="/"
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Home size={20} />
                            <span className="font-medium">My Trips</span>
                        </NavLink>
                        <NavLink
                            to="/vehicles"
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Car size={20} />
                            <span className="font-medium">Vehicles</span>
                        </NavLink>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Settings size={20} />
                            <span className="font-medium">Settings</span>
                        </NavLink>
                        <NavLink
                            to="/admin"
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Shield size={20} />
                            <span className="font-medium">Admin</span>
                        </NavLink>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-800 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    <NavLink to="/" className={({ isActive }) => clsx("flex flex-col items-center p-2", isActive ? "text-blue-400" : "text-gray-400")}>
                        <Home size={24} />
                        <span className="text-xs mt-1">Trips</span>
                    </NavLink>
                    <NavLink to="/vehicles" className={({ isActive }) => clsx("flex flex-col items-center p-2", isActive ? "text-blue-400" : "text-gray-400")}>
                        <Car size={24} />
                        <span className="text-xs mt-1">Vehicles</span>
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => clsx("flex flex-col items-center p-2", isActive ? "text-blue-400" : "text-gray-400")}>
                        <Settings size={24} />
                        <span className="text-xs mt-1">Settings</span>
                    </NavLink>
                    <NavLink to="/admin" className={({ isActive }) => clsx("flex flex-col items-center p-2", isActive ? "text-purple-400" : "text-gray-400")}>
                        <Shield size={24} />
                        <span className="text-xs mt-1">Admin</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

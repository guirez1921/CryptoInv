import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    BarChart2,
    Users,
    ChevronRight,
    ShieldAlert,
    MessageSquare
} from 'lucide-react';
import { route } from 'ziggy-js';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { url } = usePage();

    const navigation = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: LayoutDashboard,
            description: 'Overview & Users'
        },
        {
            name: 'Statistics',
            href: route('admin.statistics'),
            icon: BarChart2,
            description: 'Platform Analytics'
        },
        // {
        //   name: 'User Management',
        //   href: route('admin.users.index'), // Does not exist yet, Dashboard covers this
        //   icon: Users,
        //   description: 'Manage All Users'
        // },
        // {
        //   name: 'System Logs',
        //   href: '#',
        //   icon: ShieldAlert,
        //   description: 'Security & Activity'
        // },
    ];

    const isActive = (href) => {
        return url === href || url.startsWith(href);
    };

    return (
        <div
            className={`sticky left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 z-40 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'} lg:static lg:block`}
            style={{ zIndex: 40 }}
        >
            <div className="p-6">
                {/* Navigation Title */}
                <div className="mb-6">
                    <h2 className="text-xs font-semibold tracking-wider text-red-500 uppercase">
                        Admin Controls
                    </h2>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-red-900/50 to-orange-900/50 text-white shadow-lg border border-red-800/50'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-red-400' : 'text-gray-400 group-hover:text-red-400'}`} />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className={`text-xs ${active ? 'text-red-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1'
                                    }`} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="pt-6 mt-8 border-t border-gray-800">
                    <div className="px-4 py-3 rounded-lg bg-red-900/10 border border-red-900/20">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600">
                                <ShieldAlert className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">Super Admin</p>
                                <p className="text-xs text-red-400">Restricted Access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;

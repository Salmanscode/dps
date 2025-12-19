import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Truck, Users, MapPin, DollarSign, History } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Truck },
    { path: "/drivers", label: "Drivers", icon: Users },
    { path: "/trips", label: "Trips", icon: MapPin },
    { path: "/settlements", label: "Settlements", icon: DollarSign },
    { path: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Truck size={32} />
            <span className="text-xl font-bold">Driver Payment System</span>
          </div>
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === path
                    ? "bg-blue-700"
                    : "hover:bg-blue-500"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

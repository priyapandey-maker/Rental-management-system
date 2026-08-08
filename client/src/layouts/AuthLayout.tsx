import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {/* Logo Placeholder */}
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-gray-900 font-bold text-xl">RMS</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Rental Management
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-100 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

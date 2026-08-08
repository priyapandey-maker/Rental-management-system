import React from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="xl" isLink={false} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-100 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

"use client";

import React from 'react';
import AdminRouteGuard from '@/components/AdminRouteGuard';
import AdminPanel from '@/components/AdminPanel';

const Admin = () => {
  return (
    <AdminRouteGuard>
      <AdminPanel />
    </AdminRouteGuard>
  );
};

export default Admin;
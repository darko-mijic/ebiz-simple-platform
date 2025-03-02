"use client";

import { Sidebar } from './Sidebar';

interface SidebarWrapperProps {
  collapsed?: boolean;
}

export default function SidebarWrapper({ collapsed = false }: SidebarWrapperProps) {
  return <Sidebar collapsed={collapsed} />;
} 
"use client";

import { Header } from './Header';
import { useTheme } from '../providers/theme-provider';

interface HeaderWrapperProps {
  onToggleSidebar?: () => void;
}

export default function HeaderWrapper({ onToggleSidebar }: HeaderWrapperProps) {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return <Header toggleTheme={toggleTheme} theme={theme} onToggleSidebar={onToggleSidebar} />;
} 
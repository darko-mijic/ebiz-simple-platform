"use client";

import { useState, useEffect } from 'react';
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { UserAvatar } from '../../../components/ui/UserAvatar';
import { useUser } from '../../../components/providers/user-provider';
import { useToast } from '../../../hooks/use-toast';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Bell, 
  Moon, 
  Sun,
  Save,
  Languages,
  ArrowDownUp,
  BellRing,
  Info
} from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize user data from context
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: '', // Add phone if we have it in the User model
      });
    }
  }, [user]);

  // Mock company data
  const [companyData, setCompanyData] = useState({
    name: 'Acme Corp',
    address: '123 Business St, Berlin, Germany',
    localVatId: '12345678901',
    euVatId: 'DE123456789',
  });
  
  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    statementUploads: true,
    transactionAlerts: false,
    weeklyReports: true
  });
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // This would normally modify the theme in a theme provider
  };

  const handleSavePersonalInfo = () => {
    // Mock API call to save user data
    toast({
      title: "Profile updated",
      description: "Your personal information has been saved.",
      type: "success",
    });
  };
  
  const handleSaveCompanyInfo = () => {
    // Mock API call to save company data
    toast({
      title: "Company updated",
      description: "Your company information has been saved.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </h2>
            
            <div className="flex items-center mb-6">
              <UserAvatar 
                profilePictureUrl={user?.profilePictureUrl}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="lg"
                className="mr-4"
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Profile picture from Google
                </p>
                <p className="text-xs text-gray-400">
                  Your profile picture is automatically updated from your Google account
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <Input 
                  value={userData.firstName} 
                  onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input 
                  value={userData.lastName} 
                  onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input 
                  value={userData.email} 
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input 
                  value={userData.phone} 
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  type="tel"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSavePersonalInfo}>
                Save Changes
              </Button>
            </div>
          </Card>
          
          {/* Company Information */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Company Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company Name</label>
                <Input 
                  value={companyData.name} 
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input 
                  value={companyData.address} 
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Local VAT ID</label>
                  <Input 
                    value={companyData.localVatId} 
                    onChange={(e) => setCompanyData({...companyData, localVatId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">EU VAT ID (Optional)</label>
                  <Input 
                    value={companyData.euVatId} 
                    onChange={(e) => setCompanyData({...companyData, euVatId: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveCompanyInfo}>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Preferences */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Preferences
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Email Notifications</label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings, 
                    emailNotifications: e.target.checked
                  })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Statement Upload Alerts</label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.statementUploads}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings, 
                    statementUploads: e.target.checked
                  })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Large Transaction Alerts</label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.transactionAlerts}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings, 
                    transactionAlerts: e.target.checked
                  })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Weekly Reports</label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings, 
                    weeklyReports: e.target.checked
                  })}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </Card>
          
          {/* Theme */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              {isDarkMode ? (
                <Moon className="mr-2 h-5 w-5" />
              ) : (
                <Sun className="mr-2 h-5 w-5" />
              )}
              Appearance
            </h2>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <button 
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 
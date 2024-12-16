import React, { useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Switch,
  Divider,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar
} from "@nextui-org/react";
import {
  Key,
  Shield,
  Smartphone,
  History,
  LogOut,
  AlertCircle,
  Check,
  X,
  Lock,
  Mail,
  Fingerprint,
  RefreshCw,
  Laptop,
  AlertTriangle
} from "lucide-react";

interface SecurityForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  recoveryEmail: string;
  deviceAuthorization: boolean;
}

const SecuritySettings = () => {
  const { userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState<SecurityForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    recoveryEmail: userData?.email || '',
    deviceAuthorization: true
  });

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      action: "Login",
      device: "Chrome on Windows",
      location: "London, UK",
      time: "2024-03-15 14:30:00",
      status: "success",
      ipAddress: "192.168.1.1"
    },
    {
      id: 2,
      action: "Password Change",
      device: "Mobile App",
      location: "Paris, FR",
      time: "2024-03-14 09:15:00",
      status: "success",
      ipAddress: "192.168.1.2"
    },
    {
      id: 3,
      action: "Login Attempt",
      device: "Firefox on Mac",
      location: "New York, US",
      time: "2024-03-13 22:45:00",
      status: "failed",
      ipAddress: "192.168.1.3"
    }
  ];

  const handleInputChange = (field: keyof SecurityForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      // Show error
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password change API call
      console.log('Changing password:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
      // Reset form
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      // TODO: Implement 2FA toggle API call
      console.log('Toggling 2FA:', enabled);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormData(prev => ({ ...prev, twoFactorEnabled: enabled }));
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Security Settings</h1>
          <p className="text-default-500">Manage your account security and authentication</p>
        </div>
      </div>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Change Password</h3>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <Input
            type="password"
            label="Current Password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            startContent={<Lock className="w-4 h-4 text-default-400" />}
          />
          <Input
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            startContent={<Lock className="w-4 h-4 text-default-400" />}
          />
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            startContent={<Lock className="w-4 h-4 text-default-400" />}
          />
          <Button
            color="primary"
            isLoading={isLoading}
            onPress={handlePasswordChange}
          >
            Update Password
          </Button>
        </CardBody>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-default-500">
                Add an extra layer of security to your account
              </p>
              <p className="text-5l font-light tracking-tight">We advice that before completing this you ensure that you have created a backup on your local device for Security reasons.</p>
            </div>
            <Switch
              isSelected={formData.twoFactorEnabled}
              onValueChange={handle2FAToggle}
              isDisabled={isLoading}
            />
          </div>
          {formData.twoFactorEnabled && (
            <>
              <Divider />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Authentication App</p>
                    <p className="text-sm text-default-500">
                      Use an authenticator app to generate codes
                    </p>
                  </div>
                  <Button color="primary" variant="flat" startContent={<Smartphone />}>
                    Configure App
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Recovery Codes</p>
                    <p className="text-sm text-default-500">
                      Generate backup codes for account recovery
                    </p>
                  </div>
                  <Button color="primary" variant="flat" startContent={<RefreshCw />}>
                    Generate Codes
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Recovery Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold">Recovery Email</h3>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <Input
            type="email"
            label="Recovery Email Address"
            placeholder="Enter recovery email"
            value={formData.recoveryEmail}
            onChange={(e) => handleInputChange('recoveryEmail', e.target.value)}
            startContent={<Mail className="w-4 h-4 text-default-400" />}
          />
          <Button color="primary">
            Update Recovery Email
          </Button>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Recent activity">
            <TableHeader>
              <TableColumn>ACTION</TableColumn>
              <TableColumn>DEVICE</TableColumn>
              <TableColumn>LOCATION</TableColumn>
              <TableColumn>TIME</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4" />
                      {activity.device}
                    </div>
                  </TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>{activity.time}</TableCell>
                  <TableCell>
                    <Chip
                      color={activity.status === 'success' ? 'success' : 'danger'}
                      variant="flat"
                      startContent={activity.status === 'success' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    >
                      {activity.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Security Alert Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h3 className="text-lg font-semibold">Security Alerts</h3>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Suspicious Activity Alerts</p>
                <p className="text-sm text-default-500">
                  Get notified about unusual account activity
                </p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">New Device Login Alerts</p>
                <p className="text-sm text-default-500">
                  Get notified when a new device logs into your account
                </p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Password Change Alerts</p>
                <p className="text-sm text-default-500">
                  Get notified when your password is changed
                </p>
              </div>
              <Switch defaultSelected />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Device Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Device Management</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Current Device */}
            <div className="flex justify-between items-center p-4 bg-default-100 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar
                  icon={<Laptop />}
                  classNames={{
                    base: "bg-primary",
                    icon: "text-white"
                  }}
                />
                <div>
                  <p className="font-medium">Current Device</p>
                  <p className="text-sm text-default-500">Chrome on Windows • London, UK</p>
                </div>
              </div>
              <Chip color="success" variant="flat">Active Now</Chip>
            </div>
            
            {/* Other Devices */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar
                  icon={<Smartphone />}
                  classNames={{
                    base: "bg-default-200",
                    icon: "text-default-500"
                  }}
                />
                <div>
                  <p className="font-medium">iPhone 13</p>
                  <p className="text-sm text-default-500">Mobile App • Last active 2 hours ago</p>
                </div>
              </div>
              <Button color="danger" variant="light" startContent={<LogOut />}>
                Remove
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default SecuritySettings;
import React, { useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Avatar,
  Textarea,
  Switch,
  Divider,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Upload,
  Camera,
  Edit,
  Shield,
  Bell
} from "lucide-react";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const ProfileSettings = () => {
  const { userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [avatar, setAvatar] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileForm>({
    firstName: userData?.first_name || '',
    lastName: userData?.last_name || '',
    email: userData?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    notifications: {
      email: true,
      sms: true,
      push: true
    }
  });

  const handleInputChange = (field: keyof ProfileForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update profile
      console.log('Updating profile:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error updating profile:', error);
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
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-default-500">Manage your personal information</p>
        </div>
        <Button
          color="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
        >
          Save Changes
        </Button>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardBody className="flex flex-col md:flex-row gap-6 items-center p-6">
          <div className="relative">
            <Avatar
              className="w-24 h-24"
              src={avatar || userData?.avatar}
              showFallback
              name={`${formData.firstName} ${formData.lastName}`}
            />
            <Button
              isIconOnly
              className="absolute bottom-0 right-0"
              size="sm"
              color="primary"
              variant="flat"
              onPress={onOpen}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            <p className="text-sm text-default-500">
              Upload a high-quality profile picture for better recognition.
              JPG or PNG, max 2MB.
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            startContent={<Upload className="w-4 h-4" />}
            onPress={onOpen}
          >
            Upload New Picture
          </Button>
        </CardBody>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              startContent={<User className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              startContent={<User className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              startContent={<Mail className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              startContent={<Phone className="w-4 h-4 text-default-400" />}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
            />
          </div>
          
          <Divider className="my-4" />
          
          <div className="space-y-4">
            <Input
              label="Address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              startContent={<MapPin className="w-4 h-4 text-default-400" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="Enter your city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                startContent={<MapPin className="w-4 h-4 text-default-400" />}
              />
              <Input
                label="Country"
                placeholder="Enter your country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                startContent={<Globe className="w-4 h-4 text-default-400" />}
              />
            </div>
          </div>
          
          <Divider className="my-4" />
          
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            minRows={3}
          />
        </CardBody>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-default-500">Receive email updates about your account</p>
              </div>
              <Switch
                isSelected={formData.notifications.email}
                onValueChange={(value) => handleInputChange('notifications', {
                  ...formData.notifications,
                  email: value
                })}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-default-500">Receive text messages about your appointments</p>
              </div>
              <Switch
                isSelected={formData.notifications.sms}
                onValueChange={(value) => handleInputChange('notifications', {
                  ...formData.notifications,
                  sms: value
                })}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-default-500">Receive push notifications in your browser</p>
              </div>
              <Switch
                isSelected={formData.notifications.push}
                onValueChange={(value) => handleInputChange('notifications', {
                  ...formData.notifications,
                  push: value
                })}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Avatar Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Upload Profile Picture</ModalHeader>
          <ModalBody>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              color="primary"
              variant="flat"
              fullWidth
              onPress={() => document.getElementById('avatar-upload')?.click()}
            >
              Select Image
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default ProfileSettings;
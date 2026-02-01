import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  User,
  Settings,
  Shield,
  Palette,
  Bell,
  Key,
  Edit3,
  Save,
  X,
  Camera,
  TrendingUp,
  Calendar,
  Mail
} from 'lucide-react';

// Tab configuration
const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  // Preferences tab removed
];

// Form field configuration
const FORM_FIELD_CONFIG = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'Enter your location' }
];

const Profile = () => {
  // Context and navigation
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // 2FA states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  // Notification toggles
  const [budgetAlertEnabled, setBudgetAlertEnabled] = useState(user?.budgetAlertEnabled ?? true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(user?.emailNotificationsEnabled ?? true);

  // Save notification toggle changes immediately
  const handleToggleChange = async (field, value) => {
    if (field === 'budgetAlertEnabled') setBudgetAlertEnabled(value);
    if (field === 'emailNotificationsEnabled') setEmailNotificationsEnabled(value);
    try {
      await updateUser({
        ...editedUser,
        budgetAlertEnabled: field === 'budgetAlertEnabled' ? value : budgetAlertEnabled,
        emailNotificationsEnabled: field === 'emailNotificationsEnabled' ? value : emailNotificationsEnabled
      });
    } catch (error) {
      // Optionally show error toast
    }
  };
  // Fetch 2FA status on mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const res = await api.get('/auth/2fa/status');
        setIs2FAEnabled(res.data.is2FAEnabled);
      } catch (e) {
        setIs2FAEnabled(false);
      }
    };
    fetch2FAStatus();
  }, [refreshTrigger]);
  // Handle 2FA Enable button click
  const handleEnable2FA = async () => {
    setIsSendingOtp(true);
    setOtp('');
    setOtpError('');
    try {
      await api.post('/auth/2fa/send-otp');
      setShow2FAModal(true);
    } catch (e) {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      await api.post('/auth/2fa/verify-otp', { otp });
      setShow2FAModal(false);
      setIs2FAEnabled(true);
      setRefreshTrigger(prev => prev + 1);
      alert('Two-factor authentication enabled!');
    } catch (e) {
      setOtpError(e.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
      setBudgetAlertEnabled(user.budgetAlertEnabled ?? true);
      setEmailNotificationsEnabled(user.emailNotificationsEnabled ?? true);
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit cancellation
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || ''
    });
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const updatedUserData = await updateUser({
        ...editedUser,
        budgetAlertEnabled,
        emailNotificationsEnabled
      });

      setEditedUser({
        name: updatedUserData.name || '',
        email: updatedUserData.email || '',
        phone: updatedUserData.phone || '',
        location: updatedUserData.location || '',
        bio: updatedUserData.bio || ''
      });
      setBudgetAlertEnabled(updatedUserData.budgetAlertEnabled ?? true);
      setEmailNotificationsEnabled(updatedUserData.emailNotificationsEnabled ?? true);
      setIsEditing(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password input changes
  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setIsChangingPassword(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
          if (error.response.data.message.includes('Current password is incorrect')) {
          setPasswordErrors({ currentPassword: 'Current password is incorrect' });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle password modal cancellation
  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  // Generate unique key for React reconciliation
  const renderKey = user ? `user-${user._id}-${refreshTrigger}` : 'no-user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Profile Settings
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6">
              <nav className="space-y-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div key={renderKey} className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="card-modern p-8">
                  <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    {/* Profile Avatar */}
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* User Information */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {user?.name || 'Not provided'}
                        </h2>
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              className={`btn-primary flex items-center space-x-1 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Save className="w-4 h-4" />
                              <span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn-secondary flex items-center space-x-1"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="btn-secondary flex items-center space-x-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{user?.email || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FORM_FIELD_CONFIG.map((field) => (
                      <FormField
                        key={field.key}
                        field={field}
                        isEditing={isEditing}
                        editedUser={editedUser}
                        user={user}
                        onChange={handleInputChange}
                      />
                    ))}
                  </div>

                  <BioField
                    isEditing={isEditing}
                    editedUser={editedUser}
                    user={user}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Account Statistics */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Account Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">127</h4>
                      <p className="text-gray-600 dark:text-gray-400">Total Transactions</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">45</h4>
                      <p className="text-gray-600 dark:text-gray-400">Days Active</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Premium</h4>
                      <p className="text-gray-600 dark:text-gray-400">Account Type</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="card-modern p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Account Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailNotificationsEnabled}
                        onChange={e => handleToggleChange('emailNotificationsEnabled', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Budget Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when approaching budget limits</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={budgetAlertEnabled}
                        onChange={e => handleToggleChange('budgetAlertEnabled', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card-modern p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="btn-primary"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                      </div>
                    </div>
                    {is2FAEnabled ? (
                      <span className="text-green-600 font-semibold">Enabled</span>
                    ) : (
                      <button
                        className={`btn-secondary ${isSendingOtp ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleEnable2FA}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? 'Sending OTP...' : 'Enable'}
                      </button>
                    )}
                  </div>
                      {/* 2FA OTP Modal */}
                      {show2FAModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Enter OTP</h3>
                              <button
                                onClick={() => setShow2FAModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <p className="text-gray-700 dark:text-gray-300">An OTP has been sent to your email. Please enter it below to enable 2FA.</p>
                              <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className={`input-modern w-full ${otpError ? 'border-red-500' : ''}`}
                                placeholder="Enter OTP"
                                maxLength={6}
                              />
                              {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
                            </div>
                            <div className="flex space-x-3 mt-6">
                              <button
                                onClick={handleVerifyOtp}
                                disabled={isVerifyingOtp || !otp}
                                className={`flex-1 btn-primary ${isVerifyingOtp ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                              </button>
                              <button
                                onClick={() => setShow2FAModal(false)}
                                disabled={isVerifyingOtp}
                                className="flex-1 btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              </div>
            )}

            {/* Preferences Tab removed */}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        show={showPasswordModal}
        onClose={handleCancelPasswordChange}
        passwordData={passwordData}
        passwordErrors={passwordErrors}
        isChangingPassword={isChangingPassword}
        onInputChange={handlePasswordInputChange}
        onSubmit={handlePasswordChange}
        onCancel={handleCancelPasswordChange}
      />
    </div>
  );
};

// Form Field Component
const FormField = ({ field, isEditing, editedUser, user, onChange, errors = {} }) => {
  const { key, label, type, placeholder } = field;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={(editedUser[key] !== undefined ? editedUser[key] : user?.[key]) || ''}
          onChange={(e) => onChange(key, e.target.value)}
          className={`input-modern w-full ${errors[key] ? 'border-red-500' : ''}`}
          placeholder={placeholder}
        />
      ) : (
        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
          {user?.[key] || 'Not provided'}
        </p>
      )}
    </div>
  );
};

// Bio Field Component
const BioField = ({ isEditing, editedUser, user, onChange }) => (
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Bio
    </label>
    {isEditing ? (
      <textarea
        value={(editedUser.bio !== undefined ? editedUser.bio : user?.bio) || ''}
        onChange={(e) => onChange('bio', e.target.value)}
        rows={4}
        className="input-modern w-full"
        placeholder="Tell us about yourself..."
      />
    ) : (
      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-6 rounded-lg">
        {user?.bio || 'No bio provided'}
      </p>
    )}
  </div>
);

// Password Change Modal Component
const PasswordChangeModal = ({
  show,
  onClose,
  passwordData,
  passwordErrors,
  isChangingPassword,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => onInputChange('currentPassword', e.target.value)}
              className={`input-modern w-full ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
              placeholder="Enter your current password"
            />
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => onInputChange('newPassword', e.target.value)}
              className={`input-modern w-full ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
              placeholder="Enter your new password"
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => onInputChange('confirmPassword', e.target.value)}
              className={`input-modern w-full ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm your new password"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onSubmit}
            disabled={isChangingPassword}
            className={`flex-1 btn-primary ${isChangingPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
          <button
            onClick={onCancel}
            disabled={isChangingPassword}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
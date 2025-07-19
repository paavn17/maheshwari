'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, BookOpen, Briefcase, Users, Shield } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ROLE_OPTIONS = [
  { id: 'student', label: 'Student', icon: <BookOpen className="w-5 h-5" />, bgColor: 'bg-orange-400', dashboardUrl: '/student/dashboard' },
  { id: 'employee', label: 'Employee', icon: <Briefcase className="w-5 h-5" />, bgColor: 'bg-orange-400', dashboardUrl: '/employee/dashboard' },
  { id: 'institution admin', label: 'Institution Admin', icon: <Users className="w-5 h-5" />, bgColor: 'bg-orange-400', dashboardUrl: '/institute/dashboard' },
  { id: 'super admin', label: 'Super Admin', icon: <Shield className="w-5 h-5" />, bgColor: 'bg-orange-400', dashboardUrl: '/admin/dashboard' },
];

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '', role: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showAdminContact, setShowAdminContact] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (res.ok && data.role) {
          const match = ROLE_OPTIONS.find(r => r.id === data.role);
          if (match?.dashboardUrl) {
            router.replace(match.dashboardUrl);
          }
        }
      } catch {
        console.log('No existing login. Proceed to login page.');
      }
    };
    checkAuth();
  }, [router]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email or ID is required';
    if (!formData.password) newErrors.password = 'Password or Phone is required';
    if (!formData.role) newErrors.role = 'Please select your role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: formData.role === 'admin' ? 'super admin' : formData.role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const dashboard = ROLE_OPTIONS.find(r => r.id === formData.role)?.dashboardUrl || '/';
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => router.push(dashboard), 1000);
      } else {
        setErrors({ general: data.error || 'Login failed. Please try again.' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mx-auto mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={60} 
                height={60} 
                className="rounded-full border-2 border-white" 
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Maheshwari ID Card's</h1>
          <p className="text-gray-600 text-sm">Welcome back! Please sign in to continue</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            {successMessage}
          </div>
        )}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleInputChange('role', role.id)}
                  className={`p-2 rounded-lg border-2 transition-all duration-300 text-md font-medium ${
                    formData.role === role.id
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500 border-orange-500 text-white shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={formData.role === role.id ? 'text-white' : 'text-orange-500'}>
                      {role.icon}
                    </div>
                    <span className="text-center leading-tight">{role.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="text"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email / Roll No / Emp ID"
              className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 text-md ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
              } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password / Mobile"
                className={`w-full px-3 py-2 pr-10 rounded-lg border-2 transition-all duration-200 text-md ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-s text-red-600">{errors.password}</p>}
          </div>

          {/* Remember Me + Forgot Password + Contact Info Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-3 h-3 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
              />
              <span className="ml-2 text-s text-gray-600 font-medium">Remember me</span>
            </label>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowAdminContact(prev => !prev)}
                className="text-s text-orange-500 hover:text-orange-700 font-semibold transition-colors"
              >
                Forgot password?
              </button>
              {showAdminContact && (
                <p className="mt-1 text-[15px] text-gray-500">
                  Admin: <span className="font-medium text-orange-600">+91 9876543210</span>
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 
            text-white py-2 px-4 rounded-lg font-semibold text-md transition-all duration-200 focus:outline-none focus:ring-2 
            focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center 
            justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

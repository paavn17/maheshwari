// ✅ Final Login Page Logic with Role Mapping Fix
'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, BookOpen, Users, Settings } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ROLE_OPTIONS = [
  { id: 'student', label: 'Student', icon: <BookOpen className="w-6 h-6" />, bgColor: 'bg-cyan-500', dashboardUrl: '/student/dashboard' },
  { id: 'employee', label: 'Employee', icon: <BookOpen className="w-6 h-6" />, bgColor: 'bg-cyan-500', dashboardUrl: '/employee/dashboard' },
  { id: 'institution admin', label: 'Institution Admin', icon: <Users className="w-6 h-6" />, bgColor: 'bg-cyan-500', dashboardUrl: '/institute/dashboard' },
  { id: 'super admin', label: 'Super Admin', icon: <Settings className="w-6 h-6" />, bgColor: 'bg-cyan-500', dashboardUrl: '/admin/dashboard' }
];

export default function LoginPage() {

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
    } catch (err) {
      console.log('No existing login. Proceed to login page.');
    }
  };

  checkAuth();
}, []);


  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', role: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email or ID is required';
    if (!formData.password) newErrors.password = 'Password or Phone is required';
    if (!formData.role) newErrors.role = 'Please select your role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
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
          // ✅ Fix inconsistent role naming before sending to backend
          role: formData.role === 'admin' ? 'super admin' : formData.role
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const dashboard = ROLE_OPTIONS.find(r => r.id === formData.role)?.dashboardUrl || '/';
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => router.push(dashboard), 1000);
      } else {
        setErrors({ general: data.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center md:justify-start px-6 md:pl-24 lg:pl-60">
      <div className="absolute inset-0 bg-[url('/images/login-bg.jpeg')] bg-cover bg-center opacity-80 z-0 hidden md:block"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 opacity-90 mix-blend-overlay z-0"></div>

      <div className="relative z-10 w-[80%] max-w-md md:max-w-xl lg:max-w-xl backdrop-blur-lg bg-white/50 rounded-2xl shadow-xl border border-white/30 p-6 md:p-10">
        <div className="text-center mb-8">
          <div className="rounded-full flex items-center justify-center mx-auto">
            <Image src="/images/logo.png" alt="Logo" width={120} height={120} className="rounded-full" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Maheshwari ID Card's</h1>
          <p className="text-base text-gray-700">Welcome back! Please sign in to continue</p>
        </div>

        {successMessage && <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{successMessage}</div>}
        {errors.general && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleInputChange('role', role.id)}
                  className={`p-2 md:p-4 rounded-xl border-2 transition-all duration-200 text-xs md:text-sm ${
                    formData.role === role.id
                      ? `${role.bgColor} border-transparent text-white shadow-lg transform scale-105`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:scale-102'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1 md:space-y-2">
                    {role.icon}
                    <span className="font-medium">{role.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="text"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email / Roll No / Emp ID"
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm md:text-base ${
                errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-sky-500 focus:border-sky-500'
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password / Mobile"
                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 text-sm md:text-base ${
                  errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-sky-500 focus:border-sky-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button type="button" className="text-sm text-sky-600 hover:text-sky-800 font-medium">Forgot password?</button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Signing in...</>) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

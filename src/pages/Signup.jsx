import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { signup } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { account } from '../appwriteClient.js';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
      });
      const u = await account.get();
      setUser(u);
      await refreshProfile();
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 p-8 rounded-2xl shadow-xl border-2 border-brand-maroon">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brand-maroon mb-2">
            Create Account
          </h1>
          <p className="text-brand-maroon/80">
            Join us for a festive dining experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Delivery Address"
            name="address"
            placeholder="123 Main St, Appt 4"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-brand-maroon/80">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-maroon font-bold hover:underline"
            >
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


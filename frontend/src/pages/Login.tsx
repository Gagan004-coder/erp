import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to ERP Portal!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
      </div>

      {/* Left visual hero section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-800/40 p-12 flex-col justify-between border-r border-surface-700/60 z-10">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="ERP Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <span className="text-xl font-bold text-white tracking-wide">Enterprise ERP</span>
            <span className="block text-xs text-brand-400 font-medium tracking-wider uppercase">NextGen Operations Hub</span>
          </div>
        </div>

        <div className="my-auto py-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-surface-600/60 group">
            <img 
              src="/assets/login_hero.png" 
              alt="Digital Supply Chain & Logistics" 
              className="w-full h-80 object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="badge badge-blue mb-2">Real-time Analytics</span>
              <h2 className="text-xl font-bold text-white mb-2">Streamlined Logistics & Inventory Management</h2>
              <p className="text-sm text-gray-300">Empower your warehouse, accounts, and sales teams with seamless delivery challans & stock tracking.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-surface-800/80 p-3.5 rounded-xl border border-surface-700">
              <p className="text-xs text-gray-400">System Uptime</p>
              <p className="text-lg font-bold text-emerald-400">99.98%</p>
            </div>
            <div className="bg-surface-800/80 p-3.5 rounded-xl border border-surface-700">
              <p className="text-xs text-gray-400">Live Inventory</p>
              <p className="text-lg font-bold text-brand-400">Automated</p>
            </div>
            <div className="bg-surface-800/80 p-3.5 rounded-xl border border-surface-700">
              <p className="text-xs text-gray-400">Security</p>
              <p className="text-lg font-bold text-purple-400">Enterprise RBAC</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex justify-between items-center">
          <span>© 2026 ERP CRM Systems Inc.</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Operational</span>
        </div>
      </div>

      {/* Right login form section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/assets/logo.png" alt="ERP Logo" className="w-12 h-12 object-contain" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">ERP Portal</h1>
              <p className="text-xs text-gray-400">Operations Hub</p>
            </div>
          </div>

          <div className="card-glass p-8 relative">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
              <p className="text-gray-400 text-sm mt-1">Access your enterprise workspace</p>
            </div>

            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="admin@erp.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="label mb-0">Password</label>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary w-full justify-center py-3 text-sm font-semibold mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : 'Sign In to Portal'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-surface-700/60">
              <p className="text-xs font-semibold text-gray-400 text-center mb-3">Quick Demo Accounts (Click to auto-fill)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Admin', email: 'admin@erp.com', role: 'Full Access', color: 'hover:border-brand-500/50' },
                  { label: 'Sales', email: 'sales@erp.com', role: 'Challans & Clients', color: 'hover:border-emerald-500/50' },
                  { label: 'Warehouse', email: 'warehouse@erp.com', role: 'Stock & Inventory', color: 'hover:border-amber-500/50' },
                  { label: 'Accounts', email: 'accounts@erp.com', role: 'Read-only View', color: 'hover:border-purple-500/50' },
                ].map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email)}
                    className={`bg-surface-700/50 hover:bg-surface-700 border border-surface-600/60 p-2.5 rounded-xl text-left transition-all group ${acc.color}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-white text-xs font-semibold group-hover:text-brand-400 transition-colors">{acc.label}</p>
                      <span className="text-[10px] text-gray-400">🔑</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


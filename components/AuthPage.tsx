'use client';
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // State untuk login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State untuk register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMessage, setRegMessage] = useState('');

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });
    if (res?.error) {
      setLoginError('Login failed. Please check your credentials.');
    } else {
     router.push("/dashboard");
    }
  };

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setRegMessage('Register success! You can now login.');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setIsLogin(true);
    } else {
      setRegMessage(data.error || 'Register failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-200 relative overflow-hidden">
        <img
        src="/logo.svg"
        alt="Logo"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] max-w-none max-h-none opacity-10 pointer-events-none select-none"
        style={{ zIndex: 0 }}
        />
      <h1 className="text-4xl font-bold mb-8 text-center">Document Management System</h1>
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl p-8">
          {isLogin ? (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
              {loginError && <div className="alert alert-error mb-2">{loginError}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  className="input input-bordered w-full"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  className="input input-bordered w-full"
                />
                <button type="submit" 
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded shadow-md transition duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95">
                    Login</button>
              </form>
              {/* <div className="text-center mt-4">
                <span>Belum punya akun? </span>
                <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="px-4 py-1 rounded transition-all duration-200 bg-blue-500/20 text-blue-700 font-semibold hover:scale-105 hover:bg-blue-500/40 focus:outline-none " 
                >
                  Register
                </button>
              </div> */}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
              {regMessage && <div className={`alert ${regMessage.includes('success') ? 'alert-success' : 'alert-error'} mb-2`}>{regMessage}</div>}
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                  className="input input-bordered w-full"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  className="input input-bordered w-full"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  className="input input-bordered w-full"
                />
                <button type="submit" 
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded shadow-md transition duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                >
                    Register
                    </button>
              </form>
              <div className="text-center mt-4">
                <span>Sudah punya akun? </span>
                <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className="px-4 py-1 rounded transition-all duration-200 bg-blue-500/20 text-blue-700 font-semibold hover:scale-105 hover:bg-blue-500/40 focus:outline-none" 
                >
                  Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
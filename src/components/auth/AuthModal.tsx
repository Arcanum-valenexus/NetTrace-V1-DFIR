import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Smartphone,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { NetTraceLogo } from '../common/NetTraceLogo';

export const AuthModal: React.FC = () => {
  const { appFlowStage, setAppFlowStage, loginUser, registerUser, showToast } = useInvestigation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [rememberDevice, setRememberDevice] = useState<boolean>(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Predefined Mock Credentials for Development Mode
  const MOCK_CREDENTIALS = [
    { email: 'admin@nettrace.local', password: 'NetTrace@123' },
    { email: 'alex.mercer@nettrace.sec', password: 'NetTrace@2026' },
    { email: 'analyst@nettrace.io', password: 'NetTrace@2026' },
  ];

  // Validate Email Regex
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    let hasValidationError = false;

    // 1. Email is not empty
    if (!trimmedEmail) {
      setEmailError('Email is required.');
      setErrorMsg('Email address is required.');
      hasValidationError = true;
    } else if (!validateEmail(trimmedEmail)) {
      // 2. Email format is valid
      setEmailError('Invalid email format.');
      setErrorMsg('Invalid Email Address format. Please use a valid email (e.g. admin@nettrace.local).');
      hasValidationError = true;
    }

    // 3. Password is not empty
    if (!password) {
      setPasswordError('Password is required.');
      if (!hasValidationError) setErrorMsg('Password is required.');
      hasValidationError = true;
    } else if (password.length < 6) {
      // 4. Password minimum length
      setPasswordError('Password must be at least 6 characters.');
      if (!hasValidationError) setErrorMsg('Password must be at least 6 characters.');
      hasValidationError = true;
    }

    if (hasValidationError) return;

    setIsAuthenticating(true);

    // Simulate FastAPI + Supabase Authentication API Call
    setTimeout(() => {
      // Check registered accounts from localStorage
      let registeredUsers: Array<{ email: string; password?: string }> = [];
      try {
        const saved = localStorage.getItem('nettrace_registered_users');
        if (saved) registeredUsers = JSON.parse(saved);
      } catch {
        // ignore
      }

      const matchedMock = MOCK_CREDENTIALS.find(
        c => c.email.toLowerCase() === trimmedEmail.toLowerCase() && c.password === password
      );
      const matchedReg = registeredUsers.find(
        u => u.email.toLowerCase() === trimmedEmail.toLowerCase() && (!u.password || u.password === password)
      );

      const isValidUser = Boolean(matchedMock || matchedReg);

      if (!isValidUser) {
        setIsAuthenticating(false);
        setErrorMsg('Incorrect email or password. Authentication failed.');
        setEmailError('Invalid credentials');
        setPasswordError('Invalid credentials');
        return;
      }

      // Handle 2FA Verification Check (Triggered if email contains 2fa or when 2FA active)
      if (trimmedEmail.includes('2fa') && !requires2FA) {
        setIsAuthenticating(false);
        setRequires2FA(true);
        showToast('Two-Factor Authentication Required. Security code dispatched.', 'info');
        return;
      }

      if (requires2FA && twoFactorCode.length < 6) {
        setIsAuthenticating(false);
        setErrorMsg('Please enter a valid 6-digit 2FA / TOTP Security Code.');
        return;
      }

      // If Remember this device is enabled, establish persistent trusted device session metadata
      if (rememberDevice) {
        try {
          const deviceSession = {
            trustedDevice: true,
            userEmail: trimmedEmail,
            deviceId: `dev_${Math.random().toString(36).substring(2, 11)}`,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          localStorage.setItem('nettrace_trusted_device', JSON.stringify(deviceSession));
        } catch {
          // ignore storage access errors
        }
      } else {
        try {
          localStorage.removeItem('nettrace_trusted_device');
        } catch {
          // ignore
        }
      }

      setIsAuthenticating(false);
      showToast(
        `Login Successful! Authenticated as ${trimmedEmail}${rememberDevice ? ' (Trusted Device Saved)' : ''}`, 
        'success'
      );
      loginUser(trimmedEmail);
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');
    setPasswordError('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setEmailError('Invalid email format');
      setErrorMsg('Invalid Email Address format.');
      return;
    }
    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setErrorMsg('Password must be at least 8 characters with a number or symbol.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      try {
        const saved = localStorage.getItem('nettrace_registered_users');
        const existing = saved ? JSON.parse(saved) : [];
        existing.push({ email: email.trim(), password, name: fullName.trim() });
        localStorage.setItem('nettrace_registered_users', JSON.stringify(existing));
      } catch {
        // ignore
      }
      registerUser(fullName.trim(), email.trim());
      showToast('Account registered successfully. Welcome to NetTrace!', 'success');
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setResetSent(true);
      showToast('Password reset link & token dispatched to email.', 'info');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-sans">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setAppFlowStage('landing')}>
            <NetTraceLogo variant="horizontal" size={28} />
          </div>

          <button
            type="button"
            onClick={() => setAppFlowStage('landing')}
            className="text-xs font-sans text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing</span>
          </button>
        </div>

        {/* Centered Logo above form */}
        <div className="flex flex-col items-center justify-center pt-1">
          <div className="p-3 bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-xl shadow-cyan-950/60 mb-2">
            <NetTraceLogo variant="icon" size={56} />
          </div>
          <span className="text-[11px] font-heading font-extrabold text-slate-400 tracking-wider uppercase flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETTRACE SOC AUTHENTICATION</span>
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/90 border border-red-800/80 rounded-xl text-red-200 text-xs font-sans text-center flex items-center justify-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {appFlowStage === 'login' && (
          <div className="space-y-5">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold font-heading text-slate-100">
                Sign In to Command Center
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Enter your security credentials to access the Forensic Workbench
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
              {!requires2FA ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3 top-3 ${emailError ? 'text-red-400' : 'text-slate-500'}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                          if (emailError) setEmailError('');
                        }}
                        className={`w-full rounded-xl py-2.5 pl-10 pr-3 text-xs font-sans transition-all focus:outline-none ${
                          emailError 
                            ? 'bg-red-950/20 border border-red-500/80 text-red-100 placeholder-red-300/50 focus:border-red-400' 
                            : 'bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500'
                        }`}
                        placeholder="admin@nettrace.local"
                      />
                    </div>
                    {emailError && (
                      <p className="text-[11px] text-red-400 font-sans mt-1 animate-fadeIn flex items-center space-x-1">
                        <span>•</span>
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-sans">
                      <label className="block text-xs font-medium text-slate-300 font-sans">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setEmailError('');
                          setPasswordError('');
                          setAppFlowStage('forgot_password');
                        }}
                        className="text-[11px] font-sans text-cyan-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-3 top-3 ${passwordError ? 'text-red-400' : 'text-slate-500'}`} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMsg) setErrorMsg('');
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder="••••••••••••"
                        className={`w-full rounded-xl py-2.5 pl-10 pr-3 text-xs font-sans transition-all focus:outline-none ${
                          passwordError 
                            ? 'bg-red-950/20 border border-red-500/80 text-red-100 placeholder-red-300/50 focus:border-red-400' 
                            : 'bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500'
                        }`}
                      />
                    </div>
                    {passwordError && (
                      <p className="text-[11px] text-red-400 font-sans mt-1 animate-fadeIn flex items-center space-x-1">
                        <span>•</span>
                        <span>{passwordError}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Device & Security Policy Note */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer select-none group">
                      <button
                        type="button"
                        onClick={() => setRememberDevice(!rememberDevice)}
                        className="text-cyan-400 focus:outline-none cursor-pointer"
                        aria-label="Remember this device"
                      >
                        {rememberDevice ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 transition-colors" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        )}
                      </button>
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        Remember this device
                      </span>
                    </label>

                    <span className="text-[10px] text-slate-500 font-mono-code flex items-center space-x-1">
                      <KeyRound className="w-3 h-3 text-slate-500" />
                      <span>TLS 1.3</span>
                    </span>
                  </div>

                  {/* Development Mode Authorized Credentials Reference */}
                  <div className="p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl text-[11px] font-sans text-slate-400 space-y-1">
                    <div className="flex items-center justify-between text-slate-300 font-bold">
                      <span>Authorized Test Credentials</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50 font-mono-code">Dev Mode</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 font-mono-code text-[10.5px]">
                      <span>Email: <strong className="text-cyan-300 font-normal">admin@nettrace.local</strong></span>
                      <span>Pass: <strong className="text-cyan-300 font-normal">NetTrace@123</strong></span>
                    </div>
                  </div>
                </>
              ) : (
                /* 2FA Code Verification State */
                <div className="space-y-4 p-4 bg-slate-950 border border-cyan-900/60 rounded-2xl animate-fadeIn">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold font-mono-code">
                    <Smartphone className="w-4 h-4" />
                    <span>Two-Factor Authentication (2FA) Required</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Enter the 6-digit authentication code generated by your security app or sent to your email.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl py-3 px-4 text-center text-lg font-mono-code tracking-[0.5em] text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 underline block mx-auto cursor-pointer"
                  >
                    Back to email sign in
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all border border-cyan-400/30 font-sans cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO NETTRACE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Account Creation Footer */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 font-sans">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setAppFlowStage('register');
                  }}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {appFlowStage === 'register' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-100">
                Register NetTrace Profile
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Create your forensic investigator workspace
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    placeholder="Alex Mercer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Work / Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    placeholder="investigator@org.security"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all border border-cyan-400/30 font-sans cursor-pointer disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>CREATE ACCOUNT & LAUNCH</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-center text-slate-400 font-sans pt-2 border-t border-slate-800/80">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setAppFlowStage('login');
                }}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {appFlowStage === 'forgot_password' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-100">
                Reset NetTrace Password
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Enter your registered email to receive security recovery instructions
              </p>
            </div>

            {resetSent ? (
              <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-2xl space-y-3 text-center font-sans animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-sans text-emerald-200">
                  Password reset link sent to <strong>{email}</strong>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setResetSent(false);
                    setAppFlowStage('login');
                  }}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 font-sans cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      placeholder="analyst@organization.security"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all font-sans cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                      <span>DISPATCHING RECOVERY LINK...</span>
                    </>
                  ) : (
                    <span>Send Recovery Link</span>
                  )}
                </button>
              </form>
            )}

            <p className="text-xs text-center text-slate-400 font-sans pt-2 border-t border-slate-800/80">
              Back to{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setAppFlowStage('login');
                }}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

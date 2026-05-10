import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { authApi } from '../api/auth'
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react'

const STEPS = { EMAIL: 0, CODE: 1, RESET: 2, DONE: 3 }

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.EMAIL)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})

  // ─── Step 1: Request reset code ─────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!email) newErrors.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.info('If that email is registered, a reset code has been sent.')
      setStep(STEPS.CODE)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step 2: Verify code ────────────────────────────────────────────────────
  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!code) newErrors.code = 'Code required'
    else if (code.length !== 6) newErrors.code = 'Code must be 6 digits'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      await authApi.verifyResetCode(email, code)
      setStep(STEPS.RESET)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step 3: Set new password ───────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!newPassword) newErrors.newPassword = 'Password required'
    else if (newPassword.length < 8) newErrors.newPassword = 'Min 8 characters'
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      await authApi.resetPassword(email, code, newPassword)
      toast.success('Password reset successful!')
      setStep(STEPS.DONE)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step progress indicator ────────────────────────────────────────────────
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i <= step
              ? 'w-8 bg-primary'
              : 'w-2 bg-border'
          }`}
        />
      ))}
    </div>
  )

  return (
    <Card>
      <CardContent>
        <ProgressDots />

        {/* ── Step 1: Enter email ──────────────────────────────── */}
        {step === STEPS.EMAIL && (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Forgot your password?
              </h2>
              <p className="text-muted text-sm mt-1">
                Enter your email and we'll send you a reset code.
              </p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                id="forgot-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Button id="forgot-send" type="submit" isLoading={isLoading} className="w-full">
                Send Reset Code
              </Button>
            </form>
          </>
        )}

        {/* ── Step 2: Enter code ───────────────────────────────── */}
        {step === STEPS.CODE && (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Check your email</h2>
              <p className="text-muted text-sm mt-1">
                We sent a 6-digit code to <span className="text-white">{email}</span>
              </p>
            </div>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <Input
                id="forgot-code"
                label="Verification Code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                error={errors.code}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              <Button id="forgot-verify" type="submit" isLoading={isLoading} className="w-full">
                Verify Code
              </Button>
            </form>
            <button
              onClick={() => setStep(STEPS.EMAIL)}
              className="w-full mt-3 text-sm text-muted hover:text-white transition-colors text-center"
            >
              Didn't receive it? Go back
            </button>
          </>
        )}

        {/* ── Step 3: New password ─────────────────────────────── */}
        {step === STEPS.RESET && (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Set new password</h2>
              <p className="text-muted text-sm mt-1">
                Choose a strong password with at least 8 characters.
              </p>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Input
                id="forgot-new-password"
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
              />
              <Input
                id="forgot-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
              <Button id="forgot-reset" type="submit" isLoading={isLoading} className="w-full">
                Reset Password
              </Button>
            </form>
          </>
        )}

        {/* ── Step 4: Success ──────────────────────────────────── */}
        {step === STEPS.DONE && (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">All set!</h2>
            <p className="text-muted text-sm mb-6">
              Your password has been reset. You can now log in with your new password.
            </p>
            <Button id="forgot-go-login" onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </div>
        )}

        {/* Back to login link (on non-success steps) */}
        {step !== STEPS.DONE && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

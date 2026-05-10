import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { Lock, ShieldAlert, Clock } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(false)

  // Lockout / CAPTCHA state
  const [locked, setLocked] = useState(false)
  const [lockRemaining, setLockRemaining] = useState(0)
  const [requiresCaptcha, setRequiresCaptcha] = useState(false)
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  const validate = () => {
    const newErrors = {}
    if (!form.email) newErrors.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password required'
    else if (form.password.length < 8) newErrors.password = 'Min 8 characters'
    if (requiresCaptcha && !captchaAnswer) newErrors.captcha = 'Please solve the CAPTCHA'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const applyServerStatus = useCallback((data) => {
    if (data.locked) {
      setLocked(true)
      setLockRemaining(data.remaining || 0)
      setRequiresCaptcha(false)
    } else {
      setLocked(false)
      setLockRemaining(0)
      if (data.requiresCaptcha) {
        setRequiresCaptcha(true)
        setCaptchaQuestion(data.captchaQuestion || '')
        setCaptchaAnswer('')
      } else {
        setRequiresCaptcha(false)
      }
    }
    if (data.attemptsLeft !== undefined) {
      setAttemptsLeft(data.attemptsLeft)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await login(
        form.email,
        form.password,
        requiresCaptcha ? captchaAnswer : undefined,
        rememberMe,
      )
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      const data = error.response?.data
      if (data) {
        applyServerStatus(data)
        toast.error(data.error || 'Login failed')
      } else {
        toast.error('Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Format remaining seconds
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardContent>
        {/* Lockout banner */}
        {locked && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-danger font-semibold text-sm">Account temporarily locked</p>
              <p className="text-muted text-xs mt-1">
                Too many failed attempts. Try again in{' '}
                <span className="text-white font-medium">{formatTime(lockRemaining)}</span>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            disabled={locked}
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            disabled={locked}
          />

          {/* CAPTCHA challenge */}
          {requiresCaptcha && !locked && (
            <div className="p-4 rounded-xl bg-[#2A2A3E] border border-border space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">Security check</span>
              </div>
              <p className="text-white text-lg font-mono tracking-wider text-center py-2">
                {captchaQuestion}
              </p>
              <Input
                id="login-captcha"
                type="text"
                placeholder="Your answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                error={errors.captcha}
              />
            </div>
          )}

          {/* Attempts warning */}
          {!locked && attemptsLeft < 5 && attemptsLeft > 0 && (
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Lock className="w-3.5 h-3.5" />
              <span>{attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted cursor-pointer select-none">
              <input
                id="login-remember-me"
                type="checkbox"
                className="rounded border-border accent-[#A78BFA] w-4 h-4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            id="login-submit"
            type="submit"
            isLoading={isLoading}
            disabled={locked}
            className="w-full"
          >
            Login
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

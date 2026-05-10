import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    country: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!form.firstName) newErrors.firstName = 'First name required'
    if (!form.lastName) newErrors.lastName = 'Last name required'
    if (!form.email) newErrors.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password required'
    else if (form.password.length < 8) newErrors.password = 'Min 8 characters'
    else if (!/(?=.*[A-Z])/.test(form.password)) newErrors.password = 'Need uppercase'
    else if (!/(?=.*[0-9])/.test(form.password)) newErrors.password = 'Need number'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const updateForm = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={updateForm('firstName')}
              error={errors.firstName}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={updateForm('lastName')}
              error={errors.lastName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={updateForm('email')}
              error={errors.email}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={updateForm('phone')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City (optional)"
              value={form.city}
              onChange={updateForm('city')}
            />
            <Input
              label="Country (optional)"
              value={form.country}
              onChange={updateForm('country')}
            />
          </div>

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={updateForm('password')}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={updateForm('confirmPassword')}
            error={errors.confirmPassword}
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

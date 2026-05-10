import { useState } from 'react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users'

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data } = await usersApi.updateProfile(user.id, form)
      updateUser(data)
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="text-center py-8">
        <Avatar
          src={user?.avatarUrl}
          name={`${user?.firstName} ${user?.lastName}`}
          size="xl"
          className="mx-auto mb-4"
        />
        <h1 className="font-display text-2xl font-bold text-white">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-muted">{user?.email}</p>
        {user?.city && user?.country && (
          <p className="text-muted text-sm mt-1">{user.city}, {user.country}</p>
        )}
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant={user?.role === 'admin' ? 'secondary' : 'primary'}>
            {user?.role}
          </Badge>
        </div>
      </Card>

      {/* Edit Profile */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Profile Information</CardTitle>
          {!isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Name</span>
                <span className="text-white">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Email</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Phone</span>
                <span className="text-white">{user?.phone || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted">Location</span>
                <span className="text-white">
                  {user?.city && user?.country ? `${user.city}, ${user.country}` : '-'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">Bio</span>
                <span className="text-white text-right max-w-xs">{user?.bio || '-'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardTitle className="mb-4">Account</CardTitle>
        <CardContent className="space-y-3">
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-danger">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

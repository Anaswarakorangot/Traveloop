import { useState, useEffect, useRef } from 'react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users'
import { Camera, MapPin, Trash2, Shield, Eye, EyeOff, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState(null)
  const [savedDests, setSavedDests] = useState([])
  const [activeTab, setActiveTab] = useState('info')
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', city: user?.city || '', country: user?.country || '', bio: user?.bio || '',
  })

  useEffect(() => {
    if (user?.id) {
      usersApi.getStats(user.id).then(r => setStats(r.data)).catch(() => {})
      usersApi.getSavedDestinations(user.id).then(r => setSavedDests(r.data)).catch(() => {})
    }
  }, [user?.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data } = await usersApi.updateProfile(user.id, form)
      updateUser(data); setIsEditing(false)
      toast.success('Profile updated')
    } catch { toast.error('Failed to update profile') }
    finally { setIsSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const { data } = await usersApi.uploadAvatar(user.id, ev.target.result)
        updateUser({ avatarUrl: data.avatarUrl })
        toast.success('Avatar updated')
      } catch { toast.error('Upload failed') }
    }
    reader.readAsDataURL(file)
  }

  const togglePrivacy = async () => {
    try {
      const { data } = await usersApi.updatePrivacy(user.id, !user.isPublicProfile)
      updateUser({ isPublicProfile: data.isPublicProfile })
      toast.success(data.isPublicProfile ? 'Profile is now public' : 'Profile is now private')
    } catch { toast.error('Failed to update') }
  }

  const removeSaved = async (cityId) => {
    try {
      await usersApi.unsaveDestination(user.id, cityId)
      setSavedDests(savedDests.filter(c => c.id !== cityId))
      toast.success('Removed')
    } catch { toast.error('Failed to remove') }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="text-center py-8">
        <div className="relative inline-block mb-4">
          <Avatar src={user?.avatarUrl} name={`${user?.firstName} ${user?.lastName}`} size="xl" className="mx-auto" />
          <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white hover:bg-primary-light transition-colors shadow-lg">
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
        <p className="text-muted">{user?.email}</p>
        {user?.city && user?.country && <p className="text-muted text-sm mt-1 flex items-center justify-center gap-1"><MapPin size={12} /> {user.city}, {user.country}</p>}
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant={user?.role === 'admin' ? 'secondary' : 'primary'}>{user?.role}</Badge>
          <Badge variant={user?.isPublicProfile ? 'default' : 'secondary'}>
            {user?.isPublicProfile ? '🌐 Public' : '🔒 Private'}
          </Badge>
        </div>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="text-center py-3">
            <p className="text-xl font-bold text-white">{stats.tripCount}</p>
            <p className="text-xs text-muted">Trips</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-xl font-bold text-white">{stats.countriesVisited}</p>
            <p className="text-xs text-muted">Countries</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-xl font-bold text-white">{stats.postCount}</p>
            <p className="text-xs text-muted">Posts</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-xl font-bold text-white">{stats.savedCount}</p>
            <p className="text-xs text-muted">Saved</p>
          </Card>
        </div>
      )}

      {/* Badges */}
      {stats?.badges?.length > 0 && (
        <Card>
          <CardTitle className="mb-3">Badges</CardTitle>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map(b => (
              <div key={b.name} className="flex items-center gap-2 px-3 py-2 bg-dark rounded-lg" title={b.description}>
                <span className="text-xl">{b.icon}</span>
                <span className="text-sm text-white">{b.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {['info', 'saved', 'settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg capitalize transition-colors ${activeTab === tab ? 'bg-surface text-white' : 'text-muted hover:text-white'}`}>
            {tab === 'info' ? 'Profile' : tab === 'saved' ? 'Saved Places' : 'Settings'}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'info' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing && <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>}
          </div>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[['Name', `${user?.firstName} ${user?.lastName}`], ['Email', user?.email], ['Phone', user?.phone || '-'], ['Location', user?.city && user?.country ? `${user.city}, ${user.country}` : '-'], ['Bio', user?.bio || '-']].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted">{k}</span>
                    <span className="text-white text-right max-w-xs">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Saved Destinations Tab */}
      {activeTab === 'saved' && (
        <Card>
          <CardTitle className="mb-4">Saved Destinations</CardTitle>
          <CardContent>
            {savedDests.length === 0 ? (
              <p className="text-muted text-center py-6">No saved destinations yet. Explore cities and save your favorites!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {savedDests.map(city => (
                  <div key={city.id} className="flex items-center gap-3 p-3 bg-dark rounded-lg group">
                    <img src={city.imageUrl} alt={city.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{city.name}</p>
                      <p className="text-xs text-muted">{city.country}</p>
                    </div>
                    <button onClick={() => removeSaved(city.id)} className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardTitle className="mb-4">Account Settings</CardTitle>
          <CardContent className="space-y-3">
            <button onClick={togglePrivacy} className="w-full flex items-center justify-between p-3 bg-dark rounded-lg hover:bg-surface transition-colors">
              <div className="flex items-center gap-3">
                {user?.isPublicProfile ? <Eye size={18} className="text-primary" /> : <EyeOff size={18} className="text-muted" />}
                <div className="text-left">
                  <p className="text-white text-sm">Profile Visibility</p>
                  <p className="text-xs text-muted">{user?.isPublicProfile ? 'Public — anyone can see your profile' : 'Private — only you can see your profile'}</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors ${user?.isPublicProfile ? 'bg-primary' : 'bg-border'}`}>
                <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${user?.isPublicProfile ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-left text-danger hover:bg-dark rounded-lg transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

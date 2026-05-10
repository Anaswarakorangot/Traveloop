import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { tripsApi } from '../api/trips'
import { useTripStore } from '../store/tripStore'
import { format, formatDistanceToNow } from 'date-fns'

export default function Notes() {
  const { id } = useParams()
  const { currentTrip, fetchTrip } = useTripStore()
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', noteDate: '' })

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getNotes(id)
      setNotes(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  const saveNote = async () => {
    if (!form.content.trim()) {
      toast.error('Content required')
      return
    }

    try {
      if (editingId) {
        const { data } = await tripsApi.updateNote(id, editingId, form)
        setNotes(notes.map(n => n.id === editingId ? data : n))
        toast.success('Note updated')
      } else {
        const { data } = await tripsApi.addNote(id, form)
        setNotes([data, ...notes])
        toast.success('Note added')
      }
      resetForm()
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const deleteNote = async (noteId) => {
    try {
      await tripsApi.deleteNote(id, noteId)
      setNotes(notes.filter(n => n.id !== noteId))
      toast.success('Note deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const editNote = (note) => {
    setEditingId(note.id)
    setForm({
      title: note.title || '',
      content: note.content,
      noteDate: note.noteDate ? format(new Date(note.noteDate), 'yyyy-MM-dd') : ''
    })
    setShowNew(true)
  }

  const resetForm = () => {
    setShowNew(false)
    setEditingId(null)
    setForm({ title: '', content: '', noteDate: '' })
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="h-32 bg-surface rounded" />
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Trip Notes</h1>
          <p className="text-muted">{currentTrip?.title}</p>
        </div>
        {!showNew && (
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus size={16} /> Add Note
          </Button>
        )}
      </div>

      {/* New/Edit Note Form */}
      {showNew && (
        <Card>
          <CardContent className="space-y-4">
            <Input
              label="Title (optional)"
              placeholder="Note title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Write your note..."
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <Input
              label="Date (optional)"
              type="date"
              value={form.noteDate}
              onChange={(e) => setForm({ ...form, noteDate: e.target.value })}
            />
            <div className="flex gap-3">
              <Button onClick={saveNote} className="gap-2">
                <Save size={16} /> {editingId ? 'Update' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted mb-4">No notes yet</p>
          <Button onClick={() => setShowNew(true)}>Add your first note</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {note.title && (
                    <h3 className="font-semibold text-white mb-1">{note.title}</h3>
                  )}
                  <p className="text-white whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                    {note.noteDate && (
                      <span>{format(new Date(note.noteDate), 'MMM d, yyyy')}</span>
                    )}
                    <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                    {note.stop && (
                      <span className="text-primary">{note.stop.city?.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => editNote(note)}
                    className="p-1.5 text-muted hover:text-white rounded hover:bg-dark"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 text-muted hover:text-danger rounded hover:bg-dark"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

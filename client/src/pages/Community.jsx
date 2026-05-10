import { useEffect, useState, useCallback, useRef } from 'react'
import { Heart, MessageCircle, Share2, Send, Search, X } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Avatar } from '../components/common/Avatar'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { CardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { communityApi } from '../api/community'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'

export default function Community() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [newPost, setNewPost] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [commentInputs, setCommentInputs] = useState({})
  const [postComments, setPostComments] = useState({})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef(null)

  const fetchPosts = async (reset = false) => {
    const offset = reset ? 0 : page * 20
    if (reset) { setIsLoading(true); setPage(0) }
    else setIsLoadingMore(true)
    try {
      const { data } = await communityApi.getPosts({ sort, limit: 20, offset })
      if (reset) setPosts(data)
      else setPosts(prev => [...prev, ...data])
      setHasMore(data.length === 20)
    } catch { console.error('Failed to fetch posts') }
    finally { setIsLoading(false); setIsLoadingMore(false) }
  }

  useEffect(() => { fetchPosts(true) }, [sort])

  // Infinite scroll
  const lastPostRef = useCallback(node => {
    if (isLoadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1)
      }
    })
    if (node) observerRef.current.observe(node)
  }, [isLoadingMore, hasMore])

  useEffect(() => {
    if (page > 0) fetchPosts(false)
  }, [page])

  const handlePost = async () => {
    if (!newPost.trim()) return
    setIsPosting(true)
    try {
      const { data } = await communityApi.createPost({ content: newPost })
      setPosts([data, ...posts])
      setNewPost('')
      toast.success('Posted!')
    } catch (error) { toast.error(error.response?.data?.error || 'Failed to post') }
    finally { setIsPosting(false) }
  }

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) await communityApi.unlikePost(postId)
      else await communityApi.likePost(postId)
      setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !isLiked, likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p))
    } catch { toast.error('Failed to update like') }
  }

  const toggleComments = async (postId) => {
    const next = new Set(expandedComments)
    if (next.has(postId)) { next.delete(postId) }
    else {
      next.add(postId)
      if (!postComments[postId]) {
        try {
          const { data } = await communityApi.getComments(postId)
          setPostComments(prev => ({ ...prev, [postId]: data }))
        } catch { }
      }
    }
    setExpandedComments(next)
  }

  const addComment = async (postId) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    try {
      const { data } = await communityApi.addComment(postId, content)
      setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
      setPosts(posts.map(p => p.id === postId ? { ...p, _count: { ...p._count, comments: (p._count?.comments || 0) + 1 } } : p))
    } catch { toast.error('Failed to comment') }
  }

  const sharePost = async (post) => {
    const url = `${window.location.origin}/community?post=${post.id}`
    try {
      if (navigator.share) await navigator.share({ title: 'Traveloop Post', text: post.content.slice(0, 100), url })
      else { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
    } catch {}
  }

  const filteredPosts = search
    ? posts.filter(p => p.content.toLowerCase().includes(search.toLowerCase()) || p.tags?.some(t => t.includes(search.toLowerCase())))
    : posts

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Community</h1>

      {/* Create Post */}
      <Card>
        <div className="flex gap-3">
          <Avatar src={user?.avatarUrl} name={`${user?.firstName} ${user?.lastName}`} size="md" />
          <div className="flex-1">
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your travel experience..."
              rows={3} className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            <div className="flex justify-end mt-2">
              <Button onClick={handlePost} isLoading={isPosting} disabled={!newPost.trim()} className="gap-2">
                <Send size={16} /> Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface border border-border rounded-full text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X size={14} /></button>}
        </div>
        <div className="flex gap-1">
          {['recent', 'trending'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${sort === s ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
      ) : filteredPosts.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted">{search ? 'No matching posts' : 'No posts yet. Be the first!'}</p></Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, i) => (
            <Card key={post.id} ref={i === filteredPosts.length - 1 ? lastPostRef : undefined}>
              <div className="flex gap-3">
                <Avatar src={post.user?.avatarUrl} name={`${post.user?.firstName} ${post.user?.lastName}`} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{post.user?.firstName} {post.user?.lastName}</span>
                    <span className="text-xs text-muted">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </div>
                  <p className="text-white mt-2 whitespace-pre-wrap">{post.content}</p>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map(t => <span key={t} className="text-xs text-primary">#{t}</span>)}
                    </div>
                  )}
                  {post.trip && (
                    <div className="mt-3 p-3 bg-dark rounded-lg">
                      <p className="text-sm text-muted">Trip</p>
                      <p className="text-white font-medium">{post.trip.title}</p>
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => handleLike(post.id, post.isLiked)}
                      className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-danger' : 'text-muted hover:text-danger'} transition-colors`}>
                      <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} /> {post.likesCount}
                    </button>
                    <button onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1 text-sm ${expandedComments.has(post.id) ? 'text-primary' : 'text-muted hover:text-white'} transition-colors`}>
                      <MessageCircle size={18} /> {post._count?.comments || 0}
                    </button>
                    <button onClick={() => sharePost(post)} className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors">
                      <Share2 size={18} />
                    </button>
                  </div>

                  {/* Inline Comments */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {(postComments[post.id] || []).map(c => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar src={c.user?.avatarUrl} name={`${c.user?.firstName} ${c.user?.lastName}`} size="sm" />
                          <div>
                            <span className="text-sm font-medium text-white">{c.user?.firstName}</span>
                            <p className="text-sm text-muted">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                          placeholder="Write a comment..." className="flex-1 px-3 py-1.5 bg-dark border border-border rounded-lg text-sm text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary" />
                        <button onClick={() => addComment(post.id)} className="text-primary hover:text-primary-light"><Send size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {isLoadingMore && <div className="text-center py-4"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>}
        </div>
      )}
    </div>
  )
}

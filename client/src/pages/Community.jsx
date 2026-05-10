import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Share2, Send } from 'lucide-react'
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
  const [newPost, setNewPost] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const fetchPosts = async () => {
    try {
      const { data } = await communityApi.getPosts({ sort, limit: 20 })
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [sort])

  const handlePost = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    try {
      const { data } = await communityApi.createPost({ content: newPost })
      setPosts([data, ...posts])
      setNewPost('')
      toast.success('Posted!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post')
    } finally {
      setIsPosting(false)
    }
  }

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await communityApi.unlikePost(postId)
      } else {
        await communityApi.likePost(postId)
      }
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !isLiked,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1
          }
        }
        return p
      }))
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Community</h1>

      {/* Create Post */}
      <Card>
        <div className="flex gap-3">
          <Avatar
            src={user?.avatarUrl}
            name={`${user?.firstName} ${user?.lastName}`}
            size="md"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your travel experience..."
              rows={3}
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handlePost}
                isLoading={isPosting}
                disabled={!newPost.trim()}
                className="gap-2"
              >
                <Send size={16} /> Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sort */}
      <div className="flex gap-2">
        {['recent', 'trending'].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
              sort === s
                ? 'bg-primary text-white'
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted">No posts yet. Be the first to share!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex gap-3">
                <Avatar
                  src={post.user?.avatarUrl}
                  name={`${post.user?.firstName} ${post.user?.lastName}`}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {post.user?.firstName} {post.user?.lastName}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-white mt-2 whitespace-pre-wrap">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="mt-3 rounded-lg max-h-80 object-cover"
                    />
                  )}

                  {post.trip && (
                    <div className="mt-3 p-3 bg-dark rounded-lg">
                      <p className="text-sm text-muted">Trip</p>
                      <p className="text-white font-medium">{post.trip.title}</p>
                      <div className="flex gap-1 mt-1">
                        {post.trip.stops?.map(stop => (
                          <Badge key={stop.id} variant="default">{stop.city?.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleLike(post.id, post.isLiked)}
                      className={`flex items-center gap-1 text-sm ${
                        post.isLiked ? 'text-danger' : 'text-muted hover:text-danger'
                      } transition-colors`}
                    >
                      <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
                      {post.likesCount}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors">
                      <MessageCircle size={18} />
                      {post._count?.comments || 0}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

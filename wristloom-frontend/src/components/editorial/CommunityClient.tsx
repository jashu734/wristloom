'use client';

import * as React from 'react';
import { MOCK_COMMUNITY_POSTS } from '@/lib/mock-data';
import { COMMUNITY_CATEGORIES } from '@/lib/constants';
import { MessageCircle, Heart, Plus, X, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

type Post = (typeof MOCK_COMMUNITY_POSTS)[0];

export function CommunityClient() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [posts, setPosts] = React.useState<Post[]>(MOCK_COMMUNITY_POSTS);
  const [likedPosts, setLikedPosts] = React.useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // New post form state
  const [newPost, setNewPost] = React.useState({
    title: '',
    category: 'story',
    watch_brands: '',
    image_url: '',
    author_name: '',
  });

  const filteredPosts = React.useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setPosts((currentPosts) =>
        currentPosts.map((p) =>
          p.id === postId
            ? { ...p, likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1) }
            : p
        )
      );
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim()) return;

    const created: Post = {
      id: `post-${Date.now()}`,
      title: newPost.title,
      body: newPost.title,
      category: newPost.category as Post['category'],
      author_id: 'user_community',
      author_name: newPost.author_name.trim() || 'Collector',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      created_at: new Date().toISOString(),
      likes: 1,
      comment_count: 0,
      image_urls: newPost.image_url.trim()
        ? [newPost.image_url.trim()]
        : ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'],
      watch_brands: newPost.watch_brands
        ? newPost.watch_brands.split(',').map((s) => s.trim())
        : ['Rolex'],
      featured: false,
    };

    setPosts([created, ...posts]);
    setIsModalOpen(false);
    setNewPost({
      title: '',
      category: 'story',
      watch_brands: '',
      image_url: '',
      author_name: '',
    });
  };

  return (
    <div className="container-wl py-12">
      {/* Category filter + Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', label: 'All' }, ...COMMUNITY_CATEGORIES].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border rounded-[2px] transition-colors ${
                selectedCategory === cat.id
                  ? 'border-[#B08D57] bg-[rgba(176,141,87,0.12)] text-[#B08D57]'
                  : 'border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.50)] hover:border-[rgba(176,141,87,0.40)] hover:text-[#EDE6D6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Create Post
        </Button>
      </div>

      {/* Featured posts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {post.image_urls?.[0] && (
                <div className="aspect-[16/9] overflow-hidden bg-[#14110F]">
                  <img
                    src={post.image_urls[0]}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5">
                <span className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] mb-2 block">
                  {COMMUNITY_CATEGORIES.find((c) => c.id === post.category)?.label ?? post.category}
                </span>
                <h2 className="font-display text-base text-[#EDE6D6] mb-2 leading-snug group-hover:text-[#B08D57] transition-colors">
                  {post.title}
                </h2>
                {post.watch_brands && (
                  <p className="text-xs text-[rgba(237,230,214,0.40)] mb-3">
                    {post.watch_brands.join(' · ')}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(176,141,87,0.08)]">
                <div className="flex items-center gap-3 text-[rgba(237,230,214,0.35)]">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1 text-xs transition-colors hover:text-[#B08D57] ${
                      likedPosts[post.id] ? 'text-rose-400' : ''
                    }`}
                    aria-label="Like post"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        likedPosts[post.id] ? 'fill-rose-400 text-rose-400' : ''
                      }`}
                    />{' '}
                    {post.likes}
                  </button>
                  <span className="flex items-center gap-1 text-xs">
                    <MessageCircle className="w-3 h-3" aria-hidden /> {post.comment_count}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {post.author_avatar && (
                    <img
                      src={post.author_avatar}
                      alt={post.author_name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span className="font-mono text-[10px] tracking-wider text-[rgba(237,230,214,0.40)]">
                    {post.author_name}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16 text-[rgba(237,230,214,0.4)] font-mono text-sm">
          No posts found in this category. Be the first to share a story!
        </div>
      )}

      {/* CTA to post */}
      <div className="mt-12 text-center bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-8">
        <h2 className="font-display text-2xl text-[#EDE6D6] mb-3">Share Your Story</h2>
        <p className="text-sm text-[rgba(237,230,214,0.55)] max-w-md mx-auto mb-6">
          The community is built by collectors, for collectors. Share your collection, restoration journey, or a watch that changed how you think about horology.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="font-mono text-[11px] tracking-widest uppercase px-6 py-3 border border-[rgba(176,141,87,0.30)] text-[#B08D57] hover:bg-[rgba(176,141,87,0.08)] rounded-[2px] transition-colors cursor-pointer"
        >
          Create a Post
        </button>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.25)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#1E1A17]">
              <span className="font-display text-base text-[#EDE6D6]">Share With The Community</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My grandfather's 1968 Omega Seamaster restoration"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  >
                    {COMMUNITY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#14110F]">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Collector Handle"
                    value={newPost.author_name}
                    onChange={(e) => setNewPost({ ...newPost, author_name: e.target.value })}
                    className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                  Watch Brands (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rolex, Omega, Patek Philippe"
                  value={newPost.watch_brands}
                  onChange={(e) => setNewPost({ ...newPost, watch_brands: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-1.5">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                  className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.25)] rounded px-3 py-2 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Publish Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

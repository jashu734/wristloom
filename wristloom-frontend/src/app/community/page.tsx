import type { Metadata } from 'next';
import { SiteWrapper } from '@/components/layout/SiteWrapper';
import { MOCK_COMMUNITY_POSTS } from '@/lib/mock-data';
import { COMMUNITY_CATEGORIES } from '@/lib/constants';
import { MessageCircle, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Collector Community',
  description: 'Stories, collections, discussions, and watch photography from the Wristloom collector community.',
};

export default function CommunityPage() {
  const featured = MOCK_COMMUNITY_POSTS.filter((p) => p.featured);
  return (
    <SiteWrapper>
      <div className="min-h-screen bg-[#14110F]">
        <div className="bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)]">
          <div className="container-wl py-16">
            <span className="text-overline block mb-3">The Collector House</span>
            <h1 className="font-display text-4xl md:text-5xl text-[#EDE6D6] tracking-tight mb-4">
              Collector Community
            </h1>
            <p className="text-[rgba(237,230,214,0.60)] max-w-xl leading-relaxed">
              Stories, collections, discussions, and photography from serious collectors. The community is built on craft, not speculation.
            </p>
          </div>
        </div>

        <div className="container-wl py-12">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[{ id: 'all', label: 'All' }, ...COMMUNITY_CATEGORIES].map((cat) => (
              <button
                key={cat.id}
                className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border rounded-[2px] transition-colors border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.50)] hover:border-[rgba(176,141,87,0.40)] hover:text-[#EDE6D6]"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Featured posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_COMMUNITY_POSTS.map((post) => (
              <article key={post.id} className="group bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] hover:border-[rgba(176,141,87,0.25)] rounded-[2px] overflow-hidden transition-all duration-300 cursor-pointer">
                {post.image_urls?.[0] && (
                  <div className="aspect-[16/9] overflow-hidden">
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
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(176,141,87,0.08)]">
                    <div className="flex items-center gap-3 text-[rgba(237,230,214,0.35)]">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3" aria-hidden /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-3 h-3" aria-hidden /> {post.comment_count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.author_avatar && (
                        <img src={post.author_avatar} alt={post.author_name} className="w-5 h-5 rounded-full object-cover" />
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

          {/* CTA to post */}
          <div className="mt-12 text-center bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-8">
            <h2 className="font-display text-2xl text-[#EDE6D6] mb-3">Share Your Story</h2>
            <p className="text-sm text-[rgba(237,230,214,0.55)] max-w-md mx-auto mb-6">
              The community is built by collectors, for collectors. Share your collection, restoration journey, or a watch that changed how you think about horology.
            </p>
            <button className="font-mono text-[11px] tracking-widest uppercase px-6 py-3 border border-[rgba(176,141,87,0.30)] text-[#B08D57] hover:bg-[rgba(176,141,87,0.08)] rounded-[2px] transition-colors">
              Create a Post
            </button>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
}

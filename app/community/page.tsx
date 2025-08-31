"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

interface CommunityPost {
  id: number;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  topic: string;
  likes: number;
  comments: number;
  time: string;
  isLiked: boolean;
}

const CommunityPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      user: {
        name: 'Alex Johnson',
        avatar: '/avatars/1.png',
        role: 'Frontend Developer'
      },
      content: 'Just had an interview at Google and they asked me to implement a debounce function from scratch. Here\'s my solution - would love feedback!',
      topic: 'Technical Interview',
      likes: 24,
      comments: 8,
      time: '2 hours ago',
      isLiked: false
    },
    {
      id: 2,
      user: {
        name: 'Sarah Chen',
        avatar: '/avatars/2.png',
        role: 'Data Scientist'
      },
      content: 'Sharing my study notes for machine learning interviews. Covers all the important algorithms and sample questions I\'ve encountered.',
      topic: 'Study Resources',
      likes: 42,
      comments: 12,
      time: '5 hours ago',
      isLiked: true
    },
    {
      id: 3,
      user: {
        name: 'Marcus Rivera',
        avatar: '/avatars/3.png',
        role: 'Backend Engineer'
      },
      content: 'What are some good system design questions you\'ve been asked recently? Preparing for my Amazon interview next week.',
      topic: 'System Design',
      likes: 18,
      comments: 15,
      time: '1 day ago',
      isLiked: false
    },
    {
      id: 4,
      user: {
        name: 'Priya Sharma',
        avatar: '/avatars/4.png',
        role: 'Product Manager'
      },
      content: 'Just created a comprehensive list of behavioral questions for PM interviews. Happy to share if anyone needs it!',
      topic: 'Behavioral Interview',
      likes: 37,
      comments: 6,
      time: '1 day ago',
      isLiked: false
    },
    {
      id: 5,
      user: {
        name: 'David Kim',
        avatar: '/avatars/5.png',
        role: 'UX Designer'
      },
      content: 'How do you typically approach whiteboard design challenges? I struggle with organizing my thoughts under pressure.',
      topic: 'Design Challenge',
      likes: 29,
      comments: 11,
      time: '2 days ago',
      isLiked: false
    },
    {
      id: 6,
      user: {
        name: 'Emily Watson',
        avatar: '/avatars/6.png',
        role: 'Software Engineer'
      },
      content: 'Has anyone gone through the Netflix interview process recently? Would love to hear about the experience and preparation tips.',
      topic: 'Interview Experience',
      likes: 31,
      comments: 7,
      time: '3 days ago',
      isLiked: true
    }
  ]);

  const filters = [
    { id: 'all', label: 'All Topics' },
    { id: 'technical', label: 'Technical Interview' },
    { id: 'behavioral', label: 'Behavioral Interview' },
    { id: 'system', label: 'System Design' },
    { id: 'resources', label: 'Study Resources' },
    { id: 'experience', label: 'Interview Experience' }
  ];

  const handleLike = (id: number) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-16">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 md:py-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="circuit-pattern" x="0" y="0" width="0.05" height="0.05">
              <path d="M0,0 L10,10" stroke="white" strokeWidth="0.5" />
              <path d="M10,0 L0,10" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#circuit-pattern)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Intervue Community</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Connect with peers, share experiences, and get advice on acing your interviews.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold shadow-lg">
              Join the Discussion
            </Button>
          </div>
        </div>
        
        <div className="absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-6xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className="text-2xl font-bold text-blue-600">1.2K+</div>
              <div className="text-sm text-slate-500 mt-1">Community Members</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className="text-2xl font-bold text-indigo-600">458</div>
              <div className="text-sm text-slate-500 mt-1">Active Discussions</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className="text-2xl font-bold text-blue-600">92</div>
              <div className="text-sm text-slate-500 mt-1">Interview Tips</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className="text-2xl font-bold text-indigo-600">64</div>
              <div className="text-sm text-slate-500 mt-1">Resources Shared</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Create Post Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                YS
              </div>
              <input 
                type="text" 
                placeholder="Share your interview experience or ask a question..."
                className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attachment
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Emoji
                </button>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg px-5">
                Post
              </Button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                      {post.user.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{post.user.name}</h3>
                        <p className="text-sm text-slate-500">{post.user.role}</p>
                      </div>
                      <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {post.topic}
                      </span>
                    </div>
                    <p className="mt-3 text-slate-700">{post.content}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
                        >
                          {post.isLiked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 text-slate-500 hover:text-blue-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comments} comments
                        </button>
                        <button className="flex items-center gap-1 text-slate-500 hover:text-blue-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </button>
                      </div>
                      <span className="text-xs text-slate-400">{post.time}</span>
                    </div>
                  </div>
                </div>

                {/* Comment input */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0"></div>
                  <input 
                    type="text" 
                    placeholder="Write a comment..."
                    className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-10">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-6">
              Load More Posts
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl p-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default CommunityPage;
'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getUserProfile } from '@/lib/mock-data';
import { getSportEmoji } from '@/lib/sports-config';
import { t, Language } from '@/lib/i18n';

interface UserProfilePageProps {
  userId: string;
}

type FriendStatus = 'none' | 'pending-sent' | 'pending-received' | 'accepted';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  location?: string;
  isOnline?: boolean;
}

export default function UserProfilePage({ userId }: UserProfilePageProps) {
  const { closeSubPage, setSubPage, showToast, language, sendFriendRequest, acceptFriend, declineFriend, removeFriend, getFriendStatus, getFriendList } = useStore();
  const [profile, setProfile] = useState<any | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currentLang = language as Language;

  useEffect(() => {
    const loadProfile = async () => {
      const userProfile = getUserProfile(userId);
      setProfile(userProfile);

      if (userProfile) {
        const status = getFriendStatus(userId);
        setFriendStatus(status as FriendStatus);

        const friendIds = getFriendList();
        const friendObjects: Friend[] = friendIds
          .map(id => {
            const p = getUserProfile(id);
            if (!p) return null;
            return { id, name: p.name, avatar: p.avatar, location: p.location || undefined, isOnline: false } as Friend;
          })
          .filter((f): f is Friend => f !== null);
        setFriends(friendObjects);
      }

      setLoading(false);
    };

    loadProfile();
  }, [userId, getFriendStatus, getFriendList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-gray-400">{t('common.loading', currentLang)}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto flex flex-col items-center justify-center gap-5 px-4">
        <p className="text-gray-400">{t('userProfile.notFound', currentLang)}</p>
        <button
          onClick={() => closeSubPage()}
          className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
        >
          {t('common.back', currentLang)}
        </button>
      </div>
    );
  }

  const handleSendMessage = () => {
    showToast(t('userProfile.sendMessage', currentLang));
    setSubPage({
      type: 'conversation',
      conversationId: `conv-${userId.split('-')[0]}`,
    });
  };

  const handleSendFriendRequest = async () => {
    setActionLoading(true);
    sendFriendRequest(userId);
    showToast(t('friends.requestSent', currentLang));
    const status = getFriendStatus(userId);
    setFriendStatus(status as FriendStatus);
    setActionLoading(false);
  };

  const handleAcceptFriend = async () => {
    setActionLoading(true);
    acceptFriend(userId);
    showToast(t('friends.requestAccepted', currentLang));
    const status = getFriendStatus(userId);
    setFriendStatus(status as FriendStatus);
    setActionLoading(false);
  };

  const handleDeclineFriend = async () => {
    setActionLoading(true);
    declineFriend(userId);
    showToast(t('friends.requestDeclined', currentLang));
    const status = getFriendStatus(userId);
    setFriendStatus(status as FriendStatus);
    setActionLoading(false);
  };

  const handleRemoveFriend = async () => {
    setActionLoading(true);
    removeFriend(userId);
    showToast(t('friends.removed', currentLang));
    const status = getFriendStatus(userId);
    setFriendStatus(status as FriendStatus);
    setActionLoading(false);
  };

  const renderFriendButton = () => {
    const baseButtonStyle = {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500' as const,
      transition: 'all 0.2s',
      minWidth: '120px',
    };

    switch (friendStatus) {
      case 'none':
        return (
          <button
            onClick={handleSendFriendRequest}
            disabled={actionLoading}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60 text-sm"
          >
            {t('userProfile.addFriend', currentLang)}
          </button>
        );

      case 'pending-sent':
        return (
          <button
            disabled
            className="w-full py-3 bg-[#4b5563] text-[#a0aac4] rounded-lg cursor-default font-medium text-sm"
          >
            {t('userProfile.friendRequestSent', currentLang)}
          </button>
        );

      case 'pending-received':
        return (
          <div className="flex gap-3">
            <button
              onClick={handleAcceptFriend}
              disabled={actionLoading}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60 text-sm"
            >
              {t('userProfile.acceptFriend', currentLang)}
            </button>
            <button
              onClick={handleDeclineFriend}
              disabled={actionLoading}
              className="flex-1 py-3 bg-[#4b5563] text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60 text-sm"
            >
              {t('userProfile.declineFriend', currentLang)}
            </button>
          </div>
        );

      case 'accepted':
        return (
          <div className="flex gap-3">
            <div className="flex-1 py-3 bg-[var(--accent)] text-white rounded-lg font-medium text-center flex items-center justify-center text-sm">
              Amis ✓
            </div>
            <button
              onClick={handleRemoveFriend}
              disabled={actionLoading}
              className="px-3 py-3 bg-[#4b5563] text-red-500 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60 text-sm"
              title={t('userProfile.removeFriend', currentLang)}
            >
              ✕
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      {/* Header with back */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={() => closeSubPage()}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={t('common.back', currentLang)}
        >
          ←
        </button>
        <h2 className="font-semibold text-base">
          {t('common.profile', currentLang)}
        </h2>
      </div>

      {/* Cover + Avatar */}
      <div className="relative h-32 bg-gradient-to-r from-[#7c3aed]/30 to-emerald-900/30">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-[var(--card)] border-4 border-[var(--bg)] flex items-center justify-center text-4xl overflow-hidden">
            {typeof profile.avatar === 'string' && profile.avatar.startsWith('http') ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.avatar
            )}
          </div>
          {profile.isOnline && (
            <div
              className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg)]"
              aria-label="Utilisateur en ligne"
            />
          )}
        </div>
      </div>

      <div className="pt-14 px-4 space-y-5">
        {/* Name & info */}
        <div className="text-center">
          <h3 className="font-bold text-xl">
            {profile.name}
          </h3>
          {profile.location && (
            <p className="text-gray-400 text-sm">
              📍 {profile.location}
            </p>
          )}
          {profile.level && (
            <span
              className="inline-block mt-1 px-2.5 py-0.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
            >
              {profile.level}
            </span>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-300 text-center text-sm">
            {profile.bio}
          </p>
        )}

        {/* Sports */}
        {profile.sports && profile.sports.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {profile.sports.map((sport: any) => (
              <span
                key={sport.name}
                className="px-3 py-1.5 bg-white/5 rounded-full flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
              >
                {getSportEmoji(sport.name)} {sport.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        {profile.stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: t('common.sorties', currentLang), value: profile.stats.sorties || 0 },
              { label: t('common.hours', currentLang), value: `${profile.stats.hours || 0}h` },
              { label: t('common.dplus', currentLang), value: `${profile.stats.dplus || 0}m` },
              { label: t('common.km', currentLang), value: `${profile.stats.km || 0}km` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[var(--card)] rounded-xl p-3 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <p className="text-lg font-bold text-[var(--accent)]">{stat.value}</p>
                <p className="text-gray-500 text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">
              Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-yellow-900/20 text-yellow-400 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
                  title={badge.description || ''}
                >
                  {badge.icon || '🏅'} {badge.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Friend Status + Send Message */}
        <div className="space-y-3 pt-2">
          {/* Friend Status Button */}
          {renderFriendButton()}

          <button
            type="button"
            className="w-full py-3 bg-white/10 text-white rounded-lg hover:bg-white/15 transition font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
            onClick={handleSendMessage}
            aria-label={`${t('userProfile.sendMessage', currentLang)} à ${profile.name}`}
          >
            💬 {t('userProfile.sendMessage', currentLang)}
          </button>
        </div>

        {/* Friends List Section */}
        {friends.length > 0 && (
          <div className="bg-[var(--card)] rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-3 text-sm">
              {t('userProfile.friends', currentLang)} ({friends.length})
            </h4>
            <div className="space-y-2">
              {friends.slice(0, 5).map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSubPage({ type: 'user-profile', userId: friend.id })}
                  className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg hover:bg-white/10 transition cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {typeof friend.avatar === 'string' && friend.avatar.startsWith('http') ? (
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      friend.avatar
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium group-hover:text-[var(--accent)] transition text-[13px]">
                      {friend.name}
                    </div>
                    {friend.location && (
                      <div className="text-gray-500 text-xs">
                        {friend.location}
                      </div>
                    )}
                  </div>
                  {friend.isOnline && (
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
              {friends.length > 5 && (
                <button
                  onClick={() => setSubPage({ type: 'friendsList', userId })}
                  className="w-full py-2 bg-white/10 text-[var(--accent)] rounded-lg hover:bg-white/15 transition font-medium mt-2 text-[13px]"
                >
                  {t('userProfile.viewAllFriends', currentLang)} ({friends.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Member Since + Report */}
        <div className="text-center space-y-2 pt-4 border-t border-white/5">
          {profile.joinedDate && (
            <p className="text-gray-600 text-xs">
              {t('userProfile.memberSince', currentLang)}: {profile.joinedDate}
            </p>
          )}
          <button
            type="button"
            className="text-gray-500 underline hover:text-red-400 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-xs"
            aria-label={t('userProfile.reportProfile', currentLang)}
          >
            {t('userProfile.reportProfile', currentLang)}
          </button>
        </div>
      </div>
    </div>
  );
}

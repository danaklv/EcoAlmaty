import { useEffect, useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { Users, Search, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {useAuth} from "@/contexts/AuthContext.tsx";

interface Friend {
  id: number;
  username: string;
  rating: number;
  level: number;
  league: string;
  requester_id: number;
}

interface SearchUser {
  ID: number;
  Username: string;
  League: string;
  Level: number;
}

const leagueColor: Record<string, string> = {
  Bronze: 'text-amber-600',
  Silver: 'text-gray-400',
  Gold: 'text-yellow-500',
  Platinum: 'text-cyan-500',
  Diamond: 'text-blue-500',
  'Green Seed': 'text-green-500',
};

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsRes, incomingRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
      ]);
      setFriends(friendsRes.data || []);
      setIncoming(incomingRes.data || []);
    } catch {
      setFriends([]);
      setIncoming([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchUsername(value);
    clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(value)}`);
        const filtered = (res.data || []).filter((u: SearchUser) => u.Username !== user?.username);
        setSearchResults(filtered);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectUser = (username: string) => {
    setSearchUsername(username);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSendRequest = async () => {
    if (!searchUsername.trim()) return;
    setSending(true);
    try {
      await api.post('/friends/send', { username: searchUsername.trim() });
      toast.success(`Friend request sent to ${searchUsername}!`);
      setSearchUsername('');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (requesterID: number, action: 'accept' | 'reject') => {
    try {
      await api.post('/friends/respond', { requester_id: requesterID, action });
      toast.success(action === 'accept' ? 'Friend added!' : 'Request rejected');
      fetchData();
    } catch {
      toast.error('Failed to respond');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">Friends</h1>
          <p className="text-primary-foreground/80 text-sm">Connect with other eco warriors</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5" />
                Send Friend Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative" ref={dropdownRef}>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Enter username..."
                      value={searchUsername}
                      onChange={e => handleSearchChange(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendRequest()}
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <Button onClick={handleSendRequest} disabled={sending || !searchUsername.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Send
                  </Button>
                </div>

                {/* Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map(u => (
                      <button
                        key={u.ID}
                        onClick={() => handleSelectUser(u.Username)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-forest text-primary-foreground text-xs font-semibold">
                            {u.Username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{u.Username}</p>
                          <p className={`text-xs ${leagueColor[u.League] || 'text-green-500'}`}>
                            {u.League} · Level {u.Level}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchResults.length === 0 && !searching && searchUsername.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Incoming Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5 text-green-600" />
                Incoming Requests ({incoming.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incoming.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No incoming requests</p>
              )}
              {incoming.map(req => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-forest text-primary-foreground font-semibold">
                      {req.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{req.username}</p>
                    <p className={`text-xs ${leagueColor[req.league] || 'text-green-500'}`}>
                      {req.league || 'Green Seed'} · Level {req.level}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRespond(req.requester_id, 'accept')}
                      className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRespond(req.requester_id, 'reject')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              My Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No friends yet. Send a request to get started!</p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {friends.map((f, i) => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-forest text-primary-foreground font-semibold">
                      {f.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{f.username}</p>
                    <p className={`text-xs ${leagueColor[f.league] || 'text-green-500'}`}>
                      {f.league || 'Green Seed'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Lvl {f.level}</p>
                    <p className="text-sm font-bold text-primary">{f.rating} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
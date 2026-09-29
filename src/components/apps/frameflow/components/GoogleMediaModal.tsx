import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  HardDrive,
  Image as ImageIcon,
  Search,
  RefreshCw,
  Download,
  Play,
  Film,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  LogOut,
  FolderOpen,
  Filter,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import firebaseConfig from '../firebase-applet-config.json';

interface GoogleMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (file: File, url: string) => void;
  initialTab?: 'drive' | 'photos';
}

interface DriveVideoItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
}

interface PhotosVideoItem {
  id: string;
  filename: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata?: {
    creationTime?: string;
    width?: string;
    height?: string;
    video?: {
      cameraMake?: string;
      cameraModel?: string;
      fps?: number;
      status?: string;
    };
  };
}

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/photoslibrary.readonly'
].join(' ');

export const GoogleMediaModal: React.FC<GoogleMediaModalProps> = ({
  isOpen,
  onClose,
  onSelectVideo,
  initialTab = 'drive'
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'photos'>(initialTab);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem('frameflow_google_token') || null;
  });
  const [userInfo, setUserInfo] = useState<{ email?: string; name?: string; picture?: string } | null>(() => {
    const saved = sessionStorage.getItem('frameflow_google_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveVideoItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Photos state
  const [photosItems, setPhotosItems] = useState<PhotosVideoItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [photosActivationUrl, setPhotosActivationUrl] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'size'>('newest');

  // Loading / Download Progress state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');

  const clientId = firebaseConfig.oAuthClientId || '';
  const apiKey = firebaseConfig.apiKey || '';

  // Synchronize initialTab when opening
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Request Access Token using GSI
  const handleConnectGoogle = useCallback(() => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
        // Wait a second for GSI script if still loading
        setTimeout(() => {
          if (!(window as any).google?.accounts?.oauth2) {
            setIsAuthenticating(false);
            setAuthError('Google Sign-In service is initializing. Please check your internet connection and try again.');
            return;
          }
          initiateTokenFlow();
        }, 800);
        return;
      }

      initiateTokenFlow();
    } catch (err: any) {
      setIsAuthenticating(false);
      setAuthError(err?.message || 'Failed to initialize Google Authentication.');
    }

    function initiateTokenFlow() {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPES,
          callback: async (tokenResponse: any) => {
            setIsAuthenticating(false);
            if (tokenResponse && tokenResponse.access_token) {
              const token = tokenResponse.access_token;
              setAccessToken(token);
              sessionStorage.setItem('frameflow_google_token', token);

              // Fetch User Info
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (userRes.ok) {
                  const userData = await userRes.json();
                  setUserInfo(userData);
                  sessionStorage.setItem('frameflow_google_user', JSON.stringify(userData));
                }
              } catch (e) {
                console.warn('Failed to fetch userinfo', e);
              }
            } else if (tokenResponse && tokenResponse.error) {
              setAuthError(`Authentication error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
          },
          error_callback: (err: any) => {
            setIsAuthenticating(false);
            setAuthError(err?.message || 'OAuth popup closed or blocked.');
          }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (e: any) {
        setIsAuthenticating(false);
        setAuthError(e?.message || 'Could not start Google Authentication flow.');
      }
    }
  }, [clientId]);

  const handleDisconnect = () => {
    setAccessToken(null);
    setUserInfo(null);
    sessionStorage.removeItem('frameflow_google_token');
    sessionStorage.removeItem('frameflow_google_user');
    setDriveFiles([]);
    setPhotosItems([]);
  };

  // Fetch Google Drive Video files
  const fetchDriveVideos = useCallback(async (token: string) => {
    setIsLoadingDrive(true);
    setDriveError(null);

    try {
      // Query video files from drive
      const query = encodeURIComponent("mimeType contains 'video/' and trashed = false");
      const fields = encodeURIComponent("files(id, name, mimeType, size, thumbnailLink, webViewLink, createdTime, modifiedTime, videoMediaMetadata, iconLink)");
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=60&orderBy=modifiedTime desc`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        // Token expired
        setAccessToken(null);
        sessionStorage.removeItem('frameflow_google_token');
        setDriveError('Session expired. Please reconnect your Google account.');
        return;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Google Drive API responded with status ${response.status}`);
      }

      const data = await response.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error('Error fetching Google Drive videos:', err);
      setDriveError(err?.message || 'Failed to load video files from Google Drive.');
    } finally {
      setIsLoadingDrive(false);
    }
  }, []);

  // Fetch Google Photos Videos
  const fetchPhotosVideos = useCallback(async (token: string) => {
    setIsLoadingPhotos(true);
    setPhotosError(null);
    setPhotosActivationUrl(null);

    try {
      const url = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
      const body = {
        pageSize: 50,
        filters: {
          mediaTypeFilter: {
            mediaTypes: ['VIDEO']
          }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.status === 401) {
        setAccessToken(null);
        sessionStorage.removeItem('frameflow_google_token');
        setPhotosError('Session expired. Please reconnect your Google account.');
        return;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Google Photos API responded with status ${response.status}`;

        // Check if Photos Library API is not enabled on project
        if (
          errMsg.includes('Photos Library API has not been used') ||
          errMsg.includes('disabled') ||
          errMsg.includes('API_DISABLED') ||
          response.status === 403
        ) {
          const match = errMsg.match(/https:\/\/console\.developers\.google\.com\/[^\s]+/);
          const activationUrl = match ? match[0] : 'https://console.developers.google.com/apis/api/photoslibrary.googleapis.com/overview?project=209227491452';
          setPhotosActivationUrl(activationUrl);
          setPhotosError(errMsg);
          return;
        }

        throw new Error(errMsg);
      }

      const data = await response.json();
      setPhotosItems(data.mediaItems || []);
    } catch (err: any) {
      console.error('Error fetching Google Photos:', err);
      setPhotosError(err?.message || 'Failed to load videos from Google Photos.');
    } finally {
      setIsLoadingPhotos(false);
    }
  }, []);

  // Fetch data automatically when token is present and modal is open
  useEffect(() => {
    if (isOpen && accessToken) {
      if (activeTab === 'drive' && driveFiles.length === 0) {
        fetchDriveVideos(accessToken);
      } else if (activeTab === 'photos' && photosItems.length === 0) {
        fetchPhotosVideos(accessToken);
      }
    }
  }, [isOpen, accessToken, activeTab, fetchDriveVideos, fetchPhotosVideos, driveFiles.length, photosItems.length]);

  // Open Google Picker API
  const handleOpenGooglePicker = useCallback(() => {
    if (!accessToken) {
      handleConnectGoogle();
      return;
    }

    if (typeof window === 'undefined' || !(window as any).gapi) {
      alert('Google API client is loading. Please try again in a moment.');
      return;
    }

    const gapi = (window as any).gapi;
    gapi.load('picker', () => {
      try {
        const google = (window as any).google;
        if (!google?.picker) {
          alert('Google Picker is not available.');
          return;
        }

        const driveView = new google.picker.DocsView(google.picker.ViewId.DOCS_VIDEOS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false);

        const photosView = new google.picker.PhotosView()
          .setType(google.picker.PhotosViewType.VIDEOS);

        const picker = new google.picker.PickerBuilder()
          .addView(driveView)
          .addView(photosView)
          .setOAuthToken(accessToken)
          .setDeveloperKey(apiKey)
          .setCallback((data: any) => {
            if (data.action === google.picker.Action.PICKED) {
              const doc = data.docs[0];
              if (doc) {
                // Import picked file
                importDriveFile({
                  id: doc.id,
                  name: doc.name || 'imported_video.mp4',
                  mimeType: doc.mimeType || 'video/mp4',
                  size: doc.sizeBytes ? `${doc.sizeBytes}` : undefined
                });
              }
            }
          })
          .build();

        picker.setVisible(true);
      } catch (err: any) {
        console.error('Picker build error:', err);
        alert('Could not open Google Picker: ' + err.message);
      }
    });
  }, [accessToken, apiKey, handleConnectGoogle]);

  // Import video from Google Drive by ID
  const importDriveFile = async (file: Partial<DriveVideoItem>) => {
    if (!accessToken || !file.id) return;

    setDownloadingId(file.id);
    setDownloadProgress(10);
    setDownloadStatusText(`Connecting to Google Drive stream for "${file.name || 'video'}"...`);

    try {
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      setDownloadProgress(25);
      setDownloadStatusText('Streaming video data from cloud storage...');

      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      setDownloadProgress(60);
      setDownloadStatusText('Receiving media chunks...');

      const blob = await response.blob();
      setDownloadProgress(90);
      setDownloadStatusText('Finalizing video container for Frame Flow...');

      const fileName = file.name || `drive_video_${Date.now()}.mp4`;
      const videoType = file.mimeType || blob.type || 'video/mp4';
      const videoFileObj = new File([blob], fileName, { type: videoType });
      const objectUrl = URL.createObjectURL(videoFileObj);

      setDownloadProgress(100);
      setDownloadStatusText('Success! Loading into Frame Flow Studio...');

      setTimeout(() => {
        onSelectVideo(videoFileObj, objectUrl);
        setDownloadingId(null);
        onClose();
      }, 400);

    } catch (err: any) {
      console.error('Download drive file failed:', err);
      alert(`Could not import "${file.name}": ${err.message}`);
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  // Import video from Google Photos item
  const importPhotosItem = async (item: PhotosVideoItem) => {
    if (!accessToken || !item.baseUrl) return;

    setDownloadingId(item.id);
    setDownloadProgress(10);
    setDownloadStatusText(`Fetching "${item.filename || 'video'}" from Google Photos...`);

    try {
      // Google Photos video download baseUrl suffix: '=dv'
      const videoDownloadUrl = `${item.baseUrl}=dv`;
      setDownloadProgress(35);
      setDownloadStatusText('Downloading full-fidelity video stream...');

      const response = await fetch(videoDownloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error(`Google Photos server responded with ${response.status}`);
      }

      setDownloadProgress(75);
      setDownloadStatusText('Processing high-resolution video stream...');

      const blob = await response.blob();
      setDownloadProgress(95);
      setDownloadStatusText('Preparing Frame Flow timeline player...');

      const fileName = item.filename || `photos_video_${Date.now()}.mp4`;
      const videoType = item.mimeType || blob.type || 'video/mp4';
      const videoFileObj = new File([blob], fileName, { type: videoType });
      const objectUrl = URL.createObjectURL(videoFileObj);

      setDownloadProgress(100);
      setDownloadStatusText('Loaded!');

      setTimeout(() => {
        onSelectVideo(videoFileObj, objectUrl);
        setDownloadingId(null);
        onClose();
      }, 400);

    } catch (err: any) {
      console.error('Download photos item failed:', err);
      alert(`Could not import "${item.filename}": ${err.message}`);
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  // Format bytes helper
  const formatBytes = (bytesStr?: string | number) => {
    if (!bytesStr) return '';
    const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
    if (isNaN(bytes) || bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format milliseconds to mm:ss
  const formatMillis = (millisStr?: string) => {
    if (!millisStr) return '';
    const ms = parseInt(millisStr, 10);
    if (isNaN(ms)) return '';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter & Sort Drive Files
  const filteredDriveFiles = useMemo(() => {
    let list = driveFiles.filter(file => {
      if (!searchQuery) return true;
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.modifiedTime || b.createdTime || 0).getTime() - new Date(a.modifiedTime || a.createdTime || 0).getTime());
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'size') {
      list.sort((a, b) => (parseInt(b.size || '0', 10)) - (parseInt(a.size || '0', 10)));
    }
    return list;
  }, [driveFiles, searchQuery, sortBy]);

  // Filter & Sort Photos Items
  const filteredPhotosItems = useMemo(() => {
    let list = photosItems.filter(item => {
      if (!searchQuery) return true;
      return (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.mediaMetadata?.creationTime || 0).getTime() - new Date(a.mediaMetadata?.creationTime || 0).getTime());
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.filename || '').localeCompare(b.filename || ''));
    }
    return list;
  }, [photosItems, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col text-slate-900 font-sans">
        
        {/* Title Bar */}
        <div className="h-12 bg-slate-900 text-white px-5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                <span>Import Cloud Video Footage</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                  Google Workspace
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userInfo && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-lg text-xs">
                {userInfo.picture ? (
                  <img src={userInfo.picture} alt="Avatar" className="w-4 h-4 rounded-full" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[9px] flex items-center justify-center">
                    {(userInfo.name || userInfo.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-zinc-200 font-medium text-[11px] truncate max-w-[150px]">
                  {userInfo.name || userInfo.email}
                </span>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect Google Account"
                  className="text-zinc-400 hover:text-rose-400 ml-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Subheader & Tab Bar */}
        <div className="bg-slate-50 border-b border-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'drive'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HardDrive className={`w-4 h-4 ${activeTab === 'drive' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span>Google Drive</span>
              {driveFiles.length > 0 && (
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-md">
                  {driveFiles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'photos'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className={`w-4 h-4 ${activeTab === 'photos' ? 'text-amber-600' : 'text-gray-500'}`} />
              <span>Google Photos</span>
              {photosItems.length > 0 && (
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                  {photosItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Actions & Picker Button */}
          {accessToken && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenGooglePicker}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-zinc-800 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Open native Google Picker file selector popup"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Google File Picker...</span>
              </button>

              <button
                onClick={() => {
                  if (activeTab === 'drive') fetchDriveVideos(accessToken);
                  else fetchPhotosVideos(accessToken);
                }}
                disabled={isLoadingDrive || isLoadingPhotos}
                className="p-1.5 bg-white hover:bg-gray-100 text-zinc-700 border border-gray-300 rounded-xl text-xs transition-colors disabled:opacity-50"
                title="Refresh videos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDrive || isLoadingPhotos ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
          {!accessToken ? (
            /* Unauthenticated / Connect Account Call-to-Action */
            <div className="py-12 px-4 max-w-lg mx-auto flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-amber-400 to-rose-500 p-0.5 shadow-md mb-5">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <div className="flex items-center -space-x-1.5">
                    <HardDrive className="w-6 h-6 text-blue-600" />
                    <ImageIcon className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
                Connect Google Drive & Google Photos
              </h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Seamlessly browse and import high-resolution video recordings from your Google Cloud storage directly into Frame Flow to extract photo-quality stills and animated teasers.
              </p>

              {authError && (
                <div className="w-full mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                onClick={handleConnectGoogle}
                disabled={isAuthenticating}
                className="w-full max-w-xs py-3 px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Connecting Google Services...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Read-only access
                </span>
                <span>•</span>
                <span>Fast direct download</span>
                <span>•</span>
                <span>Encrypted session</span>
              </div>
            </div>
          ) : (
            /* Authenticated Video Browser */
            <div className="space-y-4">
              
              {/* Search and Sort Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab === 'drive' ? 'Drive videos' : 'Photos videos'}...`}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-gray-500">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                    {activeTab === 'drive' && <option value="size">File Size</option>}
                  </select>
                </div>
              </div>

              {/* Progress Bar (When importing) */}
              {downloadingId && (
                <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>{downloadStatusText}</span>
                    </div>
                    <span className="font-mono text-amber-300">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all duration-200 rounded-full"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* DRIVE TAB CONTENT */}
              {activeTab === 'drive' && (
                <div>
                  {isLoadingDrive ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                      <p className="text-xs font-bold text-gray-700">Loading Google Drive video files...</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Scanning your cloud drive for recordings</p>
                    </div>
                  ) : driveError ? (
                    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-rose-800">{driveError}</p>
                      <button
                        onClick={() => fetchDriveVideos(accessToken)}
                        className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : filteredDriveFiles.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                      <HardDrive className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-600">No video files found in Google Drive</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
                        {searchQuery ? 'No videos matching your search criteria.' : 'Upload MP4, WebM, or MOV video files to your Google Drive to view them here.'}
                      </p>
                      <button
                        onClick={handleOpenGooglePicker}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Open Google Drive Picker
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {filteredDriveFiles.map((file) => {
                        const isDownloading = downloadingId === file.id;
                        const durationText = formatMillis(file.videoMediaMetadata?.durationMillis);
                        const sizeText = formatBytes(file.size);

                        return (
                          <div
                            key={file.id}
                            className={`group relative bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                              isDownloading ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Thumbnail Area */}
                            <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                              {file.thumbnailLink ? (
                                <img
                                  src={file.thumbnailLink.replace(/=s\d+/, '=s400')}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Film className="w-8 h-8 text-slate-600" />
                              )}

                              {/* Duration / Format Pill */}
                              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono font-bold text-white flex items-center gap-1">
                                {durationText ? (
                                  <>
                                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                                    <span>{durationText}</span>
                                  </>
                                ) : (
                                  <span>VIDEO</span>
                                )}
                              </div>

                              {sizeText && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono text-zinc-300">
                                  {sizeText}
                                </div>
                              )}
                            </div>

                            {/* Info & Action Deck */}
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 truncate mb-1" title={file.name}>
                                  {file.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                                  {file.videoMediaMetadata?.width && file.videoMediaMetadata?.height && (
                                    <span>{file.videoMediaMetadata.width}×{file.videoMediaMetadata.height}</span>
                                  )}
                                  {file.modifiedTime && (
                                    <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => importDriveFile(file)}
                                disabled={!!downloadingId}
                                className={`mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                                  isDownloading
                                    ? 'bg-blue-600 text-white cursor-wait'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98 disabled:opacity-50'
                                }`}
                              >
                                {isDownloading ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Importing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Import to Frame Flow</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PHOTOS TAB CONTENT */}
              {activeTab === 'photos' && (
                <div>
                  {isLoadingPhotos ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                      <p className="text-xs font-bold text-gray-700">Loading Google Photos video library...</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Scanning your media items for clips</p>
                    </div>
                  ) : photosError ? (
                    photosActivationUrl ? (
                      <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl max-w-xl mx-auto text-center space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-xs">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1">
                            Google Photos API Activation Required
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                            Google Cloud requires the Photos Library API to be enabled on project <span className="font-mono font-bold text-gray-800">209227491452</span> to stream videos directly from Google Photos.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                          <a
                            href={photosActivationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Enable Photos API in Console</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => setActiveTab('drive')}
                            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                            <span>Browse Google Drive Videos</span>
                          </button>

                          <button
                            onClick={handleOpenGooglePicker}
                            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs rounded-xl shadow-xs transition-colors"
                          >
                            <span>Open File Picker</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-center gap-3 text-[11px] text-gray-500">
                          <span>Enabled it in Google Cloud?</span>
                          <button
                            onClick={() => {
                              setPhotosActivationUrl(null);
                              fetchPhotosVideos(accessToken);
                            }}
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry Connection</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-rose-800">{photosError}</p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <button
                            onClick={() => fetchPhotosVideos(accessToken)}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={() => setActiveTab('drive')}
                            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Browse Google Drive
                          </button>
                        </div>
                      </div>
                    )
                  ) : filteredPhotosItems.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-600">No videos found in Google Photos</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
                        {searchQuery ? 'No videos matching your query.' : 'Videos recorded or uploaded to Google Photos will show up here.'}
                      </p>
                      <button
                        onClick={handleOpenGooglePicker}
                        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Open Google Photos Picker
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {filteredPhotosItems.map((item) => {
                        const isDownloading = downloadingId === item.id;
                        const createdDate = item.mediaMetadata?.creationTime
                          ? new Date(item.mediaMetadata.creationTime).toLocaleDateString()
                          : '';

                        return (
                          <div
                            key={item.id}
                            className={`group relative bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                              isDownloading ? 'ring-2 ring-amber-500 border-transparent' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Thumbnail Area */}
                            <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                              <img
                                src={`${item.baseUrl}=w400-h225-c`}
                                alt={item.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />

                              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono font-bold text-white flex items-center gap-1">
                                <Film className="w-2.5 h-2.5 text-amber-400" />
                                <span>{item.mediaMetadata?.video?.fps ? `${Math.round(item.mediaMetadata.video.fps)} FPS` : 'PHOTO VIDEO'}</span>
                              </div>

                              {createdDate && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono text-zinc-300">
                                  {createdDate}
                                </div>
                              )}
                            </div>

                            {/* Info & Action Deck */}
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 truncate mb-1" title={item.filename}>
                                  {item.filename || 'Video Clip'}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                                  {item.mediaMetadata?.width && item.mediaMetadata?.height && (
                                    <span>{item.mediaMetadata.width}×{item.mediaMetadata.height}</span>
                                  )}
                                  {item.mediaMetadata?.video?.cameraModel && (
                                    <span className="truncate">{item.mediaMetadata.video.cameraModel}</span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => importPhotosItem(item)}
                                disabled={!!downloadingId}
                                className={`mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                                  isDownloading
                                    ? 'bg-amber-600 text-white cursor-wait'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98 disabled:opacity-50'
                                }`}
                              >
                                {isDownloading ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Importing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Import to Frame Flow</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Supported formats:</span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
              MP4, WebM, MOV, QuickTime, MKV
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-300 transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleMediaModal;

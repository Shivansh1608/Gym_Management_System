import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  RotateCw,
  Sparkles,
  History,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ProgressRing } from '../ui/progress-ring';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

interface CheckInRecord {
  id: string;
  location: string;
  timestamp: string;
  verified: boolean;
}

export function QRCheckIn() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'pass' | 'scanner'>('pass');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [qrToken, setQrToken] = useState('FTP-MEMBER-' + Date.now());
  const [cameraActive, setCameraActive] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInRecord | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([
    {
      id: 'ci-1',
      location: 'FitTrack Pro Downtown (Studio A)',
      timestamp: 'Today, 07:15 AM',
      verified: true,
    },
    {
      id: 'ci-2',
      location: 'FitTrack Pro Downtown (Main Gym)',
      timestamp: 'Yesterday, 06:45 PM',
      verified: true,
    },
    {
      id: 'ci-3',
      location: 'FitTrack Pro Westside Hub',
      timestamp: 'Oct 20, 08:30 AM',
      verified: true,
    },
  ]);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Rotate QR token every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setQrToken('FTP-MEMBER-' + Math.random().toString(36).substring(2, 10).toUpperCase());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInstantCheckIn = async (loc = 'FitTrack Pro Downtown') => {
    try {
      await api.checkIn(loc);
      const record: CheckInRecord = {
        id: `ci-${Date.now()}`,
        location: loc,
        timestamp: 'Just now',
        verified: true,
      };
      setLastCheckIn(record);
      setCheckInHistory((prev) => [record, ...prev]);
      toast.success('Check-in verified successfully! Enjoy your workout! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Check-in request failed');
    }
  };

  const startCameraScanner = async () => {
    try {
      setCameraActive(true);
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCameraScanner();
          handleInstantCheckIn(`Station: ${decodedText.slice(0, 20)}`);
        },
        () => {}
      );
    } catch (err: any) {
      setCameraActive(false);
      toast.error('Camera access could not be initialized or permission was denied.');
    }
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-2.5">
          <QrCode className="w-7 h-7 text-primary" />
          Front-Desk Check-In & Access Pass
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan the front-desk terminal QR code or present your rotating dynamic pass to the turnstile reader.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1 rounded-2xl bg-secondary w-full sm:w-80">
        <button
          type="button"
          onClick={() => {
            stopCameraScanner();
            setActiveMode('pass');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeMode === 'pass' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          My Digital Pass
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('scanner')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeMode === 'scanner' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Camera Scanner
        </button>
      </div>

      {/* Active Mode Panels */}
      {activeMode === 'pass' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Member Pass Card */}
          <Card className="p-7 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-border/50 text-xs">
              <span className="font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Active Membership
              </span>
              <span className="text-muted-foreground font-mono">Tier: PRO ATHLETE</span>
            </div>

            {/* Simulated Dynamic QR Code */}
            <div className="relative p-6 rounded-3xl bg-white shadow-2xl mb-6">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-900 to-black p-3 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden">
                <QrCode className="w-36 h-36 text-white stroke-[1.5]" />
                <div className="absolute inset-x-0 bottom-1 text-[9px] font-mono tracking-widest text-center text-emerald-400">
                  {qrToken.slice(0, 16)}
                </div>
              </div>
            </div>

            {/* Expiry Countdown */}
            <div className="flex items-center gap-3 mb-6 bg-muted/40 px-4 py-2 rounded-xl">
              <ProgressRing
                progress={(secondsRemaining / 30) * 100}
                size={32}
                strokeWidth={3}
                showValue={false}
                color="stroke-primary"
              />
              <div className="text-left text-xs">
                <span className="font-semibold block text-foreground">
                  Refreshes in {secondsRemaining}s
                </span>
                <span className="text-[10px] text-muted-foreground">Dynamic token prevents screenshot sharing</span>
              </div>
            </div>

            <Button
              onClick={() => handleInstantCheckIn('FitTrack Pro Downtown (Turnstile 1)')}
              className="w-full rounded-xl font-semibold shadow-md shadow-primary/20 gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simulate Turnstile Tap
            </Button>
          </Card>

          {/* Verification Status & Venue Info */}
          <div className="space-y-4">
            <Card className="p-6">
              <CardTitle className="text-base mb-2">Facility Access Verification</CardTitle>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Your pass permits unrestricted 24/7 access to all weight rooms, cardio decks, and sauna facilities.
              </p>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-muted-foreground">Member ID:</span>
                  <span className="font-mono font-semibold text-foreground">{user?.id || 'MBR-9021'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-muted-foreground">Primary Location:</span>
                  <span className="font-medium text-foreground">FitTrack Downtown Hub</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-muted-foreground">Locker Access:</span>
                  <span className="font-semibold text-emerald-500">Authorized (#142)</span>
                </div>
              </div>
            </Card>

            {lastCheckIn && (
              <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-3 text-emerald-500 mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-sm">Last Check-in Confirmed!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Logged at {lastCheckIn.location} • {lastCheckIn.timestamp}
                </p>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Camera Scanner Tab */
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mb-6">
            <div id="qr-reader-container" className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden min-h-[260px] bg-muted/30 flex items-center justify-center border border-dashed border-border" />
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            Point your device camera at the QR code displayed on the entrance iPad terminal or gym front counter.
          </p>

          <div className="flex justify-center gap-3">
            {!cameraActive ? (
              <Button onClick={startCameraScanner} className="rounded-xl font-semibold gap-2 shadow-md">
                <Camera className="w-4 h-4" />
                Activate Camera
              </Button>
            ) : (
              <Button variant="outline" onClick={stopCameraScanner} className="rounded-xl">
                Stop Camera
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Check-In History Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Recent Attendance History
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Verified check-in log records for the past 30 days.</p>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {checkInHistory.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-foreground block">{item.location}</span>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Verified Turnstile Entry
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default QRCheckIn;

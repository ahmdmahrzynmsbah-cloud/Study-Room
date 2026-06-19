/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Challenge, Submission } from '../types';
import { Clock, Book, HelpCircle, FileText, CheckCircle2, ChevronRight, Upload, AlertTriangle, Star, Check, Search } from 'lucide-react';

const calculateSegmentAngle = (count: number): number => {
  return 360 / (count || 4);
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const drawSector = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
    "Z"
  ].join(" ");
};

const SURAH_NAMES = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "العلق", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

const QURAN_RECITERS = [
  {
    id: 'minsh',
    name: 'الشيخ محمد صديق المنشاوي',
    desc: 'طهارة الخشوع وتجويد القلوب عالي الدقة (خادم المصحف)',
    server: 'https://server10.mp3quran.net/minsh/',
    radio: 'https://backup.qurango.net/radio/mohammad_siddiq_alminshawi_tarteel'
  },
  {
    id: 'basit',
    name: 'الشيخ عبد الباسط عبد الصمد',
    desc: 'سلطان الحنجرة الذهبية والتلاوة الخاشعة (مرتل)',
    server: 'https://server7.mp3quran.net/basit/',
    radio: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_khasha3a'
  },
  {
    id: 'husr',
    name: 'الشيخ محمود خليل الحصري',
    desc: 'شيخ المقارئ والإتقان اللفظي القويم',
    server: 'https://server13.mp3quran.net/husr/',
    radio: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary_tarteel'
  },
  {
    id: 'maher',
    name: 'الشيخ ماهر المعيقلي',
    desc: 'إمام الحرم المكي وتلاوات سكينة متصلة',
    server: 'https://server12.mp3quran.net/maher/',
    radio: 'https://backup.qurango.net/radio/maher_al_muaiqly'
  },
  {
    id: 'yasser',
    name: 'الشيخ ياسر الدوسري',
    desc: 'نبرة القلوب الخاضعة والترتيل الشجي',
    server: 'https://server11.mp3quran.net/yasser/',
    radio: 'https://backup.qurango.net/radio/yasser_aldosari'
  },
  {
    id: 'sds',
    name: 'الشيخ عبد الرحمن السديس',
    desc: 'الصوت الرخيم الندي وروحانيات الحرم المكي',
    server: 'https://server11.mp3quran.net/sds/',
    radio: 'https://backup.qurango.net/radio/abdulrahman_alsudaes'
  },
  {
    id: 'ajm',
    name: 'الشيخ أحمد بن علي العجمي',
    desc: 'صوت قوي ملؤه السكينة والطمأنينة',
    server: 'https://server10.mp3quran.net/ajm/',
    radio: 'https://backup.qurango.net/radio/ahmad_al_ajmy'
  },
  {
    id: 'gmd',
    name: 'الشيخ سعد الغامدي',
    desc: 'ترتيل عذب ونقي يريح النفس',
    server: 'https://server7.mp3quran.net/s_gmd/',
    radio: 'https://backup.qurango.net/radio/saad_alghamdi'
  },
  {
    id: 'shur',
    name: 'الشيخ سعود الشريم',
    desc: 'تلاوة سريعة رصينة ومؤثرة تفيض هدوءاً',
    server: 'https://server7.mp3quran.net/shur/',
    radio: 'https://backup.qurango.net/radio/saood_ash-shuraym'
  },
  {
    id: 'afasy',
    name: 'الشيخ مشاري راشد العفاسي',
    desc: 'صوت ماسي شجي يحلق بالروح عالياً',
    server: 'https://server8.mp3quran.net/afs/',
    radio: 'https://backup.qurango.net/radio/mishary_alafasy'
  }
];

const QURAN_SURAHS = [
  { id: 'radio', name: 'الإذاعة المرتلة المستمرة (24/7)', file: '' },
  ...SURAH_NAMES.map((name, idx) => {
    const num = String(idx + 1).padStart(3, '0');
    return {
      id: num,
      name: `سورة ${name}`,
      file: `${num}.mp3`
    };
  })
];

interface RoomPageProps {
  currentUser: User;
  users: User[];
  challenge: Challenge;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string) => void;
  onUpdateChallenge: (updatedChallenge: Challenge) => void;
  onUpdateUsers: (updatedUsers: User[]) => void;
  onLeaveRoom: () => void;
  settings: {
    allowSelfRating: boolean;
    defaultReward: number;
    defaultPenalty: number;
  };
}

export default function RoomPage({
  currentUser,
  users,
  challenge,
  onNavigate,
  onAddLog,
  onUpdateChallenge,
  onUpdateUsers,
  onLeaveRoom,
  settings,
}: RoomPageProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const [graceTimeLeftS, setGraceTimeLeftS] = useState<number>(600); // 10 minutes grace after timer hits 0
  const [graceFinished, setGraceFinished] = useState<boolean>(false);

  // Submission Form States
  const [proofText, setProofText] = useState('');
  const [proofFileBase64, setProofFileBase64] = useState<string>('');
  const [fileWarning, setFileWarning] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Ratings Local state: { [userId]: isApproved }
  const [userRatings, setUserRatings] = useState<{ [userId: string]: boolean }>({});
  const [ratingsSubmitted, setRatingsSubmitted] = useState(false);

  // Jury and Wheel states
  const [juryCaseUserId, setJuryCaseUserId] = useState<string | null>(null);
  const [juryDefenseText, setJuryDefenseText] = useState('لقد أنجزت المذاكرة وحللت الأسئلة والتمارين كاملة وضميري مرتاح!');
  const [simulatedNoVotesCount, setSimulatedNoVotesCount] = useState<{ [userId: string]: number }>({});
  const [punishmentWheelUserId, setPunishmentWheelUserId] = useState<string | null>(null);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [wheelSelectedIndex, setWheelSelectedIndex] = useState<number | null>(null);
  const [wheelResultText, setWheelResultText] = useState<string | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);

  // Intervals reference to clear properly
  const mainTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const graceTimerInterval = useRef<NodeJS.Timeout | null>(null);

  const isCompletedChallenge = challenge.status === 'completed';

  // --- PREMIUM FOCUS AUDIO SIMULATOR STATE & EFFECT ---
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeAudioTrack, setActiveAudioTrack] = useState<string>('none');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // --- QURAN & CUSTOM AUDIO PLAYER STATES ---
  const quranAudioRef = useRef<HTMLAudioElement | null>(null);
  const [quranTrackName, setQuranTrackName] = useState<string>('');
  const [quranReciterName, setQuranReciterName] = useState<string>('');
  const [quranPlayState, setQuranPlayState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [quranVolume, setQuranVolume] = useState<number>(0.6);
  const [quranLoading, setQuranLoading] = useState<boolean>(false);
  const [audioTab, setAudioTab] = useState<'quran' | 'custom' | 'ambient'>('quran');
  const [customQuranTracks, setCustomQuranTracks] = useState<{ id: string; name: string; url: string; reciter?: string }[]>([
    {
      id: 'default-1',
      name: 'راديو تلاوات خاشعة متواصلة 📻',
      url: 'https://backup.qurango.net/radio/tarteel',
      reciter: 'إذاعة الترتيل العامة'
    }
  ]);
  const [newCustomTrackName, setNewCustomTrackName] = useState<string>('');
  const [newCustomTrackUrl, setNewCustomTrackUrl] = useState<string>('');
  const [selectedWebReciter, setSelectedWebReciter] = useState<string>('minsh');
  const [selectedWebSurah, setSelectedWebSurah] = useState<string>('radio');
  const [reciterSearch, setReciterSearch] = useState<string>('');
  const [surahSearch, setSurahSearch] = useState<string>('');

  const fullStopQuranAudio = () => {
    if (quranAudioRef.current) {
      try {
        quranAudioRef.current.pause();
        quranAudioRef.current.src = '';
      } catch (e) {}
      quranAudioRef.current = null;
    }
    setQuranPlayState('stopped');
    setQuranReciterName('');
    setQuranTrackName('');
  };

  const playQuranTrack = (url: string, reciter: string, track: string) => {
    // Stop all synthetic focus sounds
    stopAllSyntheticBuffers();
    
    // Reset/Stop previous custom audio
    if (quranAudioRef.current) {
      try {
        quranAudioRef.current.pause();
        quranAudioRef.current.src = '';
      } catch (e) {}
      quranAudioRef.current = null;
    }
    
    setQuranLoading(true);
    setQuranPlayState('stopped');
    setQuranReciterName(reciter);
    setQuranTrackName(track);
    setActiveAudioTrack('quran');
    
    try {
      const audio = new Audio(url);
      
      // Attempt bypass iOS volume restrictions using Web Audio if CORS is safe
      const supportsWebAudioCORS = url.includes('mp3quran.net') || url.startsWith('blob:');
      if (supportsWebAudioCORS) {
        audio.crossOrigin = "anonymous";
      }
      
      audio.volume = quranVolume;
      audio.loop = true;
      
      const onCanPlay = () => {
        setQuranLoading(false);
        audio.play().then(() => {
          setQuranPlayState('playing');
          
          if (supportsWebAudioCORS) {
            try {
              if (!audioCtxRef.current) {
                const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
                audioCtxRef.current = new AudioCtxConstructor();
              }
              const ctx = audioCtxRef.current;
              if (ctx.state === 'suspended') {
                 ctx.resume();
              }
              // Only create source if it hasn't been created for this element
              if (!(audio as any)._sourceCreated) {
                const source = ctx.createMediaElementSource(audio);
                const gain = ctx.createGain();
                gain.gain.value = Math.max(quranVolume, 0.01);
                source.connect(gain);
                gain.connect(ctx.destination);
                gainNodeRef.current = gain;
                (audio as any)._sourceCreated = true;
              }
            } catch (err) {
              console.error("Web Audio connection failed, falling back to basic audio", err);
            }
          }
        }).catch((err) => {
          console.error("Autoplay blocked:", err);
          setQuranPlayState('paused');
        });
        audio.removeEventListener('canplay', onCanPlay);
      };

      const onError = (e: any) => {
        console.error("Audio src error:", e);
        setQuranLoading(false);
        setQuranPlayState('stopped');
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
      audio.addEventListener('ended', () => {
        setQuranPlayState('stopped');
      });

      quranAudioRef.current = audio;
    } catch (err) {
      console.error("Error creating audio:", err);
      setQuranLoading(false);
    }
  };

  const toggleQuranPlay = () => {
    if (!quranAudioRef.current) return;
    if (quranPlayState === 'playing') {
      quranAudioRef.current.pause();
      setQuranPlayState('paused');
    } else {
      quranAudioRef.current.play().then(() => {
        setQuranPlayState('playing');
      }).catch(e => console.error(e));
    }
  };

  const updateQuranVolume = (v: number) => {
    setQuranVolume(v);
    if (quranAudioRef.current) {
      quranAudioRef.current.volume = v;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        // Use direct value assignment to avoid queueing glitches
        gainNodeRef.current.gain.value = Math.max(v, 0.01);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopAllSyntheticBuffers = () => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
    } catch (e) {}
    
    if (oscillatorsRef.current && oscillatorsRef.current.length > 0) {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      oscillatorsRef.current = [];
    }

    setIsAudioPlaying(false);
    setActiveAudioTrack('none');
  };

  useEffect(() => {
    return () => {
      stopAllSyntheticBuffers();
      fullStopQuranAudio();
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const playSyntheticTrack = (track: 'rain' | 'ocean' | 'drone') => {
    stopAllSyntheticBuffers();
    fullStopQuranAudio();

    if (!audioCtxRef.current) {
      const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxConstructor();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(Math.max(quranVolume, 0.01), ctx.currentTime);
    mainGain.connect(ctx.destination);
    gainNodeRef.current = mainGain;

    if (track === 'rain' || track === 'ocean') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 4.0; 
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      if (track === 'ocean') {
        const swellGain = ctx.createGain();
        swellGain.gain.setValueAtTime(0.1, ctx.currentTime);
        
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); 
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(swellGain.gain);
        
        source.connect(swellGain);
        swellGain.connect(mainGain);
        
        lfo.start();
        oscillatorsRef.current.push(lfo);
      } else {
        source.connect(mainGain);
      }

      source.start();
      noiseSourceRef.current = source;
    } else if (track === 'drone') {
      const frequencies = [110, 110.4, 220, 330];
      frequencies.forEach((fre, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.frequency.setValueAtTime(fre, ctx.currentTime);
        osc.type = 'sine';
        
        oscGain.gain.setValueAtTime(idx === 0 || idx === 2 ? 0.35 : 0.15, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        oscillatorsRef.current.push(osc);
      });
    }

    setIsAudioPlaying(true);
    setActiveAudioTrack(track);
  };

  // --- 1. COUNTDOWN TIMER CALCULATION ---
  useEffect(() => {
    const updateCountdown = () => {
      if (!challenge.endTime) return;
      const now = Date.now();
      const diff = challenge.endTime - now;

      if (diff <= 0) {
        setTimeLeftMs(0);
        setTimerFinished(true);
        if (mainTimerInterval.current) clearInterval(mainTimerInterval.current);
        
        // Start grace countdown
        startGracePeriodCountdown();
      } else {
        setTimeLeftMs(diff);
        setTimerFinished(false);
      }
    };

    updateCountdown(); // first call
    if (challenge.status === 'active') {
      mainTimerInterval.current = setInterval(updateCountdown, 1000);
    } else {
      setTimerFinished(true);
    }

    return () => {
      if (mainTimerInterval.current) clearInterval(mainTimerInterval.current);
      if (graceTimerInterval.current) clearInterval(graceTimerInterval.current);
    };
  }, [challenge.endTime, challenge.status]);

  // Grace Period countdown
  const startGracePeriodCountdown = () => {
    if (graceTimerInterval.current) clearInterval(graceTimerInterval.current);
    
    const updateGrace = () => {
      if (!challenge.endTime) return;
      
      const now = Date.now();
      const tenMinsMs = 10 * 60 * 1000;
      const graceEnd = challenge.endTime + tenMinsMs;
      const diffS = Math.floor((graceEnd - now) / 1000);

      if (diffS <= 0) {
        setGraceTimeLeftS(0);
        setGraceFinished(true);
        if (graceTimerInterval.current) clearInterval(graceTimerInterval.current);
        
        // Automatically finalize points
        finalizeChallengeResults(true);
      } else {
        setGraceTimeLeftS(diffS);
        setGraceFinished(false);
      }
    };

    updateGrace();
    graceTimerInterval.current = setInterval(updateGrace, 1000);
  };

  // Convert ms to display string HH:MM:SS
  const formatTimeToken = (ms: number): string => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const formatGraceTimeToken = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  // Check if current user has already submitted a proof
  useEffect(() => {
    const userSub = challenge.submissions.find((s) => s.userId === currentUser.id);
    if (userSub) {
      setSubmitted(true);
      setProofText(userSub.proofText);
      setProofFileBase64(userSub.proofFile || '');
    }
  }, [challenge.submissions, currentUser.id]);

  // --- 2. FILE UPLOAD & BASE64 PARSE ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileWarning('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileWarning('جار العمل على ضغط الصورة لتسريع حفظ الإنجاز...');
      const { compressImage } = await import('../utils');
      // Compress to 800px width and lower quality to keep challenges doc very small
      const resized = await compressImage(file, 800, 800, 0.6);
      setProofFileBase64(resized);
      setFileWarning(''); // clear warning if success
    } catch (err) {
      setFileWarning('حدث خطأ أثناء معالجة الصورة.');
      console.error(err);
    }
  };

  // --- 3. SUBMISSION TRANSACTION ---
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim()) {
      alert('يرجى كتابة ملخص دراستك لإتمام مهمة التحدي.');
      return;
    }

    const newSub: Submission = {
      userId: currentUser.id,
      submittedAt: Date.now(),
      proofText: proofText.trim(),
      proofFile: proofFileBase64 || undefined,
      ratings: [],
      averageRating: 0,
    };

    const updatedSubmissions = [...challenge.submissions.filter((s) => s.userId !== currentUser.id), newSub];
    const isAllSubmitted = challenge.participants.every((pId) =>
      updatedSubmissions.some((s) => s.userId === pId)
    );

    const updatedChallenge: Challenge = {
      ...challenge,
      submissions: updatedSubmissions,
    };

    onUpdateChallenge(updatedChallenge);
    setSubmitted(true);
    onAddLog('تسليم إثبات التحدي', `سلّم ${currentUser.name} مستندات دراسته للتحدي: ${challenge.title}.`);

    // If everyone submitted, instantly trigger points calculations
    if (isAllSubmitted) {
      finalizeChallengeResults(false, updatedSubmissions);
    }
  };

  // --- 4. RATING RATINGS SUBMISSION ---
  const handleVote = (peerId: string, isApproved: boolean) => {
    setUserRatings((prev) => ({
      ...prev,
      [peerId]: isApproved,
    }));
  };

  const handleSubmitRatings = () => {
    // Collect ratings and apply them to the global challenge submissions
    const peersToRate = challenge.participants.filter((pId) => pId !== currentUser.id && challenge.submissions.some(s => s.userId === pId));
    const unratedPeers = peersToRate.filter((pId) => userRatings[pId] === undefined);

    // Check if user has rated everyone who submitted
    if (unratedPeers.length > 0) {
      const peerNames = unratedPeers
        .map((pId) => users.find((u) => u.id === pId)?.name || 'زميل')
        .join('، ');
      alert(`يرجى تقييم إثبات الزملاء قبل الحفظ: ${peerNames}`);
      return;
    }

    // Apply ratings to each targeted submission
    const updatedSubmissions = challenge.submissions.map((sub) => {
      if (sub.userId === currentUser.id) return sub; // can't rate yourself
      
      const ratingGiven = userRatings[sub.userId];
      if (ratingGiven !== undefined) {
        // Append rating
        const existingRatings = sub.ratings.filter((r) => r.fromUserId !== currentUser.id);
        const newRating = { fromUserId: currentUser.id, isApproved: ratingGiven };
        const allRatings = [...existingRatings, newRating];
        
        let newStatus = sub.status || 'pending';
        // Check if fully rated
        const potentialRatersCount = challenge.participants.length - 1;
        if (allRatings.length >= potentialRatersCount) {
           const hasRejection = allRatings.some(r => r.isApproved === false);
           if (hasRejection) {
             newStatus = 'rejected_pending_admin';
           } else {
             newStatus = 'approved';
           }
        }

        return {
          ...sub,
          ratings: allRatings,
          status: newStatus,
        };
      }
      return sub;
    });

    const isAllPeopleRatedAndProcessed = challenge.participants.every((pId) => {
      const userSub = updatedSubmissions.find((s) => s.userId === pId);
      if (!userSub) return true; // did not submit, skipped
      // Check if everyone else has rated this user sub
      const potentialRatersCount = challenge.participants.length - 1;
      return userSub.ratings.length >= potentialRatersCount;
    });

    const updatedChallenge: Challenge = {
      ...challenge,
      submissions: updatedSubmissions,
    };

    // If completely rated, trigger completion
    if (isAllPeopleRatedAndProcessed && updatedSubmissions.length === challenge.participants.length) {
      // finalizeChallengeResults handles giving points
      finalizeChallengeResults(false, updatedSubmissions);
      return; // prevent double update since finalize handles it
    }

    onUpdateChallenge(updatedChallenge);
    setRatingsSubmitted(true);
    onAddLog('تقييم الزملاء', `قام ${currentUser.name} بتقييم إثباتات الدارسين في الغرفة.`);
  };

  // --- 5. POINTS CALCULATION & FINALIZE ---
  const finalizeChallengeResults = (forceGraceExpired = false, customSubmissions?: Submission[]) => {
    const subs = customSubmissions || challenge.submissions;
    const participants = challenge.participants;

    const rewardPoints = challenge.pointsReward || settings.defaultReward;
    const penaltyPoints = challenge.pointsPenalty || settings.defaultPenalty;

    // Update students scores
    const updatedUsers = users.map((u) => {
      const isPart = participants.includes(u.id);
      if (!isPart) return u;

      const userSub = subs.find((s) => s.userId === u.id);
      let pointsChange = 0;
      let challengesCompDelta = u.challengesCompleted;

      if (userSub) {
        if (userSub.status === 'approved') {
           pointsChange = 20; // 20 points explicitly requested per the prompt
           challengesCompDelta += 1;
        } else {
           // pending or rejected_pending_admin don't get points right away!
        }
      } else {
        pointsChange = -penaltyPoints;
      }

      return {
        ...u,
        points: Math.max(0, u.points + pointsChange),
        challengesJoined: u.challengesJoined + 1,
        challengesCompleted: challengesCompDelta,
        totalStudyMinutes: u.totalStudyMinutes + (userSub ? challenge.durationMinutes : 0),
      };
    });

    const updatedChallenge: Challenge = {
      ...challenge,
      status: 'completed',
      submissions: subs,
    };

    onUpdateChallenge(updatedChallenge);
    onUpdateUsers(updatedUsers);
    onAddLog('إنهاء واحتساب التحدي', `تم إنهاء واحتساب رصيد النقاط لتحدي ${challenge.title}: مكافأة +20 | عقوبة -${penaltyPoints}`);
  };

  // Peer status lists calculation
  const getParticipantStatus = (userId: string) => {
    const sub = challenge.submissions.find((s) => s.userId === userId);
    if (sub) {
      return { label: '✅ سلّم الإثبات', color: 'text-success bg-success/10' };
    }
    if (timerFinished) {
      return { label: '❌ لم يسلّم وتخلف', color: 'text-danger bg-danger/10' };
    }
    return { label: '⏳ في المذاكرة الآن', color: 'text-warning bg-warning/10' };
  };

  // Custom visual color for stars
  const renderStarsRating = (userId: string, currentScore: number, editable = false) => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentScore;
          return (
            <Star
              key={star}
              size={18}
              className={`transition-colors ${
                isFilled ? 'text-warning fill-warning' : 'text-white/20'
              } ${editable ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
            />
          );
        })}
      </div>
    );
  };

  const isTimeAlert = timeLeftMs > 0 && timeLeftMs < 60000; // < 1 minute pulsing

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Header back */}
      <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm relative z-10">
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-slate-200/80 text-slate-800 text-xs font-semibold rounded-full border hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />عرض صفحة المجموعة
        </button>
        
        <div className="flex items-center gap-3">
          {!isCompletedChallenge && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من إنهاء جلسة المذاكرة مبكراً؟ سيتم خصم 10 نقاط من رصيدك فوراً كعقوبة لعدم الاستمرار.')) {
                  // Deduct 10 points immediately
                  const penalty = 10;
                  const updatedUsers = users.map((u) => {
                    if (u.id === currentUser.id) {
                      return {
                        ...u,
                        points: Math.max(0, u.points - penalty)
                      };
                    }
                    return u;
                  });
                  onUpdateUsers(updatedUsers);
                  onAddLog('انسحاب مبكر', `قام ${currentUser.name} بالانسحاب مبكراً من التحدي وتم خصم ${penalty} نقطة.`);
                  onLeaveRoom();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
              title="انسحاب مع خصم نقاط"
            >
              <AlertTriangle size={14} /> الخروج وإنهاء مبكر (-10 نقطة)
            </button>
          )}
          <span className="hidden md:inline-flex text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 text-slate-500 rounded-full font-mono font-medium shadow-inner tracking-tight">
            ID: #{challenge.id.substring(challenge.id.length - 6)}
          </span>
        </div>
      </div>

      {/* Main Study Room Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

        {/* Challenge details */}
        <div className="space-y-1">
          <span className="text-3xl">⚡</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 font-sans">
            غرفة المذاكرة والتحكيم: {challenge.title}
          </h1>
          <p className="text-xs text-slate-500 font-sans flex items-center justify-center gap-2">
            <Book size={14} className="text-rose-500" />
            <span>المادة: <strong>{challenge.subject}</strong></span>
            <span>•</span>
            <span>المطلوب: {challenge.pageCount} صفحة</span>
          </p>
        </div>

        {/* Big Countdown Timer */}
        {!isCompletedChallenge ? (
          <div className="space-y-4 py-6 relative z-10 select-none">
            <div className="flex justify-center items-center gap-2 md:gap-4 flex-row-reverse" dir="ltr">
              {(() => {
                const totalSecs = Math.floor(timeLeftMs / 1000);
                const hrs = timerFinished ? 0 : Math.floor(totalSecs / 3600);
                const mins = timerFinished ? 0 : Math.floor((totalSecs % 3600) / 60);
                const secs = timerFinished ? 0 : totalSecs % 60;
                
                const pad = (n: number) => String(n).padStart(2, '0');
                
                const TimeBox = ({ value, label }: { value: string, label: string }) => (
                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-24 md:w-32 md:h-36 bg-slate-900 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden border-2 border-slate-700/50 ${isTimeAlert ? 'animate-timer-pulse border-rose-500/50' : ''}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                      <span className={`text-4xl md:text-7xl font-black font-mono tracking-tighter relative z-10 drop-shadow-lg ${isTimeAlert ? 'text-rose-500' : 'text-blue-400'}`}>
                        {value}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest">{label}</span>
                  </div>
                );

                return (
                  <>
                    <TimeBox value={pad(hrs)} label="ساعة" />
                    <span className={`text-4xl md:text-6xl font-bold pb-6 ${isTimeAlert ? 'text-rose-400' : 'text-blue-300'}`}>:</span>
                    <TimeBox value={pad(mins)} label="دقيقة" />
                    <span className={`text-4xl md:text-6xl font-bold pb-6 ${isTimeAlert ? 'text-rose-400' : 'text-blue-300'}`}>:</span>
                    <TimeBox value={pad(secs)} label="ثانية" />
                  </>
                );
              })()}
            </div>
            
            {!timerFinished ? (
              <p className="text-xs text-emerald-600 font-sans flex items-center justify-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                مؤقت التركيز نشط حالياً... لا تشغلك الملهيات! 🤫
              </p>
            ) : (
              <div className="space-y-1">
                <span className="text-xs text-red-400 font-bold block">🚨 انتهى وقت التركيز والدراسة!</span>
                <p className="text-xs text-slate-500 font-sans">
                  زمن تسليم الإثبات والتقييم ينتهي بعد: <strong className="text-[#FFB830] font-mono">{formatGraceTimeToken(graceTimeLeftS)}</strong> دقيقة
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 space-y-1 relative z-10 bg-success/10 border border-success/20 rounded-2xl max-w-lg mx-auto">
            <span className="text-3xl block">🎉</span>
            <h4 className="font-bold text-success text-sm md:text-base font-sans">اكتمل التحدي وتم توزيع النقاط والمكافآت بنجاح!</h4>
            <p className="text-xs text-slate-500">شاهد ملخص تسليم وإثباتات الطلاب والتقييمات أدناه.</p>
          </div>
        )}

        {/* Quick Points Info cards */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs">
          <div className="bg-slate-50 border-slate-200/50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="block text-slate-500">مكافأة التسريب</span>
            <span className="font-bold text-success mt-1 block font-mono">+{challenge.pointsReward} نقطة</span>
          </div>

          <div className="bg-slate-50 border-slate-200/50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="block text-slate-500">عقوبة الكسل والتغيب</span>
            <span className="font-bold text-red-400 mt-1 block font-mono">-{challenge.pointsPenalty} نقطة</span>
          </div>
        </div>

        {/* Unified Majestic Focus Audio & Quran Player */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 border-2 border-amber-500/30 text-right shadow-2xl space-y-5">
            
            {/* Elegant Header with Active Track State */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="text-xl animate-pulse">🕌</span>
                  <h3 className="text-sm font-black font-sans tracking-wide">الرواَق الصوتي للتركيز والسكينة المباركة 🌿</h3>
                </div>
                <p className="text-[10px] text-slate-300 font-sans">اختر قرّاء المصحف، ارفع تلاوتك الخاصة، وعزز تركيزك بالقوانين الصوتية</p>
              </div>
              
              {/* Media Player status badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-black/40 px-3 py-1.5 rounded-2xl border border-white/5">
                {(quranPlayState === 'playing' || isAudioPlaying) ? (
                  <>
                    {/* Active Waveform */}
                    <div className="flex items-end gap-1 h-3 opacity-90">
                      <span className="w-0.5 bg-amber-400 rounded-full h-2.5 animate-pulse" />
                      <span className="w-0.5 bg-amber-300 rounded-full h-4 animate-pulse" />
                      <span className="w-0.5 bg-yellow-400 rounded-full h-3 animate-pulse" />
                    </div>
                    <span className="text-[9px] text-amber-200 font-bold font-sans animate-pulse">
                      {quranPlayState === 'playing' ? `تلاوة نشطة: ${quranReciterName.split(' ').pop() || quranReciterName}` : 'مؤثر خلفي نشط'}
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] text-slate-400 font-sans">البث الصوتي متوقف</span>
                )}
              </div>
            </div>

            {/* Navigational Tabs (Quran / Custom Upload / Ambient Sounds) */}
            <div className="flex bg-black/30 p-1 rounded-xl border border-white/5 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setAudioTab('quran')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  audioTab === 'quran'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md'
                    : 'text-slate-350 hover:text-white hover:bg-white/5'
                }`}
              >
                المصحف الشريف
              </button>
              <button
                type="button"
                onClick={() => setAudioTab('custom')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  audioTab === 'custom'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                تلاواتي وملفاتي
              </button>
              <button
                type="button"
                onClick={() => setAudioTab('ambient')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  audioTab === 'ambient'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                مؤثرات طبيعية
              </button>
            </div>

            {/* TAB CONTENT 1: HOLY QURAN SELECTOR */}
            {audioTab === 'quran' && (() => {
              const filteredReciters = QURAN_RECITERS.filter(rec =>
                rec.name.toLowerCase().includes(reciterSearch.toLowerCase()) ||
                rec.desc.toLowerCase().includes(reciterSearch.toLowerCase())
              );

              const filteredSurahs = QURAN_SURAHS.filter(s =>
                s.name.toLowerCase().includes(surahSearch.toLowerCase()) ||
                s.id.toLowerCase().includes(surahSearch.toLowerCase())
              );

              return (
                <div className="space-y-4">
                  {/* Visual grid of Quran Reciters */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[11px] text-amber-200/90 font-bold">١. اختر القارئ من القائمة أدناه:</label>
                      <div className="relative w-full">
                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-amber-400">
                          <Search size={14} />
                        </span>
                        <input
                          type="text"
                          value={reciterSearch}
                          onChange={(e) => setReciterSearch(e.target.value)}
                          placeholder="ابحث عن اسم القارئ (المنشاوي، الباسط، العفاسي...)"
                          className="bg-black/40 text-xs text-white placeholder-slate-400 rounded-xl pr-9 pl-3 py-1.5 border border-white/10 text-right focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 w-full transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {filteredReciters.length > 0 ? (
                        filteredReciters.map((rec) => (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() => {
                              setSelectedWebReciter(rec.id);
                              // Auto trigger play if we can!
                              const surahObj = QURAN_SURAHS.find(s => s.id === selectedWebSurah) || QURAN_SURAHS[0];
                              const playUrl = surahObj.id === 'radio' ? rec.radio : `${rec.server}${surahObj.file}`;
                              playQuranTrack(playUrl, rec.name, surahObj.name);
                            }}
                            className={`flex items-start gap-2.5 p-2 rounded-2xl text-right transition-all border text-xs cursor-pointer ${
                              selectedWebReciter === rec.id
                                ? 'bg-amber-500/10 border-amber-400 text-amber-200 shadow-bold'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] w-7 h-7 bg-amber-500/20 text-amber-200 rounded-full flex items-center justify-center font-bold shrink-0 font-sans">
                              {rec.name.split(' ').pop()?.substring(0, 2) || <Book size={11} />}
                            </span>
                            <div className="space-y-0.5">
                              <p className="font-bold text-[11px] font-sans">{rec.name}</p>
                              <p className="text-[9px] text-slate-400 leading-snug">{rec.desc}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-1 sm:col-span-2 text-center text-slate-400 text-xs py-6">
                          ⚠️ عذراً، لم نجد نتائج تطابق اسم هذا القارئ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Surah / Tilaawah selection row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-[11px] text-amber-200/90 font-bold">٢. اختر السورة المباركة (١١٤ سورة كاملة):</label>
                        <div className="relative w-full">
                          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-amber-400">
                            <Search size={13} />
                          </span>
                          <input
                            type="text"
                            value={surahSearch}
                            onChange={(e) => setSurahSearch(e.target.value)}
                            placeholder="ابحث عن السورة (البقرة، يس..)"
                            className="bg-black/40 text-[10px] text-white placeholder-slate-400 rounded-lg pr-8 pl-2 py-1 border border-white/10 text-right focus:outline-none focus:border-amber-500 w-full"
                          />
                        </div>
                      </div>
                      
                      <select
                        value={selectedWebSurah}
                        onChange={(e) => {
                          const surahVal = e.target.value;
                          setSelectedWebSurah(surahVal);
                          
                          // play right away upon selection change
                          const reciterObj = QURAN_RECITERS.find(r => r.id === selectedWebReciter) || QURAN_RECITERS[0];
                          const surahObj = QURAN_SURAHS.find(s => s.id === surahVal) || QURAN_SURAHS[0];
                          const playUrl = surahObj.id === 'radio' ? reciterObj.radio : `${reciterObj.server}${surahObj.file}`;
                          playQuranTrack(playUrl, reciterObj.name, surahObj.name);
                        }}
                        className="w-full bg-slate-850 text-white rounded-xl py-2 px-3 border border-white/10 text-xs text-right cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {filteredSurahs.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                            {s.name} {s.id !== 'radio' ? `(رقم ${parseInt(s.id)})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Big Play Shortcut with selected setup */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const reciterObj = QURAN_RECITERS.find(r => r.id === selectedWebReciter) || QURAN_RECITERS[0];
                          const surahObj = QURAN_SURAHS.find(s => s.id === selectedWebSurah) || QURAN_SURAHS[0];
                          const playUrl = surahObj.id === 'radio' ? reciterObj.radio : `${reciterObj.server}${surahObj.file}`;
                          playQuranTrack(playUrl, reciterObj.name, surahObj.name);
                        }}
                        className="w-full h-10 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse-slow"
                      >
                        <span>تشغيل السورة بصوت القارئ المختار</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT 2: CUSTOM FILES AND USER SOUND UPLOADER */}
            {audioTab === 'custom' && (
              <div className="space-y-4">
                {/* Upload Local File Trigger & URL Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  
                  {/* Upload column */}
                  <div className="space-y-2 text-center flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-white/10 pb-3 md:pb-0 md:pl-4">
                    <label className="block text-[10px] text-amber-200/90 font-bold mb-1">🎙️ اسحب أو ارفع ملف صوتي قرآن من جهازك:</label>
                    <div className="relative w-full h-16 border border-dashed border-white/30 hover:border-amber-400 rounded-xl transition-all flex items-center justify-center bg-black/30 cursor-pointer overflow-hidden group">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fileUrl = URL.createObjectURL(file);
                          const cleanName = file.name.replace(/\.[^/.]+$/, "");
                          const newTrack = {
                            id: 'upload-' + Date.now(),
                            name: cleanName + ' 🔊',
                            url: fileUrl,
                            reciter: 'تسجيل قارئ محلي مثبت'
                          };
                          setCustomQuranTracks(prev => [newTrack, ...prev]);
                          playQuranTrack(newTrack.url, newTrack.reciter, newTrack.name);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                        <span className="text-xl">📁</span>
                        <span className="text-[10px] text-slate-300 group-hover:text-amber-300 font-bold transition-colors">
                          اضغط هنا لاختيار ملف MP3/صوت
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* URL custom form column */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCustomTrackName.trim() || !newCustomTrackUrl.trim()) return;
                      const newTrack = {
                        id: 'url-' + Date.now(),
                        name: newCustomTrackName,
                        url: newCustomTrackUrl,
                        reciter: 'بث ويب خارجي مخصص'
                      };
                      setCustomQuranTracks(prev => [newTrack, ...prev]);
                      setNewCustomTrackName('');
                      setNewCustomTrackUrl('');
                      playQuranTrack(newTrack.url, newTrack.reciter, newTrack.name);
                    }}
                    className="space-y-2 text-right"
                  >
                    <label className="block text-[10px] text-amber-200/90 font-bold">🌐 أو أضف رابط صوت بث مباشر أو ملف MP3:</label>
                    <input
                      type="text"
                      value={newCustomTrackName}
                      onChange={(e) => setNewCustomTrackName(e.target.value)}
                      placeholder="امش المنشاوي مثلاً، أو تلاوة الصباح"
                      className="w-full bg-slate-800 text-white rounded-lg py-1.5 px-3 border border-white/10 text-[11px] placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="url"
                      value={newCustomTrackUrl}
                      onChange={(e) => setNewCustomTrackUrl(e.target.value)}
                      placeholder="ضع رابط الصوت المباشر http://..."
                      className="w-full bg-slate-800 text-white rounded-lg py-1.5 px-3 border border-white/10 text-[10px] placeholder-slate-400 focus:outline-none focus:border-amber-500 text-left"
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg shadow cursor-pointer transition-all"
                    >
                      ➕ حفظ وتشغيل الرابط القرآني المخصص
                    </button>
                  </form>
                </div>

                {/* Custom Library List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-300 font-bold">خزانة التلاوات المضافة لديك ({customQuranTracks.length}):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                    {customQuranTracks.map(track => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2 bg-black/40 hover:bg-black/65 border border-white/5 rounded-xl text-xs gap-2"
                      >
                        <div className="text-right overflow-hidden">
                          <p className="font-bold text-[10px] truncate">{track.name}</p>
                          <p className="text-[8px] text-amber-300/80 truncate">{track.reciter}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => playQuranTrack(track.url, track.reciter || 'تلاوة خاصة', track.name)}
                            className="bg-amber-400/20 text-amber-300 px-2 py-1 rounded hover:bg-amber-400/35 transition-all text-[9.5px] font-bold cursor-pointer"
                          >
                            ▶️ تشغيل
                          </button>
                          {track.id !== 'default-1' && (
                            <button
                              type="button"
                              onClick={() => setCustomQuranTracks(prev => prev.filter(t => t.id !== track.id))}
                              className="text-red-400 font-bold hover:text-red-305 px-1 text-[11px] cursor-pointer"
                              title="حذف"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: ORIGINAL AMBIENT FOCUS SOUNDS */}
            {audioTab === 'ambient' && (
              <div className="space-y-4">
                {currentUser.membershipTier === 'gold' || currentUser.membershipTier === 'silver' ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-300 leading-relaxed font-sans mt-1">
                      * اضغط على ثيمات التركيز وتوليد الأصوات الاصطناعية النقية لعزل فصوص المخ وزيادة استيعاب الذاكرة:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => playSyntheticTrack('rain')}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold font-sans transition-all cursor-pointer text-center ${
                          isAudioPlaying && activeAudioTrack === 'rain'
                            ? 'bg-blue-600 text-white shadow-md border-transparent'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        🌧️ صوت المطر
                      </button>
                      <button
                        type="button"
                        onClick={() => playSyntheticTrack('ocean')}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold font-sans transition-all cursor-pointer text-center ${
                          isAudioPlaying && activeAudioTrack === 'ocean'
                            ? 'bg-blue-600 text-white shadow-md border-transparent'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        🌊 موج الشاطئ
                      </button>
                      <button
                        type="button"
                        onClick={() => playSyntheticTrack('drone')}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold font-sans transition-all cursor-pointer text-center ${
                          isAudioPlaying && activeAudioTrack === 'drone'
                            ? 'bg-blue-600 text-white shadow-md border-transparent'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        🌌 تأمل كوني
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-amber-500/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 text-right text-white">
                    <div className="space-y-0.5 flex-1 pr-1">
                      <span className="text-xs font-black text-amber-250 flex items-center gap-1">
                        🔒 ميزة مؤثرات طبيعية (Premium Ambient)
                      </span>
                      <span className="text-[10px] text-slate-300 block leading-relaxed font-sans">
                        ميزة توليد أصوات التركيز الحية (الموج والمطر والتأمل اللاسلكي) للرتب الذهبية والفضية.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('profile')}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] rounded-xl shadow shrink-0 cursor-pointer hover:shadow-md transition-all animate-bounce"
                    >
                      💡 فتح الميزة
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* UNIFIED SOLEMN PLAYBACK CONTROLLER OR ACTION ROW */}
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                {/* Unified Master Stop */}
                <button
                  type="button"
                  onClick={() => {
                    stopAllSyntheticBuffers();
                    fullStopQuranAudio();
                  }}
                  className="px-3.5 py-2 bg-red-650 hover:bg-red-700 text-white font-heavy text-[11px] rounded-xl transition-all cursor-pointer shadow-md select-none"
                >
                  🔇 إيقاف الصوت كلياً
                </button>

                {/* Dynamic play pause toggle for Quran */}
                {quranAudioRef.current && (
                  <button
                    type="button"
                    onClick={toggleQuranPlay}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-heavy text-[11px] rounded-xl transition-all cursor-pointer shadow-md select-none"
                  >
                    {quranPlayState === 'playing' ? '⏸️ إيقاف مؤقت' : '▶️ استئناف التلاوة'}
                  </button>
                )}
              </div>

              {/* Volume Controller Slider - Works beautifully for Live Streams & Audio */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] text-slate-300 font-bold">🔊 درجة هندسة الصوت:</span>
                <div className="flex items-center gap-3 bg-slate-800/80 rounded-xl p-1 border border-white/5">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuranVolume(Math.max(0, Number((quranVolume - 0.05).toFixed(2)))); }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg text-white font-bold transition-all disabled:opacity-50 cursor-pointer z-20 relative pointer-events-auto shadow-md"
                    disabled={quranVolume <= 0}
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-amber-400 w-10 text-center select-none">
                    {Math.round(quranVolume * 100)}%
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuranVolume(Math.min(1, Number((quranVolume + 0.05).toFixed(2)))); }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-amber-600 active:bg-amber-500 rounded-lg text-white font-bold transition-all disabled:opacity-50 cursor-pointer z-20 relative pointer-events-auto shadow-md"
                    disabled={quranVolume >= 1}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Loading indicator */}
            {quranLoading && (
              <div className="text-center font-bold text-[10px] text-amber-300 animate-pulse">
                ⏳ جاري تحميل الاتصال بالسيرفر القرآني وتجهيز الموجة الصوتية بأقصى جودة...
              </div>
            )}

            {/* Now Playing visual feedback */}
            {quranPlayState !== 'stopped' && quranTrackName && (
              <div className="text-center text-[10px] text-amber-200/90 font-sans tracking-wide bg-amber-500/5 py-1 px-3 border border-amber-500/10 rounded-xl">
                👤 القارئ الفاضل: <strong className="text-white font-black">{quranReciterName}</strong> | 📖 تلاوة: <strong className="text-white font-black">{quranTrackName}</strong>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Grid: Submission Form and Live Participant Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Evaluation Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Submission and Grading View */}
          {!isCompletedChallenge && timerFinished && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-md text-slate-800 font-sans flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                رفع خلاصة المذاكرة وصورة الدليل العملي
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                اكتب بياناً موجزاً بما أنجزته لكي يتسنى لزملائك الطلاب التأكد من صدق ونتاج دراستك وتقييمك بعدالة تامة.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmitProof} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-sans mb-1.5">ملخص ما ذاكرته في هذه الجلسة</label>
                    <textarea
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="مثال: قمت بقراءة أول 20 صفحة من الفصل ولخصت فكرة ظواهر الاستقطاب في الفيزياء، وأعددت رسمة بيانية مبدئية..."
                      className="w-full h-24 bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-sans mb-1.5">ارفع صورة إثبات من جهازك (اختياري)</label>
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
                      />
                      <Upload className="text-slate-500 group-hover:text-blue-600" size={20} />
                      <span className="text-xs text-slate-500">اسحب صورة حلك أو اختر ملف (حتى 5 ميجا)</span>
                      <span className="text-[10px] text-slate-500/60">مسموح بكل الأحجام وسيتم ضغطها تلقائياً</span>
                    </div>

                    {fileWarning && (
                      <p className="text-xs text-warning font-sans mt-2 flex items-center gap-1">
                        <AlertTriangle size={14} /> {fileWarning}
                      </p>
                    )}

                    {proofFileBase64 && (
                      <div className="mt-3 p-2 bg-slate-50 border-slate-200/30 rounded-lg border border-slate-200 flex items-center gap-2">
                        <span className="text-xs text-success">✔ تم تجهيز الصورة بنجاح وتجهيز الترانزستور للرفع الرقمي.</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-all cursor-pointer"
                  >
                    إرسال وتسجيل إثبات الحضور
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-success/10 border border-success/20 rounded-xl space-y-1">
                  <span className="text-xs text-success font-bold flex items-center gap-1">
                    <CheckCircle2 size={16} /> تم استلام وحفظ إثبات حضورك للتحدي بنجاح!
                  </span>
                  <p className="text-[10px] text-slate-500">بإمكانك المتابعة وتقييم إثباتات الزملاء بالأسفل عند توفرها.</p>
                </div>
              )}
            </div>
          )}

          {/* RATING PANEL OF COLLEAGUES SUBMISSIONS */}
          {timerFinished && submitted && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-md text-slate-800 font-sans flex items-center gap-2">
                <Star className="text-warning fill-warning" size={20} />
                تحكيم وتقييم مشاركات وأمانة الزملاء الطلاب
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                تفقد إثباتات باقي الزملاء بالقرية الدراسية وصوّت لهم حسب دقة حضورهم وموثوقيته. (لا يمكنك تقييم نفسك!)
              </p>

              <div className="space-y-4">
                {challenge.participants
                  .filter((pId) => pId !== currentUser.id)
                  .map((peerId) => {
                    const peerObj = users.find((u) => u.id === peerId);
                    const peerSub = challenge.submissions.find((s) => s.userId === peerId);
                    const currentRating = userRatings[peerId];

                    return (
                      <div key={peerId} className="bg-slate-50 border-slate-200/30 border border-slate-200 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2.5 justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg w-7 h-7 bg-slate-50 border-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                              {peerObj?.avatar?.match(/^(http|data:)/) ? <img src={peerObj?.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (peerObj?.avatar)}
                            </span>
                            <span className="text-xs font-bold text-slate-800 font-sans flex flex-wrap items-center gap-1.5 flex-row">
                              {peerObj?.name}
                              {peerObj?.membershipTier === 'gold' && (
                                <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق ذهبي">
                                  موثق ذهبي
                                </span>
                              )}
                              {peerObj?.membershipTier === 'silver' && (
                                 <span className="text-[8px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق فضي">
                                   موثق فضي
                                 </span>
                              )}
                            </span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[10px] ${peerSub ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'}`}>
                            {peerSub ? 'سلّم الإثبات' : 'لم يسلّم بعد'}
                          </span>
                        </div>

                        {peerSub ? (
                          <div className="space-y-3.5 pt-1">
                            <div className="p-3 bg-white/80 rounded-lg text-xs font-sans text-slate-800 leading-relaxed relative border border-slate-100">
                              <span className="absolute -top-1.5 -right-1 bg-primary/20 text-blue-600 text-[8px] font-bold px-1.5 py-0.2 rounded border border-primary/25">الخلاصة المرفوعة</span>
                              <p className="pt-1.5">{peerSub.proofText}</p>
                              {peerSub.proofFile && (
                                <div className="mt-3.5 rounded-lg overflow-hidden border border-slate-200 max-h-48 flex justify-center bg-black/40">
                                  <img 
                                    src={peerSub.proofFile} 
                                    alt="دليل الزميل" 
                                    className="object-contain max-h-48"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Grading Boolean select */}
                            {!ratingsSubmitted ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
                                <span className="text-[10px] text-slate-500 font-sans font-bold">هل تثق بأن الزميل أتم المذاكرة بنجاح؟</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleVote(peerId, true)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentRating === true ? 'bg-success text-white' : 'bg-success/10 text-success border border-success/20 hover:bg-success/20'}`}
                                  >
                                    <Check size={14} className="inline mr-1" />
                                    <span>نعم، اعتمد</span>
                                  </button>
                                  <button
                                    onClick={() => handleVote(peerId, false)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentRating === false ? 'bg-rose-500 text-white' : 'bg-rose-50 border border-rose-220 text-rose-500 hover:bg-rose-100'}`}
                                  >
                                    <AlertTriangle size={14} className="inline mr-1" />
                                    <span>لا، رفض ومراجعة</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 text-[10px] text-success font-sans bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                                <span>✔ تصويتك المسجل:</span>
                                <span className={currentRating === true ? 'text-success font-bold' : 'text-rose-500 font-bold'}>
                                  {currentRating === true ? 'مقبول ومعتمد ✅' : 'مرفوض ❌'}
                                </span>
                              </div>
                            )}

                            {/* Cumulative rejections & Jury Court trigger */}
                            <div className="mt-2.5 p-3 rounded-xl border bg-orange-50/50 border-orange-100/60 flex flex-col sm:flex-row justify-between items-center gap-2">
                              <span className="text-[10px] text-orange-950 font-bold font-sans">
                                📊 عدد معترضي الإثبات: <span className="text-rose-600 font-mono text-xs font-bold">{(currentRating === false ? 1 : 0) + (simulatedNoVotesCount[peerId] || 0)}</span> من زملائه.
                              </span>
                              <div className="flex gap-2.5">
                                <button
                                  onClick={() => {
                                    setSimulatedNoVotesCount(prev => ({
                                      ...prev,
                                      [peerId]: (prev[peerId] || 0) + 1
                                    }));
                                  }}
                                  className="px-2 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                                  title="محاكاة تصويت لا إضافي من جروب الأصدقاء"
                                >
                                  ➕ اعتراض إضافي (محاكاة) ⛔
                                </button>
                                <button
                                  onClick={() => {
                                    setJuryCaseUserId(peerId);
                                  }}
                                  className={`px-3 py-1 font-sans text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                                    ((currentRating === false ? 1 : 0) + (simulatedNoVotesCount[peerId] || 0)) >= 2
                                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                                >
                                  <span>⚖️ افتح المحكمة ومراجعة القضاء</span>
                                  {((currentRating === false ? 1 : 0) + (simulatedNoVotesCount[peerId] || 0)) >= 2 && (
                                    <span className="bg-white text-rose-600 font-extrabold text-[8px] px-1 py-0.2 rounded animate-bounce">
                                      طوارئ ⚠️
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-sans italic bg-slate-50 border-slate-200/10 p-3 rounded-lg text-center">
                            لم يقدم هذا الزميل ملخص دراسته للتحدي بعد. لن تفعل حقول التقييم لصالحه.
                          </p>
                        )}
                      </div>
                    );
                  })}

                {challenge.participants.filter(pId => pId !== currentUser.id).length === 0 && (
                  <p className="text-xs text-slate-500 text-center italic bg-slate-50 border-slate-200/10 p-4 rounded-xl">
                    لا يوجد مشاركين آخرين معك بهذا التحدي لتقيمهم.
                  </p>
                )}

                {!ratingsSubmitted && challenge.participants.filter(pId => pId !== currentUser.id).length > 0 && (
                  <button
                    onClick={handleSubmitRatings}
                    className="w-full py-2 bg-gradient-to-l from-[#43D787] to-emerald-600 text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-md select-none"
                  >
                    حفظ وتأكيد تقييم الزملاء والنتائج
                  </button>
                )}
              </div>
            </div>
          )}

          {/* COMPLETED RESULTS DISPLAY */}
          {isCompletedChallenge && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-md text-slate-800 font-sans">لوحة نتائج دراسة وتحكيم جلستكم</h3>
              
              <div className="space-y-4 shadow-inner">
                {challenge.participants.map((pId) => {
                  const pUser = users.find((u) => u.id === pId);
                  const pSub = challenge.submissions.find((s) => s.userId === pId);

                  return (
                    <div key={pId} className="p-4 bg-slate-50 border-slate-200/30 rounded-xl space-y-3 border border-slate-200">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xl w-6 h-6 bg-slate-50 border-slate-200 rounded-full flex items-center justify-center overflow-hidden">{pUser?.avatar?.match(/^(http|data:)/) ? <img src={pUser?.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (pUser?.avatar)}</span>
                          <span className="font-bold text-slate-800 font-sans flex flex-wrap items-center gap-1.5">
                            {pUser?.name}
                            {pUser?.membershipTier === 'gold' && (
                              <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق ذهبي">
                                موثق ذهبي
                              </span>
                            )}
                            {pUser?.membershipTier === 'silver' && (
                               <span className="text-[8px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق فضي">
                                 موثق فضي
                               </span>
                            )}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pSub ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {pSub ? `حضر بنجاح المكافأة: +${challenge.pointsReward}ن` : `تغيب العقوبة: -${challenge.pointsPenalty}ن`}
                        </span>
                      </div>

                      {pSub && (
                        <div className="text-xs text-slate-500 font-sans bg-slate-1000 p-3 rounded-lg leading-relaxed relative">
                          <p>{pSub.proofText}</p>
                          {pSub.proofFile && (
                            <div className="mt-3 overflow-hidden border border-slate-200 rounded-lg max-h-40 flex justify-center bg-black/40">
                              <img src={pSub.proofFile} alt="دليل الزملاء" className="object-contain max-h-40" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                            <span>حالة تقييم واعتماد التحدي:</span>
                            <div className="flex items-center gap-1">
                              {pSub.status === 'approved' && <span className="px-2 py-0.5 rounded text-success bg-success/10 font-bold">معتمد ومقبول ✅</span>}
                              {pSub.status === 'rejected_pending_admin' && <span className="px-2 py-0.5 rounded text-warning bg-warning/10 font-bold">مرفوض وبانتظار الإدارة ⏳</span>}
                              {pSub.status === 'admin_approved' && <span className="px-2 py-0.5 rounded text-blue-600 bg-blue-50 font-bold">تم قبوله من الإدارة 🛡️</span>}
                              {pSub.status === 'admin_rejected' && <span className="px-2 py-0.5 rounded text-rose-500 bg-rose-50 font-bold">مرفوض نهائياً ❌</span>}
                              {(!pSub.status || pSub.status === 'pending') && <span className="px-2 py-0.5 rounded text-slate-500 bg-slate-100 font-bold">بانتظار المراجعة...</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Participant list & timings indicator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-md text-slate-800 font-sans">قائمة الطلاب الحضور ({challenge.participants.length})</h3>
            
            <div className="space-y-3 pt-1">
              {challenge.participants.map((pId) => {
                const participant = users.find((u) => u.id === pId);
                const statusInfo = getParticipantStatus(pId);
                return (
                  <div key={pId} className="flex items-center justify-between p-3 bg-slate-50 border-slate-200/30 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg w-8 h-8 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                        {participant?.avatar?.match(/^(http|data:)/) ? <img src={participant?.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (participant?.avatar)}
                      </span>
                      <div>
                        <h4 className="font-sans font-bold text-xs text-slate-800 flex flex-wrap items-center gap-1.5">
                          {participant?.name}
                          {participant?.membershipTier === 'gold' && (
                            <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق ذهبي">
                              موثق ذهبي
                            </span>
                          )}
                          {participant?.membershipTier === 'silver' && (
                             <span className="text-[8px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق فضي">
                               موثق فضي
                             </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-500 block">{participant?.email}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs text-slate-500 font-sans leading-relaxed">
            <h4 className="font-bold text-slate-800">شروط تصفية نقاط التحدي</h4>
            <p>1. تحتسب نقاط الجلسة (+{challenge.pointsReward}ن) فوراً وترحل للحساب عند تسليم الإثبات والتقييم.</p>
            <p>2. يتلقى المتأخرون أو من ينسحب عقوبة حاسمة (-{challenge.pointsPenalty}ن) لضمان موثوقية وقت الأصدقاء.</p>
            <p>3. تجري مراجعة متوسط التقييمات يدوياً أو يتم تطبيقها تلقائياً.</p>
          </div>
        </div>

      </div>

      {juryCaseUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-90 backdrop-blur-md p-4 animate-fade-in text-right" dir="rtl">
          <div className="bg-white rounded-3xl border-4 border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5 relative overflow-hidden text-right leading-relaxed font-sans">
            {/* Top thematic judge bar */}
            <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-indigo-600"></div>
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="p-3 bg-slate-100 text-slate-800 rounded-2xl border-2 border-slate-300 shadow-sm text-2xl animate-bounce">
                🏛️🔨
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900">🏛️ قاعة محكمة المذاكرة العادلة</h3>
                <p className="text-[11px] text-slate-500">مراجعة الأدلة بعين القضاة النزهاء وإصدار الأحكام على المتكاسلين ⚖️</p>
              </div>
            </div>

            {(() => {
              const offender = users.find(u => u.id === juryCaseUserId);
              const sub = challenge.submissions.find(s => s.userId === juryCaseUserId);
              
              const playGavelSound = () => {
                try {
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  if (!AudioContextClass) return;
                  const ctx = new AudioContextClass();
                  const strike = (delay: number, pitch = 140) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(pitch, ctx.currentTime + delay);
                    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + delay + 0.12);
                    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.15);
                  };
                  strike(0, 150);
                  strike(0.1, 140);
                } catch (e) {}
              };

              return (
                <div className="space-y-4">
                  {/* Offender profile */}
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                    <span className="text-xl w-10 h-10 bg-slate-200 border-2 border-slate-300 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      {offender?.avatar && (offender.avatar.startsWith('http') || offender.avatar.startsWith('data:')) ? <img src={offender?.avatar} alt="avatar" className="w-full h-full object-cover" /> : (offender?.avatar)}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-800">العضو المستدعى للمحاكمة: <span className="text-indigo-600">{offender?.name}</span></p>
                      <p className="text-[10px] text-slate-500">{offender?.email}</p>
                    </div>
                  </div>

                  {/* Submission Evidence */}
                  <div className="bg-amber-50 bg-opacity-65 border-2 border-dashed border-amber-200 p-4 rounded-2xl space-y-3">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">📂 ملف البيانات والأدلة الجنائية المقدمة:</span>
                    <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-amber-100 shadow-sm leading-relaxed font-medium">
                      "{sub?.proofText || "لم يكتب كلاماً توضيحياً ولا تبريراً لإثباته"}"
                    </p>
                    {sub?.proofFile && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 flex justify-center bg-black bg-opacity-40 shadow-md">
                        <img src={sub.proofFile} alt="دليل المحكمة" className="object-contain max-h-48" />
                      </div>
                    )}
                  </div>

                  {/* Defense line */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-600 font-extrabold mb-1">💬 عريضة دفاع المتهم وحجته الأخيرة أمام الأصدقاء:</label>
                    <textarea
                      value={juryDefenseText}
                      onChange={(e) => setJuryDefenseText(e.target.value)}
                      className="w-full text-xs bg-slate-50 border-2 border-slate-200 rounded-xl p-3 h-16 text-slate-800 resize-none focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Mock live Jury votes ratios for incredible thematic flair */}
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex justify-between items-center text-[10px] text-slate-600 font-bold">
                    <span>👥 تخمين تصويت المحلفين في القرية:</span>
                    <span className="text-rose-600">🔴 ٥٢٪ إدانة وعقوبة</span>
                    <span className="text-emerald-600">🟢 ٤٨٪ براءة مستحقة</span>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center italic">
                    💡 القضاء في مجموعات الدحيحة يحمي الموثوقية؛ إما البراءة والتقدير أو تدوير عجلة العقابات الصارمة فوراً!
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        playGavelSound();
                        const updatedSubmissions = challenge.submissions.map((s) => {
                          if (s.userId === juryCaseUserId) {
                            return { ...s, status: 'approved' as const };
                          }
                          return s;
                        });
                        setSimulatedNoVotesCount(prev => ({ ...prev, [juryCaseUserId]: 0 }));
                        setUserRatings(prev => ({ ...prev, [juryCaseUserId]: true }));
                        
                        onUpdateChallenge({
                          ...challenge,
                          submissions: updatedSubmissions
                        });
                        
                        onAddLog('محكمة المراجعة ✅', `تم تبرئة الطالب ${offender?.name} وإثبات نزاهته بالتصويت العادل بعد مطرقة القضاء!`);
                        setJuryCaseUserId(null);
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer select-none"
                    >
                      🟢 تبرئة الطالب وإعلان نزاهته 🔨
                    </button>
                    <button
                      onClick={() => {
                        playGavelSound();
                        const targetId = juryCaseUserId;
                        setJuryCaseUserId(null);
                        setTimeout(() => {
                          setPunishmentWheelUserId(targetId);
                        }, 250);
                      }}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer select-none"
                    >
                      🔴 إدانة كاملة وسوق المتهم لل wheel 🎡
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      playGavelSound();
                      setJuryCaseUserId(null);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-[10px] transition-all cursor-pointer"
                  >
                    تأجيل الفحص ومغادرة القاعة مؤقتاً
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {punishmentWheelUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 bg-opacity-95 backdrop-blur-md p-4 animate-fade-in text-right" dir="rtl">
          <div className="bg-slate-900 text-slate-100 rounded-[32px] border-4 border-amber-400 p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(251,191,36,0.3)] space-y-5 relative overflow-hidden font-sans">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 animate-pulse"></div>
            
            <div className="text-center space-y-1">
              <span className="text-3xl animate-bounce inline-block">🎡✨</span>
              <h3 className="text-lg font-black text-amber-200">عجلة الحظ الدوارة العقابية الكبرى</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">لأن الالتزام وكرامة المذاكرة أساس المجموعة، الخسران يلف العجلة ويلتزم بالعقوبة أمام الطلاب!</p>
            </div>

            {(() => {
              const offender = users.find(u => u.id === punishmentWheelUserId);
              
              const basePuns = [
                "تذاكر المرة الجاية والكاميرا مفتوحة. 🎥",
                "أنت اللي هتعمل ملخص الفصل الجاي وتنزله لصحابك. 📝",
                "بروفايلك يفضل عليه شارة 'الكسول' لمدة 24 ساعة. 🐌",
                "تقديم شرح صوتي 5 دقائق للفصل بالجروب. 🎙️"
              ];
              // Compile punishments including the target user's custom punishments!
              const offenderCustomPuns = offender?.customPunishments || [];
              const allPuns = [...basePuns, ...offenderCustomPuns];
              const segmentAngle = calculateSegmentAngle(allPuns.length);

              // Premium visual palette for wheel wedges (alternating colors)
              const colors = [
                "#ef4444", // Crimson Red
                "#2563eb", // Royal Blue
                "#10b981", // Emerald Green
                "#d97706", // Deep Amber
                "#7c3aed", // Rich Purple
                "#06b6d4", // Electric Cyan
                "#ec4899", // Neon Pink
                "#f97316"  // Dark Orange
              ];

              const handleSpinLaunch = () => {
                if (isWheelSpinning) return;
                
                setIsWheelSpinning(true);
                setWheelResultText(null);
                
                const chosenIndex = Math.floor(Math.random() * allPuns.length);
                setWheelSelectedIndex(chosenIndex);

                // Math calculation to land exactly on chosenIndex at top needle marker (0 degrees index start, clockwise)
                const spinsCount = 6;
                const targetWedgeAngle = (chosenIndex + 0.5) * segmentAngle;
                // Since 0 degree is top-aligned, segment point is clockwise.
                // Rotating by `360 - center_angle_of_wedge` aligns it straight up to the top!
                const landingAngle = 360 - targetWedgeAngle;
                
                // Slight random offset to make its destination look organic rather than exact center of wedge
                const offset = (Math.random() - 0.5) * (segmentAngle * 0.45);
                const targetAngle = wheelAngle + spinsCount * 360 + ((landingAngle - (wheelAngle % 360)) % 360 + 360) % 360 + offset;
                
                setWheelAngle(targetAngle);

                // Audio tick feedback ticking rapid decelerating sound ticks
                const duration = 4500;
                const start = Date.now();
                let lastDelay = 40;

                const playTick = (freq = 550, vol = 0.05, len = 0.06) => {
                  try {
                    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                    if (!AudioCtx) return;
                    const ctx = new AudioCtx();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    gain.gain.setValueAtTime(vol, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + len);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + len);
                  } catch (err) {}
                };

                const loop = () => {
                  const elapsed = Date.now() - start;
                  if (elapsed >= duration) {
                    // Celebration ding chime at finish!
                    playTick(880, 0.08, 0.15);
                    setTimeout(() => playTick(1100, 0.08, 0.25), 100);
                    return;
                  }
                  
                  // Decreasing tick pitch
                  const currentFreq = 620 - (elapsed / duration) * 250;
                  playTick(currentFreq, 0.05, 0.05);

                  // Progression multiplier slowing ticks down
                  const progress = elapsed / duration;
                  lastDelay = 50 + Math.pow(progress, 2.5) * 550;
                  setTimeout(loop, lastDelay);
                };

                setTimeout(loop, lastDelay);

                // Resolve values
                setTimeout(() => {
                  const result = allPuns[chosenIndex];
                  setWheelResultText(result);
                  setIsWheelSpinning(false);

                  if (result.includes("الكسول") || result.includes("24 ساعة")) {
                    const updatedUsers = users.map(u => {
                      if (u.id === punishmentWheelUserId) {
                        return { ...u, lazyExpiry: Date.now() + 24 * 60 * 60 * 1000 };
                      }
                      return u;
                    });
                    onUpdateUsers(updatedUsers);
                  }

                  const updatedSubmissions = challenge.submissions.map((s) => {
                    if (s.userId === punishmentWheelUserId) {
                      return { ...s, status: 'rejected_pending_admin' as const };
                    }
                    return s;
                  });
                  onUpdateChallenge({
                    ...challenge,
                    submissions: updatedSubmissions
                  });

                  onAddLog('عجلة الحظ 🎡🍿', `دارت عجلة العقاب على ${offender?.name} وقع عليه عقاب: ${result}`);
                }, duration);
              };

              return (
                <div className="space-y-5 text-center flex flex-col items-center">
                  
                  {/* Offender Header Tag */}
                  <div className="p-3 bg-slate-800 bg-opacity-70 rounded-2xl border border-slate-700/50 flex items-center gap-2 justify-center w-full">
                    <span className="text-sm">🔨💼</span>
                    <p className="text-[11px] text-slate-300">
                      اسم المذنب المستحق للدوران: <strong className="font-extrabold text-rose-400 text-xs">{offender?.name}</strong>
                    </p>
                  </div>

                  {/* PREMIUM SHINY CARNIVAL STYLE SVG WHEEL COMPONENT */}
                  <div className="relative flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-3xl border border-slate-800/80 w-full">
                    
                    {/* Golden/Amber bulbs overlay frame */}
                    <div className="relative w-64 h-64 flex items-center justify-center select-none">
                      
                      {/* Golden Outer Bezel */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-orange-500 p-[3px] shadow-2xl">
                        <div className="w-full h-full rounded-full bg-slate-900"></div>
                      </div>

                      {/* Rotatable wheel canvas */}
                      <div 
                        className="w-[244px] h-[244px] rounded-full overflow-hidden relative"
                        style={{
                          transform: `rotate(${wheelAngle}deg)`,
                          transition: isWheelSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.85, 0.2, 1)' : 'transform 0.4s ease-out'
                        }}
                      >
                        <svg className="w-full h-full" viewBox="0 0 280 280" style={{ transform: 'rotate(0deg)' }}>
                          {allPuns.map((pun, i) => {
                            const startAng = i * segmentAngle;
                            const endAng = (i + 1) * segmentAngle;
                            const fill = colors[i % colors.length];
                            return (
                              <g key={i}>
                                {/* Pie Wedge Segment */}
                                <path 
                                  d={drawSector(140, 140, 134, startAng, endAng)} 
                                  fill={fill}
                                  stroke="#1e293b" 
                                  strokeWidth="0.5"
                                />
                                {/* Bold separator white line */}
                                <line 
                                  x1={140} 
                                  y1={140} 
                                  x2={polarToCartesian(140, 140, 134, startAng).x} 
                                  y2={polarToCartesian(140, 140, 134, startAng).y} 
                                  stroke="#ffffff" 
                                  strokeWidth="2.5" 
                                  strokeOpacity="0.85"
                                />
                                {/* Radially mapped text outwards */}
                                <g transform={`rotate(${(i + 0.5) * segmentAngle} 140 140)`}>
                                  <text
                                    x={255}
                                    y={144}
                                    textAnchor="end"
                                    className="fill-white text-[10px] font-black select-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                                  >
                                    {pun.length > 20 ? pun.substring(0, 18) + '..' : pun}
                                  </text>
                                </g>
                              </g>
                            );
                          })}
                          
                          {/* Inner slate shadow ring */}
                          <circle cx="140" cy="140" r="38" fill="#0f172a" fillOpacity="0.4" stroke="#ffffff" strokeWidth="0.5" />
                        </svg>
                      </div>

                      {/* Overlaid Static Flashing carnival bulb indicators */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 280 280">
                        {(() => {
                          const bulbCount = 18;
                          return Array.from({ length: bulbCount }).map((_, idx) => {
                            const angle = (idx * 360) / bulbCount;
                            const rad = (angle * Math.PI) / 180;
                            const bx = 140 + 133 * Math.cos(rad);
                            const by = 140 + 133 * Math.sin(rad);
                            let color = "#fbbf24"; // amber-400
                            if (isWheelSpinning) {
                              color = (idx + Math.floor(Date.now() / 150)) % 2 === 0 ? "#ff2a5f" : "#fbbf24";
                            }
                            return (
                              <circle 
                                key={idx} 
                                cx={bx} 
                                cy={by} 
                                r="4" 
                                fill={color} 
                                className={isWheelSpinning ? "animate-pulse" : "opacity-90"}
                                style={{ filter: "drop-shadow(0px 0px 2px rgb(245,158,11))" }}
                              />
                            );
                          });
                        })()}
                      </svg>

                      {/* Needle static overlay pointing straight down at top (0-angle sector marker) */}
                      <div className="absolute top-1.5 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-rose-500 z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
                        <div className="absolute -top-[23px] -left-1.5 w-3 h-3 rounded-full bg-amber-300 border border-slate-900 animate-ping"></div>
                      </div>

                      {/* CENTRAL CLICKABLE SPIN BUTTON ON WHEEL (Exactly like websites) */}
                      <button
                        type="button"
                        disabled={isWheelSpinning}
                        onClick={handleSpinLaunch}
                        className="absolute w-15 h-15 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-4 border-slate-950 text-slate-950 font-black text-[12px] flex flex-col items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.6)] z-40 transition-transform hover:scale-110 active:scale-90 cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed select-none"
                      >
                        <span className="text-[13px] -mb-0.5">🎡</span>
                        <span className="font-extrabold tracking-tighter">دَوِّر!</span>
                      </button>

                    </div>
                  </div>

                  {/* Actions & Outcomes display */}
                  <div className="space-y-2.5 w-full">
                    {!isWheelSpinning && !wheelResultText && (
                      <button
                        type="button"
                        onClick={handleSpinLaunch}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 hover:from-amber-600 to-orange-500 hover:to-orange-600 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer select-none"
                      >
                        🎪 لف عجلة الحظ الآن!
                      </button>
                    )}

                    {isWheelSpinning && (
                      <div className="py-2.5 animate-pulse space-y-1 bg-slate-800 bg-opacity-40 rounded-xl border border-slate-700/30">
                        <p className="text-xs text-amber-300 font-extrabold">جاري ترحيل تروس الصدق وتدوير عجلة العقابات... ⏳🎡</p>
                        <p className="text-[10px] text-slate-400">من سيقع عليه الحكم الشريف لرفع الالتزام بالدراسة؟!</p>
                      </div>
                    )}

                    {wheelResultText && (
                      <div className="space-y-4 animate-fade-in border-2 border-amber-300/80 bg-slate-800 bg-opacity-90 rounded-2xl p-4 mt-2 shadow-inner">
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-3 py-0.5 rounded-full font-black animate-bounce block mx-auto w-max">
                          🎉 العقاب الذي اختاره القدر ومجموعتك:
                        </span>
                        <p className="text-xs font-extrabold text-amber-200 leading-relaxed pr-1 text-center font-sans mt-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          {wheelResultText}
                        </p>
                        {wheelResultText.includes("الكسول") && (
                          <p className="text-[10px] text-rose-400 font-sans font-semibold">🐌 تم تطبيق 'شارة الكسول' الحمراء بنجاح على بروفايل العضو الكسول لمدة 24 ساعة!</p>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSpinLaunch}
                            className="flex-1 py-2 bg-slate-705 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] transition-all cursor-pointer"
                          >
                            🔄 إعادة دوير العجلة لمتهم آخر
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPunishmentWheelUserId(null);
                              setWheelResultText(null);
                              setWheelSelectedIndex(null);
                            }}
                            className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-[10px] transition-transform active:scale-95 cursor-pointer"
                          >
                            موافق، التزمت بالعقاب 🤝
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}

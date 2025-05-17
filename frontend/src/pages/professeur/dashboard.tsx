"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  List,
  Clock,
  Settings,
  LogOut,
  File,
  X,
  Check,
  Loader2,
  Search,
  Moon,
  Sun,
  Mic,
  BookOpen,
  Tag,
  Calendar,
  Waves,
  Mic2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ProfessorDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; file: File } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedModule, setSelectedModule] = useState("");
  const [courseName, setCourseName] = useState("");
  const [transcription, setTranscription] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Upload Audio", icon: <Upload size={22} />, active: true },
    { name: "Mes Cours", icon: <FileText size={22} />, active: false },
    { name: "Liste Étudiants", icon: <List size={22} />, active: false },
    { name: "Historique", icon: <Clock size={22} />, active: false },
    { name: "Paramètres", icon: <Settings size={22} />, active: false },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('File selected:', file);
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        file: file
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setCompleted(false);
    setProgress(0);
    setTranscription("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async () => {
    if (!uploadedFile || !selectedModule || !courseName) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    console.log('Starting transcription process...');
    console.log('File:', uploadedFile);
    console.log('Module:', selectedModule);
    console.log('Course:', courseName);

    setProcessing(true);
    setTranscription("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio_file', uploadedFile.file);

      console.log('FormData created:', {
        file: uploadedFile.file,
        module: selectedModule,
        courseName: courseName
      });

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Sending request to backend...');
      // Upload and transcribe the file
      const response = await fetch('http://localhost:8000/stt/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transcription failed:', errorData);
        throw new Error(errorData.detail || 'Transcription failed');
      }

      const data = await response.json();
      console.log('Transcription response:', data);
      
      if (!data.transcription) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      setTranscription(data.transcription);
      setCompleted(true);
      toast.success("Transcription terminée avec succès");
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la transcription");
    } finally {
      setProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const fileSizeInMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
          const fileName = `Enregistrement_${new Date().toISOString().replace(/:/g, '-')}.wav`;
          
          // Create a File object from the Blob
          const file = Object.assign(audioBlob, {
            name: fileName,
            type: 'audio/wav'
          }) as File;

          setUploadedFile({
            name: fileName,
            size: fileSizeInMB,
            file: file
          });
        } catch {
          toast.error("Erreur lors du traitement de l'enregistrement");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

    } catch {
      toast.error("Accès au microphone refusé");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }

    setIsRecording(false);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const recentUploads = [
    { name: "Cours d'algèbre linéaire", date: "03/05/2025", status: "Traité", type: "Mathématiques" },
    { name: "Introduction aux limites", date: "28/04/2025", status: "Traité", type: "Mathématiques" },
    { name: "Intégrales définies", date: "15/04/2025", status: "Traité", type: "Mathématiques" }
  ];

  return (
    <div className={`relative flex ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className={`flex flex-col fixed top-0 left-0 h-screen ${isCollapsed ? "w-20" : "w-64"} bg-background border-r border-border transition-all duration-300 shadow-sm rounded-r-xl`}>
        {/* Logo and toggle button */}
        <div className="flex items-center justify-between p-2">
          {!isCollapsed && (
            <div className="flex items-center space-x-1">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="rounded-xl"
              />
              <h1 className="font-semibold text-lg text-primary">MOKHTASAR AI</h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto bg-primary-pale rounded-xl flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={56}
                height={40}
                className="rounded-xl"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto text-muted-foreground rounded-2xl hover:bg-primary-pale"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-2">
            {navItems.map((item, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} mb-1 ${item.active ? "bg-primary-pale text-primary" : "text-muted-foreground hover:bg-primary-pale/50"} rounded-2xl`}
                    >
                      <span>{item.icon}</span>
                      {!isCollapsed && <span className="ml-3">{item.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="rounded-xl">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} text-destructive hover:bg-destructive/10 rounded-2xl`}
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span className="ml-3">Déconnexion</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="rounded-xl">
                  <p>Déconnexion</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 min-h-screen ${isCollapsed ? "ml-20" : "ml-64"} transition-all duration-300 bg-background`}>
        {/* Top header bar */}
        <header className="h-16 bg-background border-b border-border shadow-sm flex items-center justify-between px-8 rounded-b-xl">
          {/* Search bar */}
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8 bg-secondary border-border text-foreground rounded-xl"
            />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-muted-foreground hover:bg-primary-pale/50 rounded-2xl"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {/* Professor profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div>
                    <p className="font-medium text-sm text-foreground">{user?.name || "Prof. MELLAH"}</p>
                    <p className="text-xs text-muted-foreground">{user?.role || "Deep Learning"}</p>
                  </div>
                  <Avatar className="rounded-xl bg-primary-pale">
                    <AvatarFallback className="rounded-xl text-primary">PR</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border rounded-xl">
                <DropdownMenuLabel className="text-foreground">Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-primary-pale/50 text-foreground rounded-xl">Profil</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary-pale/50 text-foreground rounded-xl">Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Upload Audio</h1>
            <Waves className="ml-2 text-primary" size={24} />
          </div>

          {/* Upload card */}
          <Card className="mb-8 border-border rounded-xl bg-gradient-to-br from-background to-primary-pale/10">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Mic2 className="mr-2 text-primary" size={24} />
                Télécharger un enregistrement de cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File upload area */}
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-background hover:bg-primary-pale/10 transition-colors">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary-pale rounded-full">
                      <Upload size={36} className="text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Déposez votre fichier audio ici</h3>
                  <p className="text-sm text-muted-foreground mb-4">ou</p>

                  <div className="flex justify-center flex-col items-center">
                    <Input
                      ref={fileInputRef}
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      onClick={triggerFileInput}
                      className="w-48 h-12 rounded-2xl border-2 border-primary text-primary hover:bg-primary-pale/50"
                    >
                      Parcourir les fichiers
                    </Button>

                    {!isRecording ? (
                      <div className="mt-4 flex flex-col items-center">
                        <Button
                          onClick={startRecording}
                          className="w-14 h-14 rounded-full p-0 flex items-center justify-center bg-primary hover:bg-primary/90"
                        >
                          <Mic size={24} className="text-white" />
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Enregistrer</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center mt-4">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 rounded-full mr-2 animate-pulse bg-red-500"></div>
                          <span className="text-gray-800">Enregistrement en cours: {formatDuration(recordingDuration)}</span>
                        </div>
                        <Button
                          onClick={stopRecording}
                          className="w-14 h-14 rounded-full p-0 flex items-center justify-center bg-red-500 hover:bg-red-600"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                            <rect x="6" y="4" width="4" height="16" fill="white"></rect>
                            <rect x="14" y="4" width="4" height="16" fill="white"></rect>
                          </svg>
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Arrêter</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">Formats supportés: MP3, WAV, M4A (Max 500MB)</p>
                </div>
              ) : (
                <div className="bg-primary-pale/10 rounded-xl p-6 border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="bg-primary-pale p-2 rounded-xl mr-3">
                        <File size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{uploadedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">{uploadedFile?.size} MB</p>
                      </div>
                    </div>
                    {!processing && !completed && (
                      <Button variant="ghost" size="icon" onClick={removeFile} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-2xl">
                        <X size={20} />
                      </Button>
                    )}
                    {completed && (
                      <Badge className="bg-green-500 text-primary-foreground rounded-xl">
                        <Check size={14} className="mr-1" /> Transcrit
                      </Badge>
                    )}
                  </div>

                  {processing && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1 text-foreground">
                        <span>Transcription en cours...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 rounded-xl bg-primary-pale text-primary" />
                    </div>
                  )}

                  {transcription && (
                    <div className="mt-4 p-4 bg-background rounded-xl border border-border">
                      <h3 className="text-lg font-medium text-foreground mb-2">Transcription</h3>
                      <div className="max-h-60 overflow-y-auto">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{transcription}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Course information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="module" className="text-foreground">Module</Label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger id="module" className="bg-background border-border text-foreground rounded-xl">
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl">
                      <SelectItem value="ml" className="rounded-xl hover:bg-primary-pale/50">Machine Learning</SelectItem>
                      <SelectItem value="java" className="rounded-xl hover:bg-primary-pale/50">Java</SelectItem>
                      <SelectItem value="mobile" className="rounded-xl hover:bg-primary-pale/50">Developpement Mobile</SelectItem>
                      <SelectItem value="dl" className="rounded-xl hover:bg-primary-pale/50">Deep Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="text-foreground">Nom du cours</Label>
                  <Input
                    id="course"
                    value={courseName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourseName(e.target.value)}
                    placeholder="Ex: Introduction au machine learning"
                    className="bg-background border-border text-foreground rounded-xl focus-visible:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                disabled={!uploadedFile || processing || completed || !selectedModule || !courseName}
                onClick={processFile}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processing ? "Traitement en cours..." : "Traiter l'audio"}
              </Button>
            </CardFooter>
          </Card>

          {/* Recent uploads */}
          <Card className="border-border rounded-xl bg-gradient-to-br from-background to-primary-pale/10">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <BookOpen className="mr-2 text-primary" size={20} />
                Uploads récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium py-2 pl-2 rounded-tl-xl text-primary">
                        <div className="flex items-center">
                          <BookOpen size={16} className="mr-2" />
                          <span>Nom du cours</span>
                        </div>
                      </th>
                      <th className="text-left font-medium py-2 text-primary">
                        <div className="flex items-center">
                          <Tag size={16} className="mr-2" />
                          <span>Type</span>
                        </div>
                      </th>
                      <th className="text-left font-medium py-2 text-primary">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span>Date</span>
                        </div>
                      </th>
                      <th className="text-left font-medium py-2 pr-2 rounded-tr-xl text-primary">
                        <div className="flex items-center">
                          <Check size={16} className="mr-2" />
                          <span>Status</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUploads.map((upload, index) => (
                      <tr
                        key={index}
                        className="border-b border-border hover:bg-primary-pale/10 transition-colors"
                      >
                        <td className="py-3 pl-2 text-foreground rounded-bl-xl">{upload.name}</td>
                        <td className="py-3 text-foreground">
                          <Badge variant="outline" className="border-primary text-primary rounded-xl">
                            {upload.type}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{upload.date}</td>
                        <td className="py-3 pr-2 rounded-br-xl">
                          <Badge className="bg-green-500 text-primary-foreground rounded-xl">
                            {upload.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
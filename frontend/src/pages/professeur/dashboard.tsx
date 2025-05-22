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
    <div className="min-h-screen bg-[#F3F3E0]">
      {/* Sidebar */}
      <div className={`flex flex-col fixed top-0 left-0 h-screen ${isCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 transition-all duration-300 shadow-sm`}>
        {/* Logo and toggle button */}
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              
              <h1 className="font-bold text-xl tracking-tight text-navy">
                Mokhtassar<span className="text-blue">AI</span>
              </h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 mx-auto bg-[#133E87]/10 rounded-lg flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto text-gray-500 hover:bg-[#133E87]/10 rounded-lg"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <Separator className="bg-gray-200" />

        {/* Navigation */}
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-3">
            {navItems.map((item, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} mb-1 ${
                        item.active 
                          ? "bg-[#133E87] text-white hover:bg-[#133E87]/90" 
                          : "text-gray-600 hover:bg-[#133E87]/10"
                      } rounded-lg`}
                    >
                      <span>{item.icon}</span>
                      {!isCollapsed && <span className="ml-3">{item.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-white border-gray-200">
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
                  className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} text-red-500 hover:bg-red-50 rounded-lg`}
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span className="ml-3">Déconnexion</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-white border-gray-200">
                  <p>Déconnexion</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 min-h-screen ${isCollapsed ? "ml-20" : "ml-64"} transition-all duration-300 bg-[#F3F3E0]`}>
        {/* Top header bar */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8">
          {/* Search bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 bg-gray-50 border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
            />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-500 hover:bg-[#133E87]/10 rounded-lg"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {/* Professor profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{user?.name || "Prof. MELLAH"}</p>
                    <p className="text-xs text-gray-500">{user?.role || "Deep Learning"}</p>
                  </div>
                  <Avatar className="rounded-lg bg-[#133E87]/10">
                    <AvatarFallback className="rounded-lg text-[#133E87]">PR</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200 rounded-lg">
                <DropdownMenuLabel className="text-gray-900">Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="hover:bg-[#133E87]/10 text-gray-900 rounded-lg">Profil</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#133E87]/10 text-gray-900 rounded-lg">Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-500 hover:bg-red-50 rounded-lg"
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
            <h1 className="text-2xl font-bold text-gray-900">Upload Audio</h1>
            <Waves className="ml-2 text-[#133E87]" size={24} />
          </div>

          {/* Upload card */}
          <Card className="mb-8 border-gray-200 rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Mic2 className="mr-2 text-[#133E87]" size={24} />
                Télécharger un enregistrement de cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File upload area */}
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center bg-gray-50 hover:bg-[#133E87]/5 transition-colors">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-[#133E87]/10 rounded-full">
                      <Upload size={36} className="text-[#133E87]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Déposez votre fichier audio ici</h3>
                  <p className="text-sm text-gray-500 mb-4">ou</p>

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
                      className="w-48 h-12 rounded-lg border-2 border-[#133E87] text-[#133E87] hover:bg-[#133E87]/10"
                    >
                      Parcourir les fichiers
                    </Button>

                    {!isRecording ? (
                      <div className="mt-4 flex flex-col items-center">
                        <Button
                          onClick={startRecording}
                          className="w-14 h-14 rounded-full p-0 flex items-center justify-center bg-[#133E87] hover:bg-[#133E87]/90"
                        >
                          <Mic size={24} className="text-white" />
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Enregistrer</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center mt-4">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 rounded-full mr-2 animate-pulse bg-red-500"></div>
                          <span className="text-gray-900">Enregistrement en cours: {formatDuration(recordingDuration)}</span>
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

                  <p className="text-xs text-gray-500 mt-4">Formats supportés: MP3, WAV, M4A (Max 500MB)</p>
                </div>
              ) : (
                <div className="bg-[#133E87]/5 rounded-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="bg-[#133E87]/10 p-2 rounded-lg mr-3">
                        <File size={24} className="text-[#133E87]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile?.name}</p>
                        <p className="text-sm text-gray-500">{uploadedFile?.size} MB</p>
                      </div>
                    </div>
                    {!processing && !completed && (
                      <Button variant="ghost" size="icon" onClick={removeFile} className="text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg">
                        <X size={20} />
                      </Button>
                    )}
                    {completed && (
                      <Badge className="bg-green-500 text-white rounded-lg">
                        <Check size={14} className="mr-1" /> Transcrit
                      </Badge>
                    )}
                  </div>

                  {processing && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1 text-gray-900">
                        <span>Transcription en cours...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 rounded-lg bg-[#133E87]/10 text-[#133E87]" />
                    </div>
                  )}

                  {transcription && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Transcription</h3>
                      <div className="max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{transcription}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Course information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="module" className="text-gray-900">Module</Label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger id="module" className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]">
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-lg">
                      <SelectItem value="ml" className="rounded-lg hover:bg-[#133E87]/10">Machine Learning</SelectItem>
                      <SelectItem value="java" className="rounded-lg hover:bg-[#133E87]/10">Java</SelectItem>
                      <SelectItem value="mobile" className="rounded-lg hover:bg-[#133E87]/10">Developpement Mobile</SelectItem>
                      <SelectItem value="dl" className="rounded-lg hover:bg-[#133E87]/10">Deep Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="text-gray-900">Nom du cours</Label>
                  <Input
                    id="course"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Ex: Introduction au machine learning"
                    className="bg-white border-gray-200 text-gray-900 rounded-lg focus:border-[#133E87] focus:ring-[#133E87]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                disabled={!uploadedFile || processing || completed || !selectedModule || !courseName}
                onClick={processFile}
                className="bg-[#133E87] text-white hover:bg-[#133E87]/90 rounded-lg"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processing ? "Traitement en cours..." : "Traiter l'audio"}
              </Button>
            </CardFooter>
          </Card>

          {/* Recent uploads */}
          <Card className="border-gray-200 rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <BookOpen className="mr-2 text-[#133E87]" size={20} />
                Uploads récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left font-medium py-2 pl-2 rounded-tl-lg text-[#133E87]">
                        <div className="flex items-center">
                          <BookOpen size={16} className="mr-2" />
                          <span>Nom du cours</span>
                        </div>
                      </th>
                      <th className="text-left font-medium py-2 text-[#133E87]">
                        <div className="flex items-center">
                          <Tag size={16} className="mr-2" />
                          <span>Type</span>
                        </div>
                      </th>
                      <th className="text-left font-medium py-2 text-[#133E87]">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span>Date</span>
                        </div>
                      </th>
                      <th className="text-left font-medium py-2 pr-2 rounded-tr-lg text-[#133E87]">
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
                        className="border-b border-gray-200 hover:bg-[#133E87]/5 transition-colors"
                      >
                        <td className="py-3 pl-2 text-gray-900 rounded-bl-lg">{upload.name}</td>
                        <td className="py-3 text-gray-900">
                          <Badge variant="outline" className="border-[#133E87] text-[#133E87] rounded-lg">
                            {upload.type}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500">{upload.date}</td>
                        <td className="py-3 pr-2 rounded-br-lg">
                          <Badge className="bg-green-500 text-white rounded-lg">
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
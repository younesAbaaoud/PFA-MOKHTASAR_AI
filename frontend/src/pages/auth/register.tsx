"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mic, BookOpen, Clock, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from 'next/link';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import Image from 'next/image';
import { authService } from '@/services/auth';

const features = [
  {
    icon: <Mic className="w-12 h-12 text-indigo-600" />,
    title: "Transcription Automatique",
    description: "Transformez vos enregistrements audio en temps réel",
    illustration: (
      <Image 
        src="/images/picture2.png"
        alt="Transcription Automatique"
        width={350}
        height={250}
        className="mx-auto mb-4"
        priority
      />
    )
  },
  {
    icon: <BookOpen className="w-12 h-12 text-indigo-600" />,
    title: "Résumés Intelligents",
    description: "Obtenez des synthèses automatiques de vos enregistrements",
    illustration: (
      <Image 
        src="/images/picture1.png"
        alt="Résumés Intelligents"
        width={350}
        height={250}
        className="mx-auto mb-4"
        priority
      />
    )
  },
  {
    icon: <Clock className="w-12 h-12 text-indigo-600" />,
    title: "Apprentissage Personnalisé",
    description: "Suivez votre progression et vos réalisations",
    illustration: (
      <Image 
        src="/images/picture3.png"
        alt="Apprentissage Personnalisé"
        width={350}
        height={250}
        className="mx-auto mb-4"
        priority
      />
    )
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [role, setRole] = useState("");
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!acceptTerms || !role || !email || !password || password !== confirmPassword || !fullName) {
      setError("Veuillez remplir tous les champs et accepter les conditions.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.register({
        username: fullName,
        email,
        password,
        role: role === "etudiant" ? "ETUDIANT" : "PROFESSEUR"
      });
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Partie arrondie */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-r-[3rem] overflow-hidden">
          {/* Logo stylisé */}
          <div className="absolute top-8 left-8 z-10">
            <h1 className="text-3xl font-bold font-sans tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 drop-shadow-sm">
                mokhtassar ai
              </span>
            </h1>
          </div>
          {/* Carrousel */}
          <div className="h-full flex items-center justify-center relative">
            <button 
              onClick={prevFeature}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md z-10 hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <button 
              onClick={nextFeature}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md z-10 hover:bg-white"
            >
              <ChevronRight className="w-6 h-6 text-indigo-600" />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center px-8 w-full"
              >
                {features[currentFeature].illustration}
                <div className="flex flex-col items-center mt-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {features[currentFeature].title}
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    {features[currentFeature].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${currentFeature === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* RIGHT SIDE - Formulaire */}
      <div className="w-full lg:w-1/2 bg-white p-6 sm:p-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-500">Commencez votre parcours avec nous</p>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="fullName" className="text-gray-700">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 border border-gray-300 focus:border-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 border border-gray-300 focus:border-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-gray-700">Rôle</Label>
              <Select onValueChange={(value) => setRole(value)} required>
                <SelectTrigger className="mt-1 focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 border border-gray-300 focus:border-indigo-500 h-auto">
                  <SelectValue placeholder="Sélectionnez votre rôle" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="etudiant">Étudiant</SelectItem>
                  <SelectItem value="professeur">Professeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Créez un mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 border border-gray-300 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmation</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 border border-gray-300 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-start">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
                className="mt-1 mr-2"
              />
              <Label htmlFor="terms" className="text-gray-700">
                J'accepte les <Link href="/terms" className="text-indigo-600 hover:underline">conditions d'utilisation</Link>
              </Label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4 rounded-full py-2"
              disabled={!acceptTerms || !role || isLoading}
            >
              {isLoading ? 'Création du compte...' : 'Créer un compte'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-500 mt-6">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

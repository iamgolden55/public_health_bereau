'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useUser } from '@/app/context/user-context';
import { cn } from "@/lib/utils";
import { 
  User, Heart, FileText, Brain, 
  Sparkles, Send, Paperclip,
  Image as ImageIcon, Wand2,
  Activity, Globe, Plus,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const DelightfulHealthChat = () => {
  const router = useRouter();
  const { userData, loading, handleLogout } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Gradient animation for header text
  const textGradient = `linear-gradient(45deg, 
    hsl(${useMotionValue(0)}, 100%, 50%), 
    hsl(${useMotionValue(60)}, 100%, 50%))`;

  // Sophisticated health interaction categories
  const interactionTypes = [
    {
      id: 'consultation',
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Health Consultation",
      description: "Discuss symptoms and get initial guidance",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 'analysis',
      icon: <Brain className="w-5 h-5" />,
      title: "Medical Analysis",
      description: "Understand test results and medical reports",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 'monitoring',
      icon: <Activity className="w-5 h-5" />,
      title: "Health Monitoring",
      description: "Track vital signs and health metrics",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      id: 'wellness',
      icon: <Heart className="w-5 h-5" />,
      title: "Wellness Planning",
      description: "Create personalized health routines",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  // Dynamic suggestions based on input
  const getContextualSuggestions = (input) => {
    // Add logic to return relevant medical suggestions based on input
    return [
      "Tell me more about your symptoms",
      "Would you like to review your recent results?",
      "Should we check your health trends?",
      "Let's create a wellness plan"
    ];
  };

  // Handle user hover interactions
  const handleMouseMove = (event) => {
    const { currentTarget: target } = event;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Smooth input handling with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setCharCount(value.length);
    setIsTyping(true);
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setInputValue(prompt.title);
    setShowSuggestions(false);
    inputRef.current?.focus();

    toast({
      title: "Prompt Selected",
      description: `Starting ${prompt.title.toLowerCase()}...`,
      icon: <Sparkles className="w-4 h-4 text-blue-500" />
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" ref={containerRef}>
      <motion.div 
        className="max-w-4xl mx-auto px-8 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Enhanced Header with Dynamic Elements */}
        <motion.div 
          className="mb-16 relative"
          onMouseMove={handleMouseMove}
        >
          <motion.div
            className="absolute -top-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.h1 
            className="text-5xl font-light tracking-tight mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Hi there, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{userData?.first_name}</span>
          </motion.h1>
          
          <motion.h2 
            className="text-4xl font-light tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            How can I help with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">health</span> today?
          </motion.h2>
        </motion.div>

        {/* Interactive Categories */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {interactionTypes.map((type, index) => (
            <motion.button
              key={type.id}
              onClick={() => handlePromptSelect(type)}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-6 border border-gray-100",
                "bg-white hover:shadow-lg transition-all duration-300"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Animated Background Gradient */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-5",
                "bg-gradient-to-br transition-opacity duration-300",
                type.gradient
              )} />

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl",
                    "bg-gradient-to-br", type.gradient,
                    "text-white shadow-lg"
                  )}>
                    {type.icon}
                  </div>
                  <Sparkles className="w-4 h-4 ml-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {type.description}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Enhanced Input Experience */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className={cn(
            "rounded-2xl border bg-white transition-all duration-300",
            isFocused ? "border-blue-200 shadow-lg" : "border-gray-200",
            isTyping && "border-blue-300"
          )}>
            <div className="p-6">
              <div className="relative">
                {!inputValue && !isFocused && (
                  <motion.div
                    className="absolute inset-0 flex items-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Wand2 className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-400">Ask anything about your health...</span>
                  </motion.div>
                )}
                
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={cn(
                    "w-full border-0 bg-transparent text-lg focus:ring-0 p-0",
                    "placeholder-transparent transition-all duration-300"
                  )}
                />
              </div>
            </div>

            {/* Enhanced Action Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 p-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex items-center space-x-4">
                <motion.div
                  className="text-sm text-gray-400"
                  animate={{ 
                    scale: charCount > 900 ? [1, 1.1, 1] : 1,
                    color: charCount > 900 ? "#ef4444" : "#94a3b8"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {charCount}/1000
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "flex items-center justify-center rounded-xl px-6 py-2",
                    "transition-all duration-300",
                    inputValue.trim()
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </motion.button>
              </div>
            </div>
          </div>

          {/* Dynamic Suggestions */}
          <AnimatePresence>
            {isFocused && inputValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
              >
                {getContextualSuggestions(inputValue).map((suggestion, index) => (
                  <motion.button
                    key={index}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    whileHover={{ x: 4 }}
                    onClick={() => setInputValue(suggestion)}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DelightfulHealthChat;
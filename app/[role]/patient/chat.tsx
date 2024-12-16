import React, { useRef, useState, useEffect } from 'react';
import {
  RefreshCcw,
  Paperclip,
  ArrowUp,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useUser } from '@/app/context/user-context'

const suggestions = [
  "What is the best time to take my medication based on my routines?",
  "Analyze my symptoms to suggest potential conditions.",
  "What are the common symptoms of PCOS?",
  "What is the recommended vaccination schedule for adults?",
  "Explain the side effects of Ibuprofen."
];

export default function Messages() {
  const { userData, loading } = useUser();
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot"; images?: string[] }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showPrompts, setShowPrompts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - uploadedImages.length);
      const validImages = newImages.filter(file => file.type.startsWith('image/'));

      if (validImages.length > 0) {
        const imageUrls = validImages.map(file => URL.createObjectURL(file));
        setUploadedImages(prev => [...prev, ...imageUrls].slice(0, 5));
        toast({
          title: "Images uploaded",
          description: `${validImages.length} image(s) have been uploaded successfully.`,
        });
      }

      if (validImages.length < newImages.length) {
        toast({
          title: "Invalid file type",
          description: "Some files were not images and were skipped.",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index]);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || '';
    setInputValue(content);
  };

  const handleSend = () => {
    if (inputValue.trim() || uploadedImages.length > 0) {
      const newMessage = { text: inputValue.trim(), sender: "user", images: uploadedImages };
      setMessages(prev => [...prev, newMessage]);

      // Simulate GPT response
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: "This is a simulated GPT response.", sender: "bot" }
        ]);
      }, 1000);

      setInputValue("");
      setUploadedImages([]);
      if (textareaRef.current) {
        textareaRef.current.textContent = "";
      }
      setShowPrompts(false);
    }
  };

  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText);
    if (textareaRef.current) {
      textareaRef.current.textContent = promptText;
    }
    setShowPrompts(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Auto-scroll to the bottom when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
            Hi there, {userData?.first_name}
          </span>
        </h1>
        <h2 className="text-3xl font-semibold">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-transparent bg-clip-text">
            Ask me anything!
          </span>
        </h2>
        
      </div>

      {/* Prompts */}
      {showPrompts && (
        <motion.div
          className="flex flex-wrap gap-2 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {suggestions.map((suggestion, index) => (
            <SuggestionButton
              key={index}
              icon={Sparkles}
              onClick={() => handlePromptClick(suggestion)}
            >
              {suggestion}
            </SuggestionButton>
          ))}
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mt-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`max-w-sm p-3 rounded-2xl ${
                message.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {message.images && message.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-4 justify-end items-center">
                  {message.images.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative w-32 h-48 rounded-lg overflow-hidden shadow-lg"
                      style={{
                        transform: `rotate(${(idx % 2 === 0 ? -5 : 5)}deg)`,
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Uploaded image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {message.text && (
                <p className="mt-2 text-center text-sm sm:text-base">
                  {message.text}
                </p>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="mt-4">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`relative bg-white dark:bg-gray-800 rounded-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md ${
              uploadedImages.length > 0 ? 'p-4' : 'p-2'
            }`}
          >
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative inline-block align-top">
                    <div className="relative w-[100px] h-[100px] bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={image}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-gray-900/50 hover:bg-gray-900/70"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div
              ref={textareaRef}
              contentEditable
              className="w-full pl-12 pr-12 outline-none text-gray-900 dark:text-gray-100 min-h-[2.5rem] max-h-[20rem] overflow-y-auto whitespace-pre-wrap break-words text-left"
              onInput={handleInputChange}
            />
            <div className="absolute left-4 top-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedImages.length >= 5}
              >
                <Paperclip className="h-4 w-4 text-gray-400" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
            <motion.div
              className="absolute right-4 top-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-blue-500 hover:bg-blue-600"
                onClick={handleSend}
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SuggestionButton({ children, icon: Icon, onClick }: { children: React.ReactNode; icon: React.ElementType; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="h-10 rounded-full border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 group"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
      <span className="text-gray-600 dark:text-gray-300">{children}</span>
      <ArrowUp className="h-4 w-4 -rotate-45 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
    </Button>
  );
}
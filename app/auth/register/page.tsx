"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import africaData from "@/app/api/african.json"; // Ensure this path is correct
import { useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  Copy,
  Sun,
  MoreVertical,
  Volume2,
  ArrowUp,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    date_of_birth: "",
    gender: "",
    country: "",
    city: "",
  });
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate countries from africa.json
  useEffect(() => {
    if (africaData) {
      const countries = Object.keys(africaData);
      setFilteredCountries(countries);
    }
  }, []);

  // Update cities when the country changes
  useEffect(() => {
    if (formData.country) {
      const cities = africaData[formData.country] || [];
      setFilteredCities(cities);
    } else {
      setFilteredCities([]);
    }
  }, [formData.country]);

  const handleCountryChange = (value: string) => {
    setFormData({ ...formData, country: value, city: "" }); // Reset city when country changes
  };

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, city: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name) newErrors.first_name = "First name is required.";
    if (!formData.last_name) newErrors.last_name = "Last name is required.";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address.";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long.";
    if (!formData.country) newErrors.country = "Please select your country.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        alert("Account created successfully!");
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          date_of_birth: "",
          gender: "",
          country: "",
          city: "",
        });
      } else {
        const error = await response.json();
        alert(error.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("An error occurred. Please try again.");
    }
  };


  const handleCitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.toLowerCase();
    const filtered = filteredCities.filter((city) =>
      city.toLowerCase().includes(searchQuery)
    );
    setFilteredCities(filtered);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Window chrome dots */}
        <div className="mb-4 flex gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>

        <div className="grid gap-6 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-2">
          {/* Left Side - Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center space-y-6 px-4 md:px-8"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your information to get started
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    aria-describedby="firstName-error"
                  />
                  {errors.first_name && (
                    <p id="first_name-error" className="text-red-500 text-sm">
                      {errors.first_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    aria-describedby="last_name-error"
                  />
                  {errors.last_name && (
                    <p id="last_name-error" className="text-red-500 text-sm">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email<span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-describedby="email-error"
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    aria-describedby="password-error"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-red-500 text-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="date_of_birth" className="text-sm font-medium">
                  Date of Birth
                </label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender<span className="text-red-500">*</span>
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender}</p>
                )}
              </div>

              {/* Country Selection */}
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country<span className="text-red-500">*</span>
                </label>
                <Select onValueChange={handleCountryChange}>
                  <SelectTrigger id="country" className="bg-white text-black">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-white text-black">
                    {/* Search Input for Countries */}
                    <div className="p-2">
                      <Input
                        type="text"
                        placeholder="Search country..."
                        className="bg-white text-black"
                        onChange={(e) => {
                          const searchQuery = e.target.value.toLowerCase();
                          const filtered = filteredCountries.filter((country) =>
                            country.toLowerCase().includes(searchQuery)
                          );
                          setFilteredCountries(filtered);
                        }}
                      />
                    </div>
                    {filteredCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Selection */}
              {formData.country && (
                <div className="space-y-2 mt-4">
                  <label htmlFor="city" className="text-sm font-medium">
                    City<span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={handleCityChange}>
                    <SelectTrigger id="city" className="bg-white text-black">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-white text-black">
                      {/* Search Input for Cities */}
                      <div className="p-2">
                        <Input
                          type="text"
                          placeholder="Search city..."
                          className="bg-white text-black"
                          onChange={handleCitySearch} // Uses the handleCitySearch function
                        />
                      </div>
                      {filteredCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <br/>


              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none"
                >
                  I agree to the{" "}
                  <a href="#" className="text-primary underline">
                    terms and conditions
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className={`w-full bg-black text-white ${
                  loading ? "opacity-50" : "hover:bg-black/90"
                }`}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link className="underline" href="/auth/login">
                Log in
              </Link>
            </div>
          </form>

          {/* Right Side - AI Chat */}
          <Card className="hidden md:flex flex-col bg-slate-50 p-6">
            <div className="mb-4 flex items-start space-x-4">
              <Avatar className="h-10 w-10 rounded-full border bg-slate-900">
                <img
                  alt="AI Assistant"
                  src="/placeholder.svg?height=40&width=40"
                  className="rounded-full object-cover"
                />
              </Avatar>
              <div className="space-y-4">
                <p className="text-sm">
                  Welcome to the registration process! I&apos;m here to assist
                  you with creating your account. If you have any questions
                  about the form fields or need help with the registration
                  process, feel free to ask. How can I help you get started?
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


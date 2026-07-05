"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Globe, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2, Save, ExternalLink, Send, Sparkles, Settings2, Clock, Trash2, Tag, Filter
} from "lucide-react";
import { 
  searchAndAnalyzeLeads, 
  saveLeadFromFinder, 
  addLeadToCampaign, 
  markLeadAsContacted,
  getSearchLimitStats,
  getFinderLeads,
  getSearchSettings,
  importLeadsAction,
  searchSimilarLeadsByUrl
} from "./actions";
import * as XLSX from "xlsx";
import { 
  getTemplates, 
  sendLeadEmailFromDashboard,
  updateLeadEmail,
  deleteLead,
  bulkDeleteLeads
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PhoneList } from "@/components/phone-list";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

const CITY_DETAILS_MAP: Record<string, { state: string; country: string }> = {
  // USA
  "Houston": { state: "TX", country: "United States" },
  "Dallas": { state: "TX", country: "United States" },
  "Phoenix": { state: "AZ", country: "United States" },
  "Atlanta": { state: "GA", country: "United States" },
  "Charlotte": { state: "NC", country: "United States" },
  "Tampa": { state: "FL", country: "United States" },
  "Nashville": { state: "TN", country: "United States" },
  "Denver": { state: "CO", country: "United States" },
  "Austin": { state: "TX", country: "United States" },
  "San Antonio": { state: "TX", country: "United States" },
  "Orlando": { state: "FL", country: "United States" },
  "Miami": { state: "FL", country: "United States" },
  "Jacksonville": { state: "FL", country: "United States" },
  "Raleigh": { state: "NC", country: "United States" },
  "Las Vegas": { state: "NV", country: "United States" },
  "Salt Lake City": { state: "UT", country: "United States" },
  "Columbus": { state: "OH", country: "United States" },
  "Indianapolis": { state: "IN", country: "United States" },
  "Kansas City": { state: "MO", country: "United States" },
  
  // UK
  "London": { state: "England", country: "United Kingdom" },
  "Manchester": { state: "England", country: "United Kingdom" },
  "Birmingham": { state: "England", country: "United Kingdom" },
  "Leeds": { state: "England", country: "United Kingdom" },
  "Liverpool": { state: "England", country: "United Kingdom" },
  "Bristol": { state: "England", country: "United Kingdom" },
  "Nottingham": { state: "England", country: "United Kingdom" },
  "Sheffield": { state: "England", country: "United Kingdom" },
  "Leicester": { state: "England", country: "United Kingdom" },
  "Newcastle": { state: "England", country: "United Kingdom" },

  // Canada
  "Toronto": { state: "ON", country: "Canada" },
  "Calgary": { state: "AB", country: "Canada" },
  "Vancouver": { state: "BC", country: "Canada" },
  "Ottawa": { state: "ON", country: "Canada" },
  "Edmonton": { state: "AB", country: "Canada" },
  "Winnipeg": { state: "MB", country: "Canada" },
  "Mississauga": { state: "ON", country: "Canada" },
  "Hamilton": { state: "ON", country: "Canada" },

  // Germany
  "Berlin": { state: "Berlin", country: "Germany" },
  "Hamburg": { state: "Hamburg", country: "Germany" },
  "Munich": { state: "Bavaria", country: "Germany" },
  "Frankfurt": { state: "Hesse", country: "Germany" },
  "Cologne": { state: "North Rhine-Westphalia", country: "Germany" },
  "Stuttgart": { state: "Baden-Württemberg", country: "Germany" },
  "Düsseldorf": { state: "North Rhine-Westphalia", country: "Germany" },

  // Australia
  "Sydney": { state: "NSW", country: "Australia" },
  "Melbourne": { state: "VIC", country: "Australia" },
  "Brisbane": { state: "QLD", country: "Australia" },
  "Perth": { state: "WA", country: "Australia" },
  "Adelaide": { state: "SA", country: "Australia" },

  // New Zealand
  "Auckland": { state: "Auckland", country: "New Zealand" },
  "Wellington": { state: "Wellington", country: "New Zealand" },
  "Christchurch": { state: "Canterbury", country: "New Zealand" },

  // New Countries
  "Dubai": { state: "Dubai", country: "United Arab Emirates" },
  "Abu Dhabi": { state: "Abu Dhabi", country: "United Arab Emirates" },
  "Sharjah": { state: "Sharjah", country: "United Arab Emirates" },
  "Al Ain": { state: "Abu Dhabi", country: "United Arab Emirates" },
  "Dublin": { state: "Dublin", country: "Ireland" },
  "Cork": { state: "Cork", country: "Ireland" },
  "Galway": { state: "Galway", country: "Ireland" },
  "Limerick": { state: "Limerick", country: "Ireland" },
  "Waterford": { state: "Waterford", country: "Ireland" },
  "Drogheda": { state: "Louth", country: "Ireland" },
  "Dundalk": { state: "Louth", country: "Ireland" },
  "Singapore": { state: "Singapore", country: "Singapore" },
  "Amsterdam": { state: "North Holland", country: "Netherlands" },
  "Rotterdam": { state: "South Holland", country: "Netherlands" },
  "The Hague": { state: "South Holland", country: "Netherlands" },
  "Utrecht": { state: "Utrecht", country: "Netherlands" },
  "Eindhoven": { state: "North Brabant", country: "Netherlands" },
  "Stockholm": { state: "Stockholm", country: "Sweden" },
  "Gothenburg": { state: "Västra Götaland", country: "Sweden" },
  "Malmö": { state: "Skåne", country: "Sweden" },
  "Uppsala": { state: "Uppsala", country: "Sweden" },
  "Zurich": { state: "Zurich", country: "Switzerland" },
  "Geneva": { state: "Geneva", country: "Switzerland" },
  "Basel": { state: "Basel-Stadt", country: "Switzerland" },
  "Lausanne": { state: "Vaud", country: "Switzerland" },
  "Bern": { state: "Bern", country: "Switzerland" },
  "Paris": { state: "Île-de-France", country: "France" },
  "Lyon": { state: "Auvergne-Rhône-Alpes", country: "France" },
  "Marseille": { state: "Provence-Alpes-Côte d'Azur", country: "France" },
  "Toulouse": { state: "Occitanie", country: "France" },
  "Nice": { state: "Provence-Alpes-Côte d'Azur", country: "France" },
  "Nantes": { state: "Pays de la Loire", country: "France" },
  "Rome": { state: "Lazio", country: "Italy" },
  "Milan": { state: "Lombardy", country: "Italy" },
  "Naples": { state: "Campania", country: "Italy" },
  "Turin": { state: "Piedmont", country: "Italy" },
  "Palermo": { state: "Sicily", country: "Italy" },
  "Florence": { state: "Tuscany", country: "Italy" },
  "Madrid": { state: "Madrid", country: "Spain" },
  "Barcelona": { state: "Catalonia", country: "Spain" },
  "Valencia": { state: "Valencian Community", country: "Spain" },
  "Seville": { state: "Andalusia", country: "Spain" },
  "Zaragoza": { state: "Aragon", country: "Spain" },
  "Málaga": { state: "Andalusia", country: "Spain" },
  "Cape Town": { state: "Western Cape", country: "South Africa" },
  "Johannesburg": { state: "Gauteng", country: "South Africa" },
  "Durban": { state: "KwaZulu-Natal", country: "South Africa" },
  "Pretoria": { state: "Gauteng", country: "South Africa" },
  "Port Elizabeth": { state: "Eastern Cape", country: "South Africa" },
  "Riyadh": { state: "Riyadh", country: "Saudi Arabia" },
  "Jeddah": { state: "Makkah", country: "Saudi Arabia" },
  "Mecca": { state: "Makkah", country: "Saudi Arabia" },
  "Medina": { state: "Al Madinah", country: "Saudi Arabia" },
  "Dammam": { state: "Eastern Province", country: "Saudi Arabia" },
  "Doha": { state: "Doha", country: "Qatar" },
  "Kuwait City": { state: "Al Asimah", country: "Kuwait" },
  "Manama": { state: "Capital Governorate", country: "Bahrain" },
  "Muscat": { state: "Muscat", country: "Oman" }
};

const DEFAULT_CITIES = [
  { city: "Houston", state: "TX", country: "United States" },
  { city: "Dallas", state: "TX", country: "United States" },
  { city: "Phoenix", state: "AZ", country: "United States" },
  { city: "Atlanta", state: "GA", country: "United States" },
  { city: "Manchester", state: "England", country: "United Kingdom" },
  { city: "Toronto", state: "ON", country: "Canada" },
  { city: "London", state: "England", country: "United Kingdom" },
  { city: "Austin", state: "TX", country: "United States" },
  { city: "Miami", state: "FL", country: "United States" },
  { city: "Calgary", state: "AB", country: "Canada" },
  
  // Others
  { city: "Charlotte", state: "NC", country: "United States" },
  { city: "Tampa", state: "FL", country: "United States" },
  { city: "Denver", state: "CO", country: "United States" },
  { city: "San Antonio", state: "TX", country: "United States" },
  { city: "Orlando", state: "FL", country: "United States" },
  { city: "Jacksonville", state: "FL", country: "United States" },
  { city: "Raleigh", state: "NC", country: "United States" },
  { city: "Nashville", state: "TN", country: "United States" },
  { city: "Las Vegas", state: "NV", country: "United States" },
  { city: "Salt Lake City", state: "UT", country: "United States" },
  { city: "Columbus", state: "OH", country: "United States" },
  { city: "Indianapolis", state: "IN", country: "United States" },
  { city: "Kansas City", state: "MO", country: "United States" },
  { city: "Birmingham", state: "England", country: "United Kingdom" },
  { city: "Leeds", state: "England", country: "United Kingdom" },
  { city: "Liverpool", state: "England", country: "United Kingdom" },
  { city: "Bristol", state: "England", country: "United Kingdom" },
  { city: "Nottingham", state: "England", country: "United Kingdom" },
  { city: "Sheffield", state: "England", country: "United Kingdom" },
  { city: "Leicester", state: "England", country: "United Kingdom" },
  { city: "Newcastle", state: "England", country: "United Kingdom" },
  { city: "Vancouver", state: "BC", country: "Canada" },
  { city: "Ottawa", state: "ON", country: "Canada" },
  { city: "Edmonton", state: "AB", country: "Canada" },
  { city: "Winnipeg", state: "MB", country: "Canada" },
  { city: "Mississauga", state: "ON", country: "Canada" },
  { city: "Hamilton", state: "ON", country: "Canada" },
  { city: "Berlin", state: "Berlin", country: "Germany" },
  { city: "Hamburg", state: "Hamburg", country: "Germany" },
  { city: "Munich", state: "Bavaria", country: "Germany" },
  { city: "Frankfurt", state: "Hesse", country: "Germany" },
  { city: "Cologne", state: "North Rhine-Westphalia", country: "Germany" },
  { city: "Stuttgart", state: "Baden-Württemberg", country: "Germany" },
  { city: "Düsseldorf", state: "North Rhine-Westphalia", country: "Germany" },
  { city: "Sydney", state: "NSW", country: "Australia" },
  { city: "Melbourne", state: "VIC", country: "Australia" },
  { city: "Brisbane", state: "QLD", country: "Australia" },
  { city: "Perth", state: "WA", country: "Australia" },
  { city: "Adelaide", state: "SA", country: "Australia" },
  { city: "Auckland", state: "Auckland", country: "New Zealand" },
  { city: "Wellington", state: "Wellington", country: "New Zealand" },
  { city: "Christchurch", state: "Canterbury", country: "New Zealand" },
  { city: "Dubai", state: "Dubai", country: "United Arab Emirates" },
  { city: "Abu Dhabi", state: "Abu Dhabi", country: "United Arab Emirates" },
  { city: "Sharjah", state: "Sharjah", country: "United Arab Emirates" },
  { city: "Al Ain", state: "Abu Dhabi", country: "United Arab Emirates" },
  { city: "Dublin", state: "Dublin", country: "Ireland" },
  { city: "Cork", state: "Cork", country: "Ireland" },
  { city: "Galway", state: "Galway", country: "Ireland" },
  { city: "Limerick", state: "Limerick", country: "Ireland" },
  { city: "Waterford", state: "Waterford", country: "Ireland" },
  { city: "Drogheda", state: "Louth", country: "Ireland" },
  { city: "Dundalk", state: "Louth", country: "Ireland" },
  { city: "Singapore", state: "Singapore", country: "Singapore" },
  { city: "Amsterdam", state: "North Holland", country: "Netherlands" },
  { city: "Rotterdam", state: "South Holland", country: "Netherlands" },
  { city: "The Hague", state: "South Holland", country: "Netherlands" },
  { city: "Utrecht", state: "Utrecht", country: "Netherlands" },
  { city: "Eindhoven", state: "North Brabant", country: "Netherlands" },
  { city: "Stockholm", state: "Stockholm", country: "Sweden" },
  { city: "Gothenburg", state: "Västra Götaland", country: "Sweden" },
  { city: "Malmö", state: "Skåne", country: "Sweden" },
  { city: "Uppsala", state: "Uppsala", country: "Sweden" },
  { city: "Zurich", state: "Zurich", country: "Switzerland" },
  { city: "Geneva", state: "Geneva", country: "Switzerland" },
  { city: "Basel", state: "Basel-Stadt", country: "Switzerland" },
  { city: "Lausanne", state: "Vaud", country: "Switzerland" },
  { city: "Bern", state: "Bern", country: "Switzerland" },
  { city: "Paris", state: "Île-de-France", country: "France" },
  { city: "Lyon", state: "Auvergne-Rhône-Alpes", country: "France" },
  { city: "Marseille", state: "Provence-Alpes-Côte d'Azur", country: "France" },
  { city: "Toulouse", state: "Occitanie", country: "France" },
  { city: "Nice", state: "Provence-Alpes-Côte d'Azur", country: "France" },
  { city: "Nantes", state: "Pays de la Loire", country: "France" },
  { city: "Rome", state: "Lazio", country: "Italy" },
  { city: "Milan", state: "Lombardy", country: "Italy" },
  { city: "Naples", state: "Campania", country: "Italy" },
  { city: "Turin", state: "Piedmont", country: "Italy" },
  { city: "Palermo", state: "Sicily", country: "Italy" },
  { city: "Florence", state: "Tuscany", country: "Italy" },
  { city: "Madrid", state: "Madrid", country: "Spain" },
  { city: "Barcelona", state: "Catalonia", country: "Spain" },
  { city: "Valencia", state: "Valencian Community", country: "Spain" },
  { city: "Seville", state: "Andalusia", country: "Spain" },
  { city: "Zaragoza", state: "Aragon", country: "Spain" },
  { city: "Málaga", state: "Andalusia", country: "Spain" },
  { city: "Cape Town", state: "Western Cape", country: "South Africa" },
  { city: "Johannesburg", state: "Gauteng", country: "South Africa" },
  { city: "Durban", state: "KwaZulu-Natal", country: "South Africa" },
  { city: "Pretoria", state: "Gauteng", country: "South Africa" },
  { city: "Port Elizabeth", state: "Eastern Cape", country: "South Africa" },
  { city: "Riyadh", state: "Riyadh", country: "Saudi Arabia" },
  { city: "Jeddah", state: "Makkah", country: "Saudi Arabia" },
  { city: "Mecca", state: "Makkah", country: "Saudi Arabia" },
  { city: "Medina", state: "Al Madinah", country: "Saudi Arabia" },
  { city: "Dammam", state: "Eastern Province", country: "Saudi Arabia" },
  { city: "Doha", state: "Doha", country: "Qatar" },
  { city: "Kuwait City", state: "Al Asimah", country: "Kuwait" },
  { city: "Manama", state: "Capital Governorate", country: "Bahrain" },
  { city: "Muscat", state: "Muscat", country: "Oman" }
];

const DEFAULT_NICHES = [
  // High Priority / Best for Outreach
  "Dentists", "Lawyers", "Roofing Companies", "HVAC Companies", "Plumbers", 
  "Electricians", "Chiropractors", "Medical Clinics", "Kitchen Remodelers", 
  "Landscaping Companies", "Pest Control Companies", "Insurance Agencies", 
  "Real Estate Agents", "Accountants", "Auto Repair Shops",

  // Health & Wellness
  "Physiotherapists", "Dermatologists", "Psychologists", "Therapists", 
  "Optometrists", "Veterinarians", "Pharmacies", "Beauty Salons", 
  "Barbershops", "Spas", "Gyms", "Personal Trainers", "Yoga Studios",

  // Home Services
  "Painters", "Flooring Companies", "Window & Door Companies", 
  "Bathroom Remodelers", "General Contractors", "Home Builders", 
  "Tree Removal Services", "Cleaning Services", "Moving Companies", 
  "Locksmiths", "Garage Door Repair", "Appliance Repair", "Handyman Services", 
  "Solar Panel Installers", "Pool Services", "Pressure Washing Services",

  // Professional Services
  "Mortgage Brokers", "Financial Advisors", "Tax Consultants", 
  "Business Consultants", "IT Support Companies", "Marketing Agencies", 
  "Recruitment Agencies", "Translation Services", "Architecture Firms", 
  "Interior Designers", "Engineering Firms", "Notaries",

  // Property & Local Services
  "Property Management Companies", "Home Inspectors", "Storage Facilities", 
  "Hotels", "Guest Houses", "Event Venues", "Wedding Planners", 
  "Photographers", "Caterers", "Funeral Homes", "Car Dealerships", 
  "Driving Schools",

  // Education & Family
  "Daycares", "Preschools", "Private Schools", "Tutoring Centers", 
  "Music Schools", "Language Schools", "Martial Arts Schools", 
  "Dance Studios", "Childcare Services",

  // Food & Retail
  "Restaurants", "Cafes", "Bakeries", "Catering Companies", 
  "Local Grocery Stores", "Furniture Stores", "Pet Groomers", 
  "Pet Stores", "Flower Shops", "Jewellery Stores"
];

// Social Media & WhatsApp SVG Icons
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

export default function LeadFinderClient({
  initialStats,
  initialTemplates,
  initialFinderLeads,
  initialSearchSettings,
}: {
  initialStats: any;
  initialTemplates: any[];
  initialFinderLeads: any[];
  initialSearchSettings: any;
}) {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    niche: ""
  });
  const [searchMode, setSearchMode] = useState<"keyword" | "smart">("keyword");
  const [smartUrl, setSmartUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>(initialFinderLeads || []);
  const [maxResults, setMaxResults] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [wordpressFilter, setWordpressFilter] = useState(false);
  const [filterEmailOnly, setFilterEmailOnly] = useState(false);
  const [filterNoEmail, setFilterNoEmail] = useState(false);
  const [filterMobileIssues, setFilterMobileIssues] = useState(false);
  const [filterDoctorClinic, setFilterDoctorClinic] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [filterCountry, setFilterCountry] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "speed" | "country" | "category" | "email">("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(initialStats || {
    googleUsed: 0,
    googleRemaining: 40,
    googleLimit: 40,
    serpUsed: 0,
    serpRemaining: 40,
    serpLimit: 40,
    searchProviderMode: "Auto"
  });

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showNicheDropdown, setShowNicheDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [activeNicheIndex, setActiveNicheIndex] = useState(0);
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [isImporting, setIsImporting] = useState(false);

  const [popularCities, setPopularCities] = useState<{ city: string; state: string; country: string }[]>(DEFAULT_CITIES);
  const [popularNiches, setPopularNiches] = useState<string[]>(DEFAULT_NICHES);

  const popularCountries = Array.from(new Set(popularCities.map(c => c.country)));

  const countryContainerRef = useRef<HTMLDivElement>(null);
  const cityContainerRef = useRef<HTMLDivElement>(null);
  const nicheContainerRef = useRef<HTMLDivElement>(null);

  const filteredCountries = formData.country.trim() === ""
    ? popularCountries.slice(0, 8)
    : popularCountries.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).slice(0, 8);

  const filteredCities = (() => {
    let cities = popularCities;
    if (formData.country) {
      cities = cities.filter(c => c.country.toLowerCase() === formData.country.toLowerCase());
    }
    return formData.city.trim() === ""
      ? cities
      : cities.filter(c => c.city.toLowerCase().includes(formData.city.toLowerCase()));
  })();

  const filteredNiches = formData.niche.trim() === ""
    ? popularNiches
    : popularNiches.filter(n => n.toLowerCase().includes(formData.niche.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryContainerRef.current && !countryContainerRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (cityContainerRef.current && !cityContainerRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (nicheContainerRef.current && !nicheContainerRef.current.contains(event.target as Node)) {
        setShowNicheDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setActiveCountryIndex(0);
  }, [formData.country]);

  useEffect(() => {
    setActiveCityIndex(0);
  }, [formData.city]);

  useEffect(() => {
    setActiveNicheIndex(0);
  }, [formData.niche]);

  useEffect(() => {
    setCurrentPage(1);
  }, [results, categoryFilter, wordpressFilter]);

  const selectCountry = (countryStr: string) => {
    setFormData(prev => ({
      ...prev,
      country: countryStr,
      city: "", // Reset City when Country changes
      state: "" // Reset State when Country changes
    }));
    setShowCountryDropdown(false);
    setActiveCountryIndex(0);
  };

  const handleCountryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCountryDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowCountryDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCountryIndex(prev => (prev + 1) % filteredCountries.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCountryIndex(prev => (prev - 1 + filteredCountries.length) % filteredCountries.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCountries[activeCountryIndex]) {
        selectCountry(filteredCountries[activeCountryIndex]);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setShowCountryDropdown(false);
    }
  };

  const handleExportToExcel = () => {
    const leadsToExport = selectedLeads.length > 0
      ? results.filter((lead) => selectedLeads.includes(lead.id))
      : results;

    if (leadsToExport.length === 0) {
      toast({ title: "No Leads to Export", description: "Search or discover leads before exporting.", variant: "destructive" });
      return;
    }

    try {
      const excelData = leadsToExport.map((lead) => ({
        "Business Name": lead.businessName,
        "Website URL": lead.website,
        "Email": lead.email || "",
        "Phone": lead.phone || "",
        "City": lead.city || "",
        "Country": lead.country || "",
        "Category/Niche": lead.category || "",
        "SSL Secure": lead.ssl ? "Yes" : "No",
        "WordPress Setup": lead.wordpress ? "Yes" : "No",
        "Contact Form": lead.contactForm ? "Yes" : "No",
        "Mobile Friendly": lead.mobileFriendly ? "Yes" : "No",
        "Quality Score": lead.qualityScore,
        "Opportunity Score": lead.opportunityScore,
        "Status": lead.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

      XLSX.writeFile(workbook, `leads-finder-export-${Date.now()}.xlsx`);
      toast({ title: "Export Successful", description: `Exported ${leadsToExport.length} leads to Excel.` });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message || "An error occurred during export.", variant: "destructive" });
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast({ title: "Importing Leads", description: "Reading Excel file and validating contents..." });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        throw new Error("The selected Excel file contains no data.");
      }

      const res = await importLeadsAction(json);
      if (res.success) {
        const finderLeads = await getFinderLeads();
        setResults(finderLeads);
        toast({ 
          title: "Import Complete", 
          description: `Successfully imported ${res.importedCount} new leads. Skipped ${res.skippedCount} duplicates/invalid rows.` 
        });
      } else {
        throw new Error(res.error || "An error occurred during import save.");
      }
    } catch (error: any) {
      toast({ title: "Import Failed", description: error.message || "Unable to parse Excel file.", variant: "destructive" });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const selectCity = (cityObj: { city: string; state: string; country: string }) => {
    setFormData(prev => ({
      ...prev,
      city: cityObj.city,
      state: cityObj.state,
      country: cityObj.country
    }));
    setShowCityDropdown(false);
    setActiveCityIndex(0);
  };

  const selectNiche = (nicheStr: string) => {
    setFormData(prev => ({
      ...prev,
      niche: nicheStr
    }));
    setShowNicheDropdown(false);
    setActiveNicheIndex(0);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCityDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowCityDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCityIndex(prev => (prev + 1) % filteredCities.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCityIndex(prev => (prev - 1 + filteredCities.length) % filteredCities.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCities[activeCityIndex]) {
        selectCity(filteredCities[activeCityIndex]);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setShowCityDropdown(false);
    }
  };

  const handleNicheKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showNicheDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowNicheDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveNicheIndex(prev => (prev + 1) % filteredNiches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveNicheIndex(prev => (prev - 1 + filteredNiches.length) % filteredNiches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredNiches[activeNicheIndex]) {
        selectNiche(filteredNiches[activeNicheIndex]);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setShowNicheDropdown(false);
    }
  };

  const getUsageEstimate = () => {
    const mode = stats.searchProviderMode;
    const googleRemaining = stats.googleRemaining;
    const serpRemaining = stats.serpRemaining;
    
    // Google queries needed: 1 for <=10, 2 for >10 (i.e. 20)
    const googleQueriesNeeded = maxResults <= 10 ? 1 : 2;

    if (mode === "Google Only") {
      const exceeded = googleRemaining <= 0;
      if (exceeded) {
        return {
          text: `${googleQueriesNeeded} Google call${googleQueriesNeeded > 1 ? "s" : ""}`,
          warning: `Google search limit exhausted today.`,
          exceeded: true
        };
      }
      if (googleRemaining < googleQueriesNeeded) {
        return {
          text: `${googleRemaining} Google call${googleRemaining > 1 ? "s" : ""}`,
          warning: `Google has only ${googleRemaining} query remaining. Max results capped at ${googleRemaining * 10}.`,
          exceeded: false
        };
      }
      return {
        text: `${googleQueriesNeeded} Google call${googleQueriesNeeded > 1 ? "s" : ""}`,
        warning: null,
        exceeded: false
      };
    }

    if (mode === "SerpAPI Only") {
      const exceeded = serpRemaining <= 0;
      return {
        text: `1 SerpAPI call`,
        warning: exceeded ? `SerpAPI limit exhausted today.` : null,
        exceeded
      };
    }

    // Auto Mode: Google -> SerpAPI Fallback
    if (googleRemaining >= googleQueriesNeeded) {
      return {
        text: `${googleQueriesNeeded} Google call${googleQueriesNeeded > 1 ? "s" : ""}`,
        warning: null,
        exceeded: false
      };
    }
    
    if (googleRemaining > 0) {
      const possibleResults = googleRemaining * 10;
      return {
        text: `${googleRemaining} Google call${googleRemaining > 1 ? "s" : ""}`,
        warning: `Google has only ${googleRemaining} remaining. Max results capped at ${possibleResults}.`,
        exceeded: false
      };
    }
    
    if (serpRemaining >= 1) {
      return {
        text: `1 SerpAPI call (fallback)`,
        warning: `Google exhausted. Falling back to SerpAPI.`,
        exceeded: false
      };
    }

    return {
      text: `${googleQueriesNeeded} Google / 1 SerpAPI`,
      warning: `All search limits exhausted today.`,
      exceeded: true
    };
  };

  const estimate = getUsageEstimate();

  // Outreach drawer states
  const [templates, setTemplates] = useState<any[]>(initialTemplates || []);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Checkbox selection and Deletion states
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [deleteConfirmLeadId, setDeleteConfirmLeadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { toast } = useToast();

  const fetchStats = async () => {
    const limitStats = await getSearchLimitStats();
    setStats(limitStats);
  };

  useEffect(() => {
    async function loadStatsAndTemplates() {
      // Restore last search from localStorage
      try {
        const savedNiche = localStorage.getItem("leadFinder_lastSearchNiche");
        const savedCity = localStorage.getItem("leadFinder_lastSearchCity");
        const savedState = localStorage.getItem("leadFinder_lastSearchState");
        const savedCountry = localStorage.getItem("leadFinder_lastSearchCountry");
        const savedMaxResults = localStorage.getItem("leadFinder_lastSearchMaxResults");

        if (savedNiche || savedCity || savedState || savedCountry) {
          setFormData(prev => ({
            ...prev,
            niche: savedNiche || "",
            city: savedCity || "",
            state: savedState || "",
            country: savedCountry || ""
          }));
        }
        if (savedMaxResults) {
          const parsedMax = parseInt(savedMaxResults, 10);
          if (!isNaN(parsedMax)) {
            setMaxResults(parsedMax);
          }
        }
      } catch (e) {
        console.error("Failed to restore last search from localStorage", e);
      }

      // Load dynamic cities & categories from search settings
      try {
        const searchSettings = initialSearchSettings;
        if (searchSettings) {
          // Build cities from all locations in settings
          const loadedCities: { city: string; state: string; country: string }[] = [];
          const seenCities = new Set<string>();

          const addCityWithFallback = (city: string, defaultCountry: string) => {
            const key = `${city.toLowerCase()}-${defaultCountry.toLowerCase()}`;
            if (seenCities.has(key)) return;
            seenCities.add(key);

            const details = CITY_DETAILS_MAP[city] || { state: "", country: defaultCountry };
            loadedCities.push({
              city,
              state: details.state,
              country: details.country
            });
          };

          // 1. Add priority cities first
          (searchSettings.locationsPriority || []).forEach((city: string) => {
            const details = CITY_DETAILS_MAP[city];
            if (details) {
              const key = `${city.toLowerCase()}-${details.country.toLowerCase()}`;
              if (!seenCities.has(key)) {
                seenCities.add(key);
                loadedCities.push({ city, state: details.state, country: details.country });
              }
            } else {
              // Find which list contains it to guess country
              let countryGuess = "United States";
              if (searchSettings.locationsUk?.includes(city)) countryGuess = "United Kingdom";
              else if (searchSettings.locationsCanada?.includes(city)) countryGuess = "Canada";
              else if (searchSettings.locationsGermany?.includes(city)) countryGuess = "Germany";
              else if (searchSettings.locationsAustralia?.includes(city)) countryGuess = "Australia";
              else if (searchSettings.locationsNewZealand?.includes(city)) countryGuess = "New Zealand";
              
              addCityWithFallback(city, countryGuess);
            }
          });

          // 2. Add other cities
          (searchSettings.locationsUsa || []).forEach((c: string) => addCityWithFallback(c, "United States"));
          (searchSettings.locationsUk || []).forEach((c: string) => addCityWithFallback(c, "United Kingdom"));
          (searchSettings.locationsCanada || []).forEach((c: string) => addCityWithFallback(c, "Canada"));
          (searchSettings.locationsGermany || []).forEach((c: string) => addCityWithFallback(c, "Germany"));
          (searchSettings.locationsAustralia || []).forEach((c: string) => addCityWithFallback(c, "Australia"));
          (searchSettings.locationsNewZealand || []).forEach((c: string) => addCityWithFallback(c, "New Zealand"));

          // 3. Add all other DEFAULT_CITIES that aren't in settings
          DEFAULT_CITIES.forEach(defaultCity => {
            const key = `${defaultCity.city.toLowerCase()}-${defaultCity.country.toLowerCase()}`;
            if (!seenCities.has(key)) {
              seenCities.add(key);
              loadedCities.push(defaultCity);
            }
          });

          if (loadedCities.length > 0) {
            setPopularCities(loadedCities);
          }

          if (searchSettings.categories && searchSettings.categories.length > 0) {
            setPopularNiches(searchSettings.categories);
          }
        }
      } catch (err) {
        console.error("Failed to load custom search filters from settings:", err);
      }
    }
    loadStatsAndTemplates();
  }, []);

  const toggleSelectAll = () => {
    if (selectedLeads.length === results.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(results.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(i => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    setIsDeleting(true);
    const res = await deleteLead(leadId);
    if (res.success) {
      toast({ title: "Lead Deleted", description: "The lead has been permanently removed." });
      setDeleteConfirmLeadId(null);
      setResults(prev => prev.filter(l => l.id !== leadId));
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
      await fetchStats();
    } else {
      toast({ title: "Delete Failed", description: res.error || "An error occurred.", variant: "destructive" });
    }
    setIsDeleting(false);
  };

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handlePerformBulkDelete = async () => {
    setIsBulkDeleting(true);
    const res = await bulkDeleteLeads(selectedLeads);
    if (res.success) {
      toast({ title: "Leads Deleted", description: `${selectedLeads.length} leads have been permanently removed.` });
      setShowBulkDeleteConfirm(false);
      setResults(prev => prev.filter(l => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);
      await fetchStats();
    } else {
      toast({ title: "Bulk Delete Failed", description: res.error || "An error occurred.", variant: "destructive" });
    }
    setIsBulkDeleting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === "country") {
        next.city = "";
        next.state = "";
      }
      return next;
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.niche) {
      toast({ title: "Niche Required", description: "Please enter a business category/niche.", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    setResults([]);

    // Save last search to localStorage
    try {
      localStorage.setItem("leadFinder_lastSearchNiche", formData.niche || "");
      localStorage.setItem("leadFinder_lastSearchCity", formData.city || "");
      localStorage.setItem("leadFinder_lastSearchState", formData.state || "");
      localStorage.setItem("leadFinder_lastSearchCountry", formData.country || "");
      localStorage.setItem("leadFinder_lastSearchMaxResults", maxResults.toString());
    } catch (e) {
      console.error("Failed to save last search to localStorage", e);
    }

    try {
      const res = await searchAndAnalyzeLeads(formData, maxResults);
      if (res.success && res.data) {
        const finderLeads = await getFinderLeads();
        setResults(finderLeads);
        if (res.stats) {
          setStats(res.stats);
        } else {
          await fetchStats();
        }
        toast({ 
          title: "Search Completed", 
          description: `Discovered and analyzed ${res.data.length} businesses using ${res.provider === "google" ? "Google Search" : "SerpAPI"}.` 
        });
      } else {
        toast({ title: "Search Failed", description: res.error || "Unable to complete search.", variant: "destructive" });
        await fetchStats();
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred during lead discovery.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartUrl) {
      toast({ title: "URL Required", description: "Please enter a target website URL.", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      const res = await searchSimilarLeadsByUrl(smartUrl, maxResults);
      if (res.success && res.data) {
        const finderLeads = await getFinderLeads();
        setResults(finderLeads);
        if (res.stats) {
          setStats(res.stats);
        } else {
          await fetchStats();
        }
        toast({ 
          title: "AI Search Completed", 
          description: `Discovered and analyzed ${res.data.length} businesses matching the URL intent.` 
        });
      } else {
        toast({ title: "Search Failed", description: res.error || "Unable to complete search.", variant: "destructive" });
        await fetchStats();
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred during AI lead discovery.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Lead Finder Operations
  const handleSave = async (leadId: string) => {
    const res = await saveLeadFromFinder(leadId);
    if (res.success) {
      setResults(prev => prev.map(lead => lead.id === leadId ? { ...lead, isSaved: true, status: "New" } : lead));
      toast({ title: "Lead Saved", description: "The lead has been imported into active database leads." });
      await fetchStats(); // Refresh dashboard widget saved lead stats
    } else {
      toast({ title: "Error Saving", description: res.error, variant: "destructive" });
    }
  };

  const handleAddToCampaign = async (leadId: string) => {
    const res = await addLeadToCampaign(leadId);
    if (res.success) {
      setResults(prev => prev.map(lead => lead.id === leadId ? { ...lead, isSaved: true, status: "Hot Lead" } : lead));
      toast({ title: "Added to Campaign", description: "Lead status set to Hot Lead." });
      await fetchStats();
    } else {
      toast({ title: "Error updating status", description: res.error, variant: "destructive" });
    }
  };

  const handleMarkAsContacted = async (leadId: string) => {
    const res = await markLeadAsContacted(leadId);
    if (res.success) {
      setResults(prev => prev.map(lead => lead.id === leadId ? { ...lead, isSaved: true, status: "Contacted" } : lead));
      toast({ title: "Marked Contacted", description: "Lead updated and marked as Contacted." });
      await fetchStats();
    } else {
      toast({ title: "Error marking contacted", description: res.error, variant: "destructive" });
    }
  };

  // Email outbox handlers
  const handleOpenOutreach = (lead: any) => {
    setSelectedLead(lead);
    setRecipientEmail(lead.email || "");
    setShowEmailSection(true);
    setSelectedTemplateId("");
    setEmailSubject("");
    setEmailBody("");
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && selectedLead) {
      let subject = template.subject
        .replace(/{businessName}/gi, selectedLead.businessName || "")
        .replace(/{website}/gi, selectedLead.website || "");

      let body = template.body
        .replace(/{businessName}/gi, selectedLead.businessName || "")
        .replace(/{website}/gi, selectedLead.website || "")
        .replace(/{phone}/gi, selectedLead.phone || "")
        .replace(/{score}/gi, (selectedLead.qualityScore || 0).toString())
        .replace(/{performanceScore}/gi, (selectedLead.qualityScore ? Math.round(selectedLead.qualityScore * 0.8) : 50).toString())
        .replace(/{seoScore}/gi, (selectedLead.qualityScore ? Math.round(selectedLead.qualityScore * 0.9) : 60).toString());

      setEmailSubject(subject);
      setEmailBody(body);
    }
  };

  const handleUpdateEmail = async () => {
    if (!recipientEmail || !selectedLead) return;
    setIsUpdatingEmail(true);
    const res = await updateLeadEmail(selectedLead.id, recipientEmail.trim());
    if (res.success) {
      setSelectedLead((prev: any) => ({ ...prev, email: recipientEmail.trim() }));
      setResults(prev => prev.map(lead => lead.id === selectedLead.id ? { ...lead, email: recipientEmail.trim() } : lead));
      toast({ title: "Email Updated", description: "Lead email address updated successfully." });
    } else {
      toast({ title: "Update Failed", description: res.error, variant: "destructive" });
    }
    setIsUpdatingEmail(false);
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast({ title: "Error", description: "Recipient email is required.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    const res = await sendLeadEmailFromDashboard(selectedLead.id, emailSubject, emailBody, recipientEmail.trim());
    if (res.success) {
      toast({ title: "Email Sent", description: "Proposal has been dispatched." });
      setResults(prev => prev.map(lead => lead.id === selectedLead.id ? { ...lead, status: "Contacted" } : lead));
      setShowEmailSection(false);
      await fetchStats();
    } else {
      toast({ title: "Outbox Error", description: res.error, variant: "destructive" });
    }
    setIsSending(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
    if (score >= 50) return "text-amber-500 border-amber-500 bg-amber-500/10";
    return "text-red-500 border-red-500 bg-red-500/10";
  };

  const isLimitExceeded = () => {
    if (stats.searchProviderMode === "Google Only") {
      return stats.googleRemaining === 0;
    }
    if (stats.searchProviderMode === "SerpAPI Only") {
      return stats.serpRemaining === 0;
    }
    // Auto Mode: Limit exceeded if BOTH are finished
    return stats.googleRemaining === 0 && stats.serpRemaining === 0;
  };

  // Get active categories in results for quick filter chips
  const resultsCategories = Array.from(new Set(results.map(r => r.category || "Other")));

  const filteredResults = useMemo(() => {
    // 1. Remove Duplicates
    const uniqueMap = new Map();
    for (const lead of results) {
      if (!lead.website) continue;
      try {
        const domain = new URL(lead.website).hostname.replace("www.", "");
        if (!uniqueMap.has(domain)) {
          uniqueMap.set(domain, lead);
        }
      } catch {
        if (!uniqueMap.has(lead.website)) {
          uniqueMap.set(lead.website, lead);
        }
      }
    }
    const uniqueResults = Array.from(uniqueMap.values());

    let list = uniqueResults.filter(lead => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches = 
          (lead.businessName || "").toLowerCase().includes(query) ||
          (lead.website || "").toLowerCase().includes(query) ||
          (lead.email || "").toLowerCase().includes(query) ||
          (lead.phone || "").toLowerCase().includes(query) ||
          (lead.category || "").toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (wordpressFilter && !lead.wordpress) return false;
      if (categoryFilter !== "All" && (lead.category || "Other").toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (filterCountry !== "All" && (lead.country || "Unknown").toLowerCase() !== filterCountry.toLowerCase()) return false;
      
      if (filterEmailOnly && !lead.email) return false;
      if (filterNoEmail && lead.email) return false;
      if (filterMobileIssues && !lead.mobilePerformanceIssue) return false;
      if (filterHighPriority && !lead.mobilePerformanceIssue) return false;
      if (filterDoctorClinic && !["dentist", "medical clinic", "doctor", "health center"].includes(lead.category?.toLowerCase() || "")) return false;
      
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "speed") {
        return (a.mobileScore || 100) - (b.mobileScore || 100);
      }
      if (sortBy === "country") {
        return (a.country || "").localeCompare(b.country || "");
      }
      if (sortBy === "category") {
        return (a.category || "").localeCompare(b.category || "");
      }
      if (sortBy === "email") {
        if (a.email && !b.email) return -1;
        if (!a.email && b.email) return 1;
        return 0;
      }
      return 0;
    });

    return list;
  }, [results, wordpressFilter, categoryFilter, filterCountry, filterEmailOnly, filterNoEmail, filterMobileIssues, filterHighPriority, filterDoctorClinic, sortBy, searchTerm]);

  const totalLeadsCount = filteredResults.length;
  const totalPages = Math.ceil(totalLeadsCount / pageSize) || 1;
  const paginatedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Generate paginated number array with ellipsis
  const getPaginationPages = () => {
    const delta = 2; // pages on each side of current
    const pages: (number | "...")[] = [];
    const left = currentPage - delta;
    const right = currentPage + delta;
    let lastAdded = 0;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        if (lastAdded && i - lastAdded > 1) pages.push("...");
        pages.push(i);
        lastAdded = i;
      }
    }
    return pages;
  };

  // Open WhatsApp chat for a phone number
  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      {/* Header & Limits Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" /> Lead Finder
          </h1>
          <p className="text-muted-foreground mt-2">Discover prospects in any niche, execute website analysis, and initialize outbox campaigns.</p>
        </div>

        {/* Limit Counters */}
        <div className="flex flex-wrap gap-4 items-center">
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary/20 bg-primary/5 text-primary font-bold flex items-center gap-1">
            <Settings2 className="h-3 w-3" /> Mode: {stats.searchProviderMode}
          </Badge>
          
          <div className="flex gap-2">
            <Card className="px-3 py-1.5 flex flex-col justify-center border-muted bg-card shadow-sm text-center min-w-[120px]">
              <span className="text-[9px] uppercase font-black text-muted-foreground">Google Used</span>
              <span className="text-md font-extrabold text-foreground">{stats.googleUsed} / {stats.googleLimit}</span>
            </Card>
            <Card className="px-3 py-1.5 flex flex-col justify-center border-muted bg-card shadow-sm text-center min-w-[120px]">
              <span className="text-[9px] uppercase font-black text-muted-foreground">SerpAPI Used</span>
              <span className="text-md font-extrabold text-foreground">{stats.serpUsed} / {stats.serpLimit}</span>
            </Card>
          </div>
        </div>
      </div>

      {/* Limit Alert Message */}
      {isLimitExceeded() && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-bold">Daily search limit reached. Please try again tomorrow.</p>
            <p className="text-sm opacity-90">All search provider budgets configured in settings have reached their daily query limits.</p>
          </div>
        </div>
      )}

      {/* Search Input Box */}
      <Card className="border-primary/10 shadow-md">
        <CardContent className="pt-6">
          {/* Quick Location Selectors */}
          <div className="flex flex-col gap-4 mb-6 bg-primary/5 p-4 rounded-2xl border border-primary/10 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-black uppercase text-muted-foreground tracking-wider whitespace-nowrap flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-primary" /> Target Countries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "United States", code: "USA", flag: "🇺🇸" },
                  { name: "United Kingdom", code: "UK", flag: "🇬🇧" },
                  { name: "Canada", code: "Canada", flag: "🇨🇦" },
                  { name: "Australia", code: "Australia", flag: "🇦🇺" },
                  { name: "New Zealand", code: "New Zealand", flag: "🇳🇿" },
                  { name: "United Arab Emirates", code: "UAE", flag: "🇦🇪" },
                  { name: "Ireland", code: "Ireland", flag: "🇮🇪" },
                  { name: "Singapore", code: "Singapore", flag: "🇸🇬" },
                  { name: "Germany", code: "Germany", flag: "🇩🇪" },
                  { name: "Netherlands", code: "Netherlands", flag: "🇳🇱" },
                  { name: "Sweden", code: "Sweden", flag: "🇸🇪" },
                  { name: "Switzerland", code: "Switzerland", flag: "🇨🇭" },
                  { name: "France", code: "France", flag: "🇫🇷" },
                  { name: "Italy", code: "Italy", flag: "🇮🇹" },
                  { name: "Spain", code: "Spain", flag: "🇪🇸" },
                  { name: "South Africa", code: "South Africa", flag: "🇿🇦" },
                  { name: "Saudi Arabia", code: "Saudi Arabia", flag: "🇸🇦" },
                  { name: "Qatar", code: "Qatar", flag: "🇶🇦" },
                  { name: "Kuwait", code: "Kuwait", flag: "🇰🇼" },
                  { name: "Bahrain", code: "Bahrain", flag: "🇧🇭" },
                  { name: "Oman", code: "Oman", flag: "🇴🇲" }
                ].map((countryObj) => (
                  <Button
                    key={countryObj.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all ${formData.country.toLowerCase() === countryObj.name.toLowerCase() ? "border-primary bg-primary/10 text-primary shadow-sm" : "bg-white hover:bg-muted/50"}`}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        country: countryObj.name,
                        state: "", // clear state to allow auto-fill or selection
                        city: ""   // clear city for country-specific selection
                      }));
                    }}
                  >
                    <span className="mr-1">{countryObj.flag}</span> {countryObj.code}
                  </Button>
                ))}
                {formData.country && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-bold"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        country: "",
                        state: "",
                        city: ""
                      }));
                    }}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>

            {popularCities.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-dashed">
                <span className="text-xs font-black uppercase text-muted-foreground tracking-wider whitespace-nowrap flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {formData.country ? `${formData.country} Cities:` : 'Top Priority Cities:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.country ? popularCities.filter(c => c.country.toLowerCase() === formData.country.toLowerCase()) : popularCities.slice(0, 10)).map((cityObj) => (
                    <Button
                      key={`${cityObj.city}-${cityObj.state}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`h-7 px-2.5 text-xs font-semibold rounded-lg bg-white hover:bg-muted/50 transition-all ${formData.city.toLowerCase() === cityObj.city.toLowerCase() ? "border-primary bg-primary/10 text-primary shadow-sm" : ""}`}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          city: cityObj.city,
                          state: cityObj.state,
                          country: cityObj.country
                        }));
                      }}
                    >
                      {cityObj.city}, {cityObj.state || cityObj.country}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
                        {/* Search Mode Toggle */}
          <div className="flex items-center gap-2 mb-4 bg-muted/30 p-1.5 rounded-xl border w-fit">
            <button
              type="button"
              onClick={() => setSearchMode("keyword")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                searchMode === "keyword" 
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Keyword Search
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("smart")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                searchMode === "smart" 
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Smart Search
            </button>
          </div>

          {searchMode === "keyword" ? (
            <>
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
                <div className="space-y-1 md:col-span-3 relative" ref={nicheContainerRef}>
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Niche / Keyword</Label>
                  <Input 
                    name="niche" 
                    placeholder="e.g. Dentists, Roofing" 
                    value={formData.niche} 
                    onChange={handleChange} 
                    onFocus={() => setShowNicheDropdown(true)}
                    onKeyDown={handleNicheKeyDown}
                    className="h-11 rounded-xl"
                    disabled={isSearching || isLimitExceeded()}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showNicheDropdown && filteredNiches.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-muted dark:bg-slate-900 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1"
                      >
                        {filteredNiches.map((niche, idx) => (
                          <button
                            key={niche}
                            type="button"
                            onClick={() => selectNiche(niche)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              idx === activeNicheIndex 
                                ? "bg-primary/10 text-primary font-bold" 
                                : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            {niche}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Country Autocomplete */}
                <div className="space-y-1 md:col-span-2 relative" ref={countryContainerRef}>
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Country</Label>
                  <Input 
                    name="country" 
                    placeholder="e.g. United States" 
                    value={formData.country} 
                    onChange={handleChange} 
                    onFocus={() => setShowCountryDropdown(true)}
                    onKeyDown={handleCountryKeyDown}
                    className="h-11 rounded-xl"
                    disabled={isSearching || isLimitExceeded()}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-muted dark:bg-slate-900 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1"
                      >
                        {filteredCountries.map((country, idx) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => selectCountry(country)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              idx === activeCountryIndex 
                                ? "bg-primary/10 text-primary font-bold" 
                                : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            {country}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* City Autocomplete */}
                <div className="space-y-1 md:col-span-2 relative" ref={cityContainerRef}>
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">City</Label>
                  <Input 
                    name="city" 
                    placeholder="e.g. Houston, London" 
                    value={formData.city} 
                    onChange={handleChange} 
                    onFocus={() => setShowCityDropdown(true)}
                    onKeyDown={handleCityKeyDown}
                    className="h-11 rounded-xl"
                    disabled={isSearching || isLimitExceeded()}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showCityDropdown && filteredCities.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-muted dark:bg-slate-900 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1"
                      >
                        {filteredCities.map((cityObj, idx) => (
                          <button
                            key={`${cityObj.city}-${cityObj.state}`}
                            type="button"
                            onClick={() => selectCity(cityObj)}
                            className={`w-full flex justify-between items-center px-4 py-2 text-sm transition-colors ${
                              idx === activeCityIndex 
                                ? "bg-primary/10 text-primary font-bold" 
                                : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <span>{cityObj.city}</span>
                            <span className="text-xs opacity-60">
                              {cityObj.state}, {cityObj.country}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">State / Region</Label>
                  <Input 
                    name="state" 
                    placeholder="e.g. TX, Florida" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className="h-11 rounded-xl"
                    disabled={isSearching || isLimitExceeded()}
                  />
                </div>

                <div className="space-y-1 md:col-span-1">
                  <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Max Results</Label>
                  <Select 
                    value={maxResults.toString()} 
                    onValueChange={(val) => setMaxResults(parseInt(val))}
                    disabled={isSearching || isLimitExceeded()}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select max results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Results</SelectItem>
                      <SelectItem value="10">10 Results</SelectItem>
                      <SelectItem value="20">20 Results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col justify-end space-y-1 md:col-span-2">
                  <div className="flex justify-between items-center px-1 text-[10px] font-black uppercase text-muted-foreground">
                    <span>Usage Est.</span>
                    <Badge 
                      variant={estimate.exceeded ? "destructive" : "secondary"} 
                      className={`text-[9px] px-1.5 py-0 font-bold ${!estimate.exceeded && !isLimitExceeded() ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" : ""}`}
                    >
                      {estimate.text}
                    </Badge>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSearching || !formData.niche || isLimitExceeded() || estimate.exceeded} 
                    className="w-full h-11 text-md rounded-xl font-bold"
                  >
                    {isSearching ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
                    ) : (
                      <><Search className="mr-2 h-4 w-4" /> Find Leads</>
                    )}
                  </Button>
                </div>
              </form>
              {estimate.warning && (
                <div className={`mt-3 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  estimate.exceeded 
                    ? "bg-destructive/10 border-destructive/20 text-destructive" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                }`}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{estimate.warning}</span>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSmartSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 border p-4 rounded-xl bg-primary/5 border-primary/20">
              <div className="md:col-span-12 mb-2">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Smart Search
                </h3>
                <p className="text-xs text-muted-foreground">
                  Provide a URL of an ideal client or competitor. Gemini AI will analyze the website to determine its niche, location, and intent, and automatically build an advanced search query to find highly relevant businesses.
                </p>
              </div>
              <div className="space-y-1 md:col-span-8">
                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Target Website URL</Label>
                <Input 
                  name="smartUrl" 
                  placeholder="https://example.com" 
                  value={smartUrl} 
                  onChange={(e) => setSmartUrl(e.target.value)} 
                  className="h-11 rounded-xl bg-white dark:bg-slate-900"
                  disabled={isSearching || isLimitExceeded()}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Max Results</Label>
                <Select 
                  value={maxResults.toString()} 
                  onValueChange={(val) => setMaxResults(parseInt(val))}
                  disabled={isSearching || isLimitExceeded()}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Select max results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Results</SelectItem>
                    <SelectItem value="10">10 Results</SelectItem>
                    <SelectItem value="20">20 Results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-end space-y-1 md:col-span-2">
                <Button 
                  type="submit" 
                  disabled={isSearching || !smartUrl || isLimitExceeded()} 
                  className="w-full h-11 text-md rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSearching ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> AI Match</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Results View */}
      <div className="space-y-6">
        {results.length > 0 && (
          <div className="flex flex-col gap-4 p-4 bg-muted/30 border rounded-2xl sticky top-4 z-10 backdrop-blur-md shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search websites, emails, business names..." 
                      className="pl-9 h-10 rounded-xl border-primary/20 bg-white dark:bg-slate-900"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-primary" /> Quick Filters:
                  </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={filterEmailOnly ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs font-bold rounded-xl ${filterEmailOnly ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" : ""}`}
                    onClick={() => { setFilterEmailOnly(!filterEmailOnly); setFilterNoEmail(false); }}
                  >
                    <Mail className="w-3.5 h-3.5 mr-1" /> Websites with Email Only
                  </Button>
                  
                  <Button
                    variant={filterNoEmail ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs font-bold rounded-xl ${filterNoEmail ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600" : ""}`}
                    onClick={() => { setFilterNoEmail(!filterNoEmail); setFilterEmailOnly(false); }}
                  >
                    No Email
                  </Button>

                  <div className="w-px h-6 bg-border mx-1"></div>

                  <Button
                    variant={filterHighPriority ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs font-bold rounded-xl ${filterHighPriority ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600 shadow-sm" : ""}`}
                    onClick={() => setFilterHighPriority(!filterHighPriority)}
                  >
                    🔥 High Priority Leads
                  </Button>

                  <Button
                    variant={filterMobileIssues ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs font-bold rounded-xl ${filterMobileIssues ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600" : ""}`}
                    onClick={() => setFilterMobileIssues(!filterMobileIssues)}
                  >
                    Mobile Speed Issues
                  </Button>

                  <div className="w-px h-6 bg-border mx-1"></div>

                  <Button
                    variant={filterDoctorClinic ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs font-bold rounded-xl`}
                    onClick={() => setFilterDoctorClinic(!filterDoctorClinic)}
                  >
                    Doctor / Clinic
                  </Button>

                  {results.some(r => r.wordpress) && (
                    <Button
                      variant={wordpressFilter ? "default" : "outline"}
                      size="sm"
                      className={`h-8 text-xs font-bold rounded-xl ${wordpressFilter ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'text-slate-600'}`}
                      onClick={() => setWordpressFilter(!wordpressFilter)}
                    >
                      WordPress Only
                    </Button>
                  )}
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-dashed">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mr-1">Categories:</span>
                  <Button
                    variant={categoryFilter === "All" ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-[11px] font-bold rounded-lg"
                    onClick={() => setCategoryFilter("All")}
                  >
                    All ({results.length})
                  </Button>
                  {resultsCategories.map(cat => {
                    const count = results.filter(r => (r.category || "Other") === cat).length;
                    return (
                      <Button
                        key={cat}
                        variant={categoryFilter === cat ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-[11px] font-bold rounded-lg"
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat} ({count})
                      </Button>
                    );
                  })}
                </div>
                </div>
              </div>

              {/* Sorting */}
              <div className="space-y-3 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Sort Results:
                </span>
                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                  <SelectTrigger className="w-full lg:w-[180px] h-10 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border-primary/20 shadow-sm focus:ring-primary">
                    <SelectValue placeholder="Sort results..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="speed">Mobile Speed Score</SelectItem>
                    <SelectItem value="email">Email Availability</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Found Businesses {totalLeadsCount > 0 && <Badge variant="secondary" className="font-bold">{totalLeadsCount}</Badge>}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              id="excel-import-file" 
              className="hidden" 
              onChange={handleImportExcel}
              disabled={isImporting}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 font-bold flex items-center gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={() => document.getElementById("excel-import-file")?.click()}
              disabled={isImporting}
            >
              {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Import Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 font-bold flex items-center gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={handleExportToExcel}
              disabled={results.length === 0}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Export Excel
            </Button>

            {results.length > 0 && (
              <>
                <div className="h-4 w-px bg-muted mx-1 hidden sm:block" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-9 font-bold"
                  onClick={toggleSelectAll}
                >
                  {selectedLeads.length === results.length ? "Deselect All" : "Select All"}
                </Button>
                {selectedLeads.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-xs h-9 font-bold animate-pulse"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Bulk Delete ({selectedLeads.length})
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {results.length === 0 && !isSearching && (
          <div className="text-center p-12 bg-card border rounded-3xl border-dashed">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No search query processed yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">Enter a niche/keyword combined with location details to discover business prospects on Google.</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center p-12 bg-card border rounded-3xl border-dashed space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-foreground">Discovering prospects & analyzing domains...</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">Executing API queries and crawling homepages to evaluate SSL, WordPress setup, mobile responsiveness, and email details.</p>
          </div>
        )}

        <div className="grid gap-6">
          <AnimatePresence>
            {paginatedResults.map((lead, idx) => (
              <motion.div
                key={lead.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`overflow-hidden border transition-shadow bg-card shadow-sm ${selectedLeads.includes(lead.id) ? 'border-primary bg-primary/5' : 'border-muted hover:shadow-lg'}`}>
                  <div className="flex flex-row items-stretch min-w-0">
                    {/* Selection Checkbox */}
                    <div className="p-3 sm:p-4 flex items-center justify-center bg-muted/10 border-r border-dashed shrink-0">
                       <input 
                         type="checkbox" 
                         checked={selectedLeads.includes(lead.id)}
                         onChange={() => toggleSelect(lead.id)}
                         className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                       />
                    </div>
                    <div className="flex-1 p-4 sm:p-6 grid md:grid-cols-4 gap-4 sm:gap-6 items-center min-w-0">
                      
                      {/* Column 1: Info */}
                      <div className="md:col-span-2 space-y-3 sm:space-y-4 min-w-0">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h3 className="font-extrabold text-lg sm:text-xl truncate max-w-full">{lead.businessName}</h3>
                            {lead.isSaved && <Badge variant="outline" className="text-emerald-500 border-emerald-500 bg-emerald-500/5 font-black uppercase text-[10px]">Saved</Badge>}
                            {!lead.email && (
                              <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black uppercase text-[9px]">
                                No Email
                              </Badge>
                            )}
                            {lead.category && (
                              <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 font-black uppercase text-[9px] flex items-center">
                                <Tag className="h-2.5 w-2.5 mr-1" /> {lead.category}
                              </Badge>
                            )}
                          </div>
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-primary hover:underline text-xs sm:text-sm font-semibold flex items-center gap-1 mt-1 truncate max-w-full"
                          >
                            <Globe className="h-3 w-3 shrink-0" /> 
                            <span className="truncate">{lead.website}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-muted/30 p-2 sm:p-3 rounded-2xl border border-muted">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {lead.email ? (
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="truncate font-semibold text-xs text-foreground" title={lead.email}>
                                  {lead.email}
                                </span>
                                {lead.emailConfidence > 0 && (
                                  <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ml-1 flex-shrink-0 ${lead.emailConfidence >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : lead.emailConfidence >= 70 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`} title={`Confidence: ${lead.emailConfidence}%`}>
                                    {lead.emailConfidence}%
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-bold h-5 px-1.5 py-0 flex items-center gap-1">
                                <AlertCircle className="h-2.5 w-2.5" /> No Email
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <PhoneList rawPhone={lead.phone} countryContext={lead.country} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2 min-w-0">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate text-xs font-semibold">
                              {[lead.city, lead.country].filter(Boolean).join(", ") || "Location Unknown"}
                            </span>
                          </div>
                        </div>

                        {/* Social Media Links */}
                        {lead.socialLinks && Object.values(lead.socialLinks).some(Boolean) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {lead.socialLinks.facebook && (
                              <a href={lead.socialLinks.facebook} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">
                                <FacebookIcon className="h-3 w-3" /> Facebook
                              </a>
                            )}
                            {lead.socialLinks.instagram && (
                              <a href={lead.socialLinks.instagram} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors">
                                <InstagramIcon className="h-3 w-3" /> Instagram
                              </a>
                            )}
                            {lead.socialLinks.linkedin && (
                              <a href={lead.socialLinks.linkedin} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors">
                                <LinkedInIcon className="h-3 w-3" /> LinkedIn
                              </a>
                            )}
                            {lead.socialLinks.twitter && (
                              <a href={lead.socialLinks.twitter} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors">
                                <TwitterXIcon className="h-3 w-3" /> X / Twitter
                              </a>
                            )}
                            {lead.socialLinks.youtube && (
                              <a href={lead.socialLinks.youtube} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors">
                                <YouTubeIcon className="h-3 w-3" /> YouTube
                              </a>
                            )}
                            {lead.socialLinks.tiktok && (
                              <a href={lead.socialLinks.tiktok} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900/10 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors">
                                <TikTokIcon className="h-3 w-3" /> TikTok
                              </a>
                            )}
                          </div>
                        )}

                        {/* Detection Tags */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge variant="secondary" className={`text-xs ${lead.ssl ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {lead.ssl ? "SSL Secure" : "Insecure HTTP"}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${lead.wordpress ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                            {lead.wordpress ? "WordPress" : "Non-WP Stack"}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${lead.contactForm ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {lead.contactForm ? "Form Detected" : "No Form"}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${lead.mobileFriendly ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {lead.mobileFriendly ? "Mobile Ready" : "Viewport Error"}
                          </Badge>
                          {typeof lead.mobileScore === 'number' && (
                            <Badge variant="secondary" className={`text-xs flex items-center gap-1 ${lead.mobileScore >= 80 ? "bg-emerald-50 text-emerald-700" : lead.mobileScore >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700 font-bold"}`} title={`Mobile PageSpeed: ${lead.mobileScore}/100`}>
                              {lead.mobileScore < 50 && <AlertCircle className="h-3 w-3" />}
                              Speed: {lead.mobileScore}
                            </Badge>
                          )}
                          {lead.mobilePerformanceIssue && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-xs font-bold animate-pulse shadow-sm">
                              🔥 High Priority Prospect
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Scores */}
                      <div className="flex items-center justify-around gap-4 bg-muted/10 p-4 rounded-2xl border">
                        <div className="text-center">
                          <div className={`h-14 w-14 rounded-full border-4 flex items-center justify-center font-black text-sm mb-1 ${getScoreColor(lead.qualityScore)}`}>
                            {lead.qualityScore}
                          </div>
                          <span className="text-[10px] uppercase font-black text-muted-foreground">Quality Score</span>
                        </div>
                        <div className="text-center">
                          <div className={`h-14 w-14 rounded-full border-4 flex items-center justify-center font-black text-sm mb-1 ${getScoreColor(lead.opportunityScore)}`}>
                            {lead.opportunityScore}
                          </div>
                          <span className="text-[10px] uppercase font-black text-muted-foreground">Opportunity</span>
                        </div>
                      </div>

                      {/* Column 3: Lead Action buttons */}
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        <Button 
                          className="w-full font-bold h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 px-2"
                          onClick={() => {
                            window.location.href = `/dashboard?url=${encodeURIComponent(lead.website)}`;
                          }}
                        >
                          <Globe className="h-4 w-4 shrink-0" /> 
                          <span className="hidden sm:inline">Analyze Website</span>
                          <span className="sm:hidden text-xs">Analyze</span>
                        </Button>

                        {!lead.isSaved ? (
                          <Button 
                            onClick={() => handleSave(lead.id)}
                            className="w-full font-bold h-10 rounded-xl flex items-center justify-center gap-1.5 px-2"
                          >
                            <Save className="h-4 w-4 shrink-0" /> 
                            <span className="hidden sm:inline">Save Lead</span>
                            <span className="sm:hidden text-xs">Save</span>
                          </Button>
                        ) : (
                          <div className="p-2 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center gap-1.5 h-10 w-full px-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0" /> 
                            <span className="hidden sm:inline text-xs">Import Complete</span>
                            <span className="sm:hidden text-[10px]">Imported</span>
                          </div>
                        )}

                        {/* Send Email Drawer Sheet Trigger */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="secondary" 
                              className="w-full font-bold h-10 rounded-xl border border-muted flex items-center justify-center gap-1.5 px-2"
                              onClick={() => handleOpenOutreach(lead)}
                              disabled={!lead.email}
                            >
                              <Mail className="h-4 w-4 shrink-0" /> 
                              <span className="hidden sm:inline text-xs">Outreach Email</span>
                              <span className="sm:hidden text-[10px]">Email</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-xl overflow-y-auto">
                            {selectedLead && (
                              <div className="space-y-8 pt-6">
                                <SheetHeader>
                                  <div className="flex items-center justify-between">
                                    <SheetTitle className="text-2xl">{selectedLead.businessName}</SheetTitle>
                                    <Badge>{selectedLead.status}</Badge>
                                  </div>
                                  <SheetDescription>
                                    Create and send an outbox cold outreach audit proposal email.
                                  </SheetDescription>
                                </SheetHeader>

                                <div className="pt-4 border-t space-y-6">
                                  <div className="space-y-6 bg-primary/5 p-6 rounded-3xl border border-primary/20">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-bold text-lg flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-primary" /> Compose Outreach
                                      </h4>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recipient Email</label>
                                        <div className="flex gap-2">
                                          <Input 
                                            placeholder="email@example.com" 
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            className="h-11 rounded-xl"
                                          />
                                          <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-11 w-11 rounded-xl" 
                                            onClick={handleUpdateEmail} 
                                            disabled={isUpdatingEmail}
                                          >
                                            {isUpdatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Template</label>
                                        <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                          <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Choose an outreach script..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {templates.map(t => (
                                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                                        <Input 
                                          value={emailSubject}
                                          onChange={(e) => setEmailSubject(e.target.value)}
                                          className="h-11 rounded-xl font-medium"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message Body</label>
                                        <Textarea 
                                          className="min-h-[250px] rounded-2xl resize-none p-4 leading-relaxed"
                                          value={emailBody}
                                          onChange={(e) => setEmailBody(e.target.value)}
                                        />
                                      </div>

                                      <Button 
                                        className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl" 
                                        onClick={handleSendEmail}
                                        disabled={isSending || !emailSubject || !emailBody}
                                      >
                                        {isSending ? (
                                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                                        ) : (
                                          <><Send className="mr-2 h-5 w-5" /> Send Proposal</>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>

                        <div className="grid grid-cols-2 gap-1 lg:gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAddToCampaign(lead.id)}
                            className="h-10 rounded-xl text-[10px] sm:text-xs font-bold px-1"
                            disabled={lead.status === "Hot Lead"}
                          >
                            <span className="hidden sm:inline">Add Campaign</span>
                            <span className="sm:hidden">Campaign</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMarkAsContacted(lead.id)}
                            className="h-10 rounded-xl text-[10px] sm:text-xs font-bold px-1"
                            disabled={lead.status === "Contacted"}
                          >
                            <span className="hidden sm:inline">Mark Contacted</span>
                            <span className="sm:hidden">Contacted</span>
                          </Button>
                        </div>

                        {/* Individual Delete Button */}
                        <Button 
                          variant="outline" 
                          className="w-full text-xs font-bold h-10 rounded-xl border border-muted text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 col-span-2 lg:col-span-1"
                          onClick={() => setDeleteConfirmLeadId(lead.id)}
                        >
                          <Trash2 className="mr-1 sm:mr-2 h-4 w-4 shrink-0" /> 
                          <span className="hidden sm:inline">Delete Lead</span>
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      </div>

                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {totalLeadsCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-2xl shadow-sm mt-6">
            <p className="text-xs font-semibold text-muted-foreground">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, totalLeadsCount)}</span> of{" "}
              <span className="font-bold text-foreground">{totalLeadsCount}</span> leads
              {" "}— Page <span className="font-bold text-foreground">{currentPage}</span> of <span className="font-bold text-foreground">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </Button>
              {getPaginationPages().map((page, i) =>
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="h-8 px-1 flex items-center text-xs text-muted-foreground font-bold">…</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs font-bold rounded-lg ${
                      currentPage === page ? "shadow-md" : ""
                    }`}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Single Delete Confirm Dialog */}
      <Dialog open={deleteConfirmLeadId !== null} onOpenChange={(open) => !open && setDeleteConfirmLeadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Permanently Delete Lead?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This lead and all its associated reports, screenshots, and outreach logs will be permanently deleted from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmLeadId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmLeadId && handleDeleteLead(deleteConfirmLeadId)} 
              disabled={isDeleting}
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Permanently Delete {selectedLeads.length} Leads?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected {selectedLeads.length} leads and all their associated reports, screenshots, and outreach logs will be permanently deleted from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} disabled={isBulkDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handlePerformBulkDelete} 
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Permanently Delete Selected"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
   );
 }

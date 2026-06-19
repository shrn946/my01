"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Globe, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2, Save, ExternalLink, Send, Sparkles, Settings2, Clock, Trash2
} from "lucide-react";
import { 
  searchAndAnalyzeLeads, 
  saveLeadFromFinder, 
  addLeadToCampaign, 
  markLeadAsContacted,
  getSearchLimitStats,
  getFinderLeads,
  getSearchSettings,
  importLeadsAction
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
  "Christchurch": { state: "Canterbury", country: "New Zealand" }
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
  { city: "Christchurch", state: "Canterbury", country: "New Zealand" }
];

const DEFAULT_NICHES = [
  "Dentists", "Lawyers", "Accountants", "Real Estate Agents", "Roofing Companies", 
  "HVAC Companies", "Plumbers", "Electricians", "Home Remodelers", "Landscaping Companies", 
  "Pest Control Companies", "Cleaning Services", "Moving Companies", "Chiropractors", 
  "Physical Therapists", "Medical Clinics", "Veterinarians", "Dental Clinics", "Restaurants", 
  "Coffee Shops", "Auto Repair Shops", "Car Dealerships", "Insurance Agencies", "Mortgage Brokers", 
  "Financial Advisors", "Marketing Agencies", "Web Design Agencies", "IT Support Companies", 
  "Managed Service Providers (MSPs)", "Construction Companies", "Solar Installers", 
  "Property Management Companies", "Private Schools", "Tutoring Centers", "Gyms & Fitness Centers", 
  "Beauty Salons", "Spas", "Wedding Photographers", "Law Firms", "Accounting Firms"
];

export default function LeadFinderPage() {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    niche: ""
  });
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [maxResults, setMaxResults] = useState(10);
  const [stats, setStats] = useState({
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
      ? cities.slice(0, 8)
      : cities.filter(c => c.city.toLowerCase().includes(formData.city.toLowerCase())).slice(0, 8);
  })();

  const filteredNiches = formData.niche.trim() === ""
    ? popularNiches.slice(0, 8)
    : popularNiches.filter(n => n.toLowerCase().includes(formData.niche.toLowerCase())).slice(0, 8);

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
  }, [results]);

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
    if (results.length === 0) {
      toast({ title: "No Leads to Export", description: "Search or discover leads before exporting.", variant: "destructive" });
      return;
    }

    try {
      const excelData = results.map((lead) => ({
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
      toast({ title: "Export Successful", description: `Exported ${results.length} leads to Excel.` });
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
  const [templates, setTemplates] = useState<any[]>([]);
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
      await fetchStats();
      const emailTemplates = await getTemplates();
      setTemplates(emailTemplates);
      
      // Load saved finder leads from database
      const finderLeads = await getFinderLeads();
      setResults(finderLeads);

      // Load dynamic cities & categories from search settings
      try {
        const searchSettings = await getSearchSettings();
        if (searchSettings) {
          // Build niches
          if (searchSettings.categories && searchSettings.categories.length > 0) {
            setPopularNiches(searchSettings.categories);
          }
          
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
          (searchSettings.locationsPriority || []).forEach(city => {
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
          (searchSettings.locationsUsa || []).forEach(c => addCityWithFallback(c, "United States"));
          (searchSettings.locationsUk || []).forEach(c => addCityWithFallback(c, "United Kingdom"));
          (searchSettings.locationsCanada || []).forEach(c => addCityWithFallback(c, "Canada"));
          (searchSettings.locationsGermany || []).forEach(c => addCityWithFallback(c, "Germany"));
          (searchSettings.locationsAustralia || []).forEach(c => addCityWithFallback(c, "Australia"));
          (searchSettings.locationsNewZealand || []).forEach(c => addCityWithFallback(c, "New Zealand"));

          if (loadedCities.length > 0) {
            setPopularCities(loadedCities);
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

    try {
      const res = await searchAndAnalyzeLeads(formData, maxResults);
      if (res.success && res.data) {
        setResults(res.data);
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
                  { name: "Germany", code: "Germany", flag: "🇩🇪" },
                  { name: "Australia", code: "Australia", flag: "🇦🇺" },
                  { name: "New Zealand", code: "New Zealand", flag: "🇳🇿" }
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
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Top Priority Cities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularCities.slice(0, 10).map((cityObj) => (
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
                placeholder="e.g. Texas, London" 
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
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex justify-between items-center ${
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
        </CardContent>
      </Card>

      {/* Results View */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Found Businesses {results.length > 0 && <Badge variant="secondary" className="font-bold">{results.length}</Badge>}
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
                  <div className="flex flex-col sm:flex-row">
                    {/* Selection Checkbox */}
                    <div className="p-4 flex items-center bg-muted/10 border-r border-dashed shrink-0">
                       <input 
                         type="checkbox" 
                         checked={selectedLeads.includes(lead.id)}
                         onChange={() => toggleSelect(lead.id)}
                         className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                       />
                    </div>
                    <div className="flex-1 p-6 grid md:grid-cols-4 gap-6 items-center">
                      
                      {/* Column 1: Info */}
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-xl truncate">{lead.businessName}</h3>
                            {lead.isSaved && <Badge variant="outline" className="text-emerald-500 border-emerald-500 bg-emerald-500/5 font-black uppercase text-[10px]">Saved</Badge>}
                            {!lead.email && (
                              <Badge className="bg-red-500/15 text-red-600 border border-red-200 uppercase font-black text-[9px] hover:bg-red-500/20">
                                No Email
                              </Badge>
                            )}
                          </div>
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 mt-1"
                          >
                            <Globe className="h-3 w-3" /> {lead.website} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-2xl border border-muted">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {lead.email ? (
                              <span className="truncate font-semibold text-xs text-foreground" title={lead.email}>
                                {lead.email}
                              </span>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-bold h-5 px-1.5 py-0 flex items-center gap-1">
                                <AlertCircle className="h-2.5 w-2.5" /> No Email
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate font-semibold text-xs" title={lead.phone || "No Phone"}>
                              {lead.phone || "No Phone"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate text-xs font-semibold">
                              {[lead.city, lead.country].filter(Boolean).join(", ") || "Location Unknown"}
                            </span>
                          </div>
                        </div>

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
                      <div className="flex flex-col gap-2">
                        <Button 
                          className="w-full font-bold h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                          onClick={() => {
                            window.location.href = `/dashboard?url=${encodeURIComponent(lead.website)}`;
                          }}
                        >
                          <Globe className="h-4 w-4" /> Analyze Website
                        </Button>

                        {!lead.isSaved ? (
                          <Button 
                            onClick={() => handleSave(lead.id)}
                            className="w-full font-bold h-10 rounded-xl"
                          >
                            <Save className="mr-2 h-4 w-4" /> Save Lead
                          </Button>
                        ) : (
                          <div className="p-2 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 h-10">
                            <CheckCircle2 className="h-4 w-4" /> Import Complete
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAddToCampaign(lead.id)}
                            className="h-10 rounded-xl text-xs font-bold"
                            disabled={lead.status === "Hot Lead"}
                          >
                            Add Campaign
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMarkAsContacted(lead.id)}
                            className="h-10 rounded-xl text-xs font-bold"
                            disabled={lead.status === "Contacted"}
                          >
                            Mark Contacted
                          </Button>
                        </div>

                        {/* Send Email Drawer Sheet Trigger */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="secondary" 
                              className="w-full text-xs font-bold h-10 rounded-xl border border-muted"
                              onClick={() => handleOpenOutreach(lead)}
                              disabled={!lead.email}
                            >
                              <Mail className="mr-2 h-4 w-4" /> Outreach Email
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

                        {/* Individual Delete Button */}
                        <Button 
                          variant="outline" 
                          className="w-full text-xs font-bold h-10 rounded-xl border border-muted text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 mt-1"
                          onClick={() => setDeleteConfirmLeadId(lead.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                        </Button>
                      </div>

                    </div>
                  </div>
                </Card>
              </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {results.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-2xl shadow-sm mt-6">
            <p className="text-xs font-semibold text-muted-foreground">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, totalLeadsCount)}</span> of{" "}
              <span className="font-bold text-foreground">{totalLeadsCount}</span> leads (Page {currentPage} of {totalPages})
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-lg"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
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

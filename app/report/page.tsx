"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, RefreshCw, Target, BookOpen, Clock, Activity, MessageSquare, ShieldAlert, Award, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ScoreBadge, getGradeDetails } from "@/components/ui/score-badge";
import { cn } from "@/lib/utils";
import { StudentSession } from "@/lib/scoring/engine";
import { BOOTCAMP_CONFIG } from "@/lib/config/bootcamp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadJsPDF = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).jspdf) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve((window as any).jspdf);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve((window as any).jspdf);
    };
    script.onerror = () => {
      reject(new Error("Failed to load PDF generation library from CDN"));
    };
    document.body.appendChild(script);
  });
};

const PRIMARY_OBSERVATIONS: Record<string, string> = {
  "Focus": "Your preparation currently loses the most efficiency during deep-work study sessions.",
  "Revision": "Your responses indicate that you spend significantly more time completing new chapters than revising previously completed ones.",
  "Accuracy": "Your responses show that conceptual understanding is developing faster than your problem-solving accuracy.",
  "Time Management": "Your study routine is consistent, but your test-taking pacing limits further improvement.",
  "Confidence": "Your responses indicate that exam-related anxiety is impacting your preparation consistency."
};

const WHAT_THIS_MEANS: Record<string, string> = {
  "Focus": "Daily study hours are interrupted by micro-distractions, breaking cognitive focus and extending the time required to understand new concepts.",
  "Revision": "Concepts learned 30 days ago are beginning to fade, requiring you to relearn material before mock tests and keeping scores flat.",
  "Accuracy": "You understand concepts in theory but struggle to apply them to unfamiliar, complex questions under exam conditions.",
  "Time Management": "You are losing marks due to time pressure and silly mistakes during mock tests, rather than a lack of knowledge.",
  "Confidence": "Test doubt is causing hesitation during exams, which leads to silly mistakes and drops in motivation after a low score."
};

const PREP_SUMMARY_OBSERVATIONS: Record<string, string> = {
  "Focus": "Focus duration breaks limiting efficiency.",
  "Revision": "Revision decay is limiting overall progress.",
  "Accuracy": "Problem-solving accuracy limits score stability.",
  "Time Management": "Test pacing limits score potential.",
  "Confidence": "Exam anxiety limits preparation consistency."
};

const STRONG_FOUNDATIONS: Record<string, { observation: string; explanation: string }> = {
  "Focus": {
    observation: "Your study consistency and focus stamina are better than average.",
    explanation: "Your ability to study for 90 minutes without interruption gives you a strong foundation for deep work."
  },
  "Revision": {
    observation: "You maintain a structured revision schedule.",
    explanation: "Your habit of keeping summary notes prevents memory decay and saves prep time before major tests."
  },
  "Accuracy": {
    observation: "Your conceptual application and problem-solving accuracy are developing well.",
    explanation: "You work through difficult questions systematically rather than looking at solutions too quickly, building a reliable conceptual foundation."
  },
  "Time Management": {
    observation: "You analyze your mock tests and track mistakes consistently.",
    explanation: "Your regular test reviews help you identify pacing issues early and prevent repeating the same mistakes."
  },
  "Confidence": {
    observation: "You remain committed to studying and keep a positive mindset after poor mock tests.",
    explanation: "Your resilience prevents test scores from disrupting your study momentum, which is key to long-term success."
  }
};

const WHY_THIS_RECOMMENDATION: Record<string, string> = {
  "Focus": "Your Focus score ({score}%) indicates a need for structured deep work intervals to prevent screen-related distractions.",
  "Revision": "Your Revision score ({score}%) indicates a need to set up a systematic revision timetable to prevent memory decay.",
  "Accuracy": "Your Accuracy score ({score}%) indicates a need for error log tracking to reduce silly mistakes during practice.",
  "Time Management": "Your Time Management score ({score}%) indicates a need for structured mock test analysis to improve pacing.",
  "Confidence": "Your Confidence score ({score}%) indicates a need for anxiety-reduction techniques and mock recovery steps."
};

export default function ReportPage() {
  const router = useRouter();

  const [session, setSession] = React.useState<StudentSession | null>(null);
  const [conductedDate, setConductedDate] = React.useState("");
  const [isBooking, setIsBooking] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const submitLeadToSheet = async (sessionData: StudentSession, submittedIds: string[]) => {
    try {
      const { grade } = getGradeDetails(sessionData.overallScore);
      const payload = {
        submissionId: sessionData.submissionId,
        source: "Library",
        name: sessionData.student.name,
        phone: sessionData.student.phone,
        class: sessionData.student.class,
        exam: sessionData.student.exam,
        overallScore: sessionData.overallScore,
        tier: grade,
        archetype: sessionData.archetype,
        primaryBottleneck: sessionData.primaryBottleneck ? sessionData.primaryBottleneck.category : "None",
        potentialScore: sessionData.potentialImprovement.potentialScore,
        potentialGain: sessionData.potentialImprovement.gain,
        focus: sessionData.metrics["Focus"] ?? 0,
        revision: sessionData.metrics["Revision"] ?? 0,
        accuracy: sessionData.metrics["Accuracy"] ?? 0,
        timeManagement: sessionData.metrics["Time Management"] ?? 0,
        confidence: sessionData.metrics["Confidence"] ?? 0,
        status: "Audit Completed",
        leadSaved: "Yes",
        answersJson: JSON.stringify(sessionData.answers)
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Server responded with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch {
          // Ignore parse errors
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      if (result.status === "success" && result.queueNumber) {
        submittedIds.push(sessionData.submissionId);
        localStorage.setItem("cnm_kiosk_submitted_ids", JSON.stringify(submittedIds));
        
        const updatedSession = {
          ...sessionData,
          queueNumber: result.queueNumber
        };
        setSession(updatedSession);
        localStorage.setItem("cnm_kiosk_audit_session", JSON.stringify(updatedSession));
        
        console.log("[Sheets Storage Success]: Lead registered. Queue number saved:", result.queueNumber);
      } else {
        console.warn("[Sheets Storage Warning]: Proxy succeeded, but Sheets/Database reported status:", result);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[Sheets Storage Failure]: Failed to register lead to Google Sheets:", errorMsg);
    }
  };

  const handleBookSession = async () => {
    if (!session || isBooking || session.sessionStatus === "Booked") return;

    if (!session.queueNumber) {
      alert("Lead queue registration is still processing. Please wait 2 seconds and try again.");
      return;
    }

    setIsBooking(true);

    try {
      const bookingId = `BK-${Date.now()}-${session.student.phone.trim()}`;

      const payload = {
        bookingId,
        submissionId: session.submissionId,
        queueNumber: session.queueNumber,
        name: session.student.name,
        phone: session.student.phone,
        class: session.student.class,
        exam: session.student.exam,
        overallScore: session.overallScore,
        archetype: session.archetype,
        primaryBottleneck: session.primaryBottleneck ? session.primaryBottleneck.category : "None",
        potentialGain: session.potentialImprovement.gain,
        bookingStatus: "Waiting",
        source: "Library"
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Server responded with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch {
          // Ignore parse errors
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (result.status === "success") {
        const updatedSession: StudentSession = {
          ...session,
          sessionStatus: "Booked",
          bookingId: bookingId
        };
        localStorage.setItem("cnm_kiosk_audit_session", JSON.stringify(updatedSession));
        setSession(updatedSession);
        router.push("/confirm");
      } else {
        throw new Error(result.message || "Failed to finalize session booking");
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[Session Booking Failure]:", errorMsg);
      alert(`Booking Failed: ${errorMsg}`);
    } finally {
      setIsBooking(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!session || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    
    try {
      const jspdfModule = await loadJsPDF();
      const { jsPDF } = jspdfModule;
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const margin = 15;
      const pageWidth = 210;
      
      // 1. Header Banner
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, pageWidth, 45, "F");
      
      doc.setTextColor(212, 175, 55); // Gold
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CNM SYSTEM LABS", margin, 18);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("STUDENT DIAGNOSTIC PERFORMANCE REPORT", margin, 26);
      
      const genDate = new Date(session.completedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      doc.setTextColor(140, 140, 140);
      doc.setFontSize(8.5);
      doc.text(`Generated On: ${genDate}  |  Source: Library Audit`, margin, 34);
      
      // 2. Student Info Card
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, 52, pageWidth - 2 * margin, 25, "F");
      doc.rect(margin, 52, pageWidth - 2 * margin, 25, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Student Name:", margin + 5, 59);
      doc.text("Academic Class:", margin + 5, 66);
      doc.text("Target Exam:", margin + 5, 73);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      doc.text(session.student.name, margin + 45, 59);
      doc.text(session.student.class, margin + 45, 66);
      doc.text(session.student.exam, margin + 45, 73);
      
      // 3. Diagnostics Summary
      const { grade: overallGrade } = getGradeDetails(session.overallScore);
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setFillColor(255, 253, 245);
      doc.rect(margin, 84, pageWidth - 2 * margin, 28, "F");
      doc.rect(margin, 84, pageWidth - 2 * margin, 28, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(18, 18, 18);
      doc.text("Academic Diagnostics Summary", margin + 5, 91);
      
      // Find highest category for PDF Strong Foundation
      const strongCategoryPDF = Object.entries(session.metrics).reduce((max, current) => {
        return current[1] > max[1] ? current : max;
      }, ["Focus", 0])[0];
      const strongCategoryLabelMapPDF: Record<string, string> = {
        "Focus": "Focus & stamina",
        "Revision": "Structured revision",
        "Accuracy": "Problem-solving accuracy",
        "Time Management": "Mock test reviews",
        "Confidence": "Mindset & resilience"
      };
      const strongLabelPDF = strongCategoryLabelMapPDF[strongCategoryPDF] || strongCategoryPDF;

      doc.setFontSize(9.5);
      doc.text(`Overall Score: ${session.overallScore}% (${overallGrade})`, margin + 5, 99);
      doc.text(`Strong Foundation: ${strongLabelPDF}`, margin + 5, 106);
      doc.text(`Highest Impact Area: ${session.primaryBottleneck ? session.primaryBottleneck.category : "None"}`, margin + 95, 99);
      
      // 4. Performance Indexes Table
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, 119, pageWidth - 2 * margin, 8, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(65, 65, 65);
      doc.text("Diagnostic Index Category", margin + 5, 124.5);
      doc.text("Score (%)", margin + 95, 124.5);
      doc.text("Rating Status", margin + 135, 124.5);
      
      let yOffset = 134;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      
      Object.entries(session.metrics).forEach(([catName, catScore]) => {
        doc.text(catName, margin + 5, yOffset);
        doc.text(`${catScore}%`, margin + 95, yOffset);
        doc.text(getGradeDetails(catScore).grade, margin + 135, yOffset);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(margin, yOffset + 3, pageWidth - margin, yOffset + 3);
        
        yOffset += 8.5;
      });
      
      // 5. Potential Improvement Box
      doc.setDrawColor(59, 130, 246); // Blue
      doc.setFillColor(245, 249, 255);
      doc.rect(margin, yOffset + 5, pageWidth - 2 * margin, 24, "F");
      doc.rect(margin, yOffset + 5, pageWidth - 2 * margin, 24, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 64, 175);
      doc.text("Estimated Improvement Potential", margin + 5, yOffset + 11);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const outputText = session.potentialImprovement.gain > 0 
        ? `Addressing your highest impact area can raise overall metrics from ${session.potentialImprovement.currentScore}% to ${session.potentialImprovement.potentialScore}% (an estimated improvement of +${session.potentialImprovement.gain}%).`
        : `Performance benchmarks verified at ${session.potentialImprovement.currentScore}%. Continue focus to secure high ranks.`;
      doc.text(outputText, margin + 5, yOffset + 18);
      
      // 6. Desk booking footer
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, 258, pageWidth - 2 * margin, 20, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text("📍 SESSION LOCATION: CNM SYSTEM LABS, 2nd FLOOR DESK", margin + 5, 265);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Present this report or Booking ID (${session.bookingId || "N/A"}) at desk. Queue Number: ${session.queueNumber || "N/A"}`, margin + 5, 272);
      
      doc.save(`CNM-Diagnostic-Report-${session.student.name.replace(/\s+/g, "_")}.pdf`);
      console.log("[PDF Download Success]: Branded PDF generated.");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[PDF Download Error]: Failed to create PDF report:", errorMsg);
      alert("Failed to compile PDF report: CDN connection error.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  React.useEffect(() => {
    const savedSessionStr = localStorage.getItem("cnm_kiosk_audit_session");

    if (!savedSessionStr) {
      router.replace("/");
      return;
    }

    try {
      const parsedSession: StudentSession = JSON.parse(savedSessionStr);
      
      if (!parsedSession.student || parsedSession.overallScore === undefined) {
        router.replace("/");
        return;
      }

      setSession(parsedSession);

      const submittedIdsStr = localStorage.getItem("cnm_kiosk_submitted_ids") || "[]";
      let submittedIds: string[] = [];
      try {
        submittedIds = JSON.parse(submittedIdsStr);
      } catch {
        submittedIds = [];
      }

      if (!submittedIds.includes(parsedSession.submissionId)) {
        submitLeadToSheet(parsedSession, submittedIds);
      }

    } catch (e) {
      console.error("Failed to parse session info", e);
      router.replace("/");
      return;
    }

    const today = new Date();
    const formatted = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setConductedDate(formatted);
  }, [router]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">
          Loading report session...
        </div>
      </div>
    );
  }

  const { overallScore, student, metrics, primaryBottleneck, topBottlenecks, archetype, potentialImprovement, personalizedInsight } = session;
  const { grade } = getGradeDetails(overallScore);

  const getCategoryColorClass = (catScore: number) => {
    if (catScore >= 75) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (catScore >= 60) return "text-gold bg-gold/10 border-gold/20";
    if (catScore >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getCategoryGradeName = (catScore: number) => {
    return getGradeDetails(catScore).grade;
  };

  // Find highest scoring category for Strong Foundations
  const strongCategory = Object.entries(metrics).reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  }, ["Focus", 0])[0];

  // Find overall quality label for summary
  const getOverallPrepLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Average";
    if (score >= 40) return "At Risk";
    return "Critical";
  };
  const overallPrepLabel = getOverallPrepLabel(overallScore);

  // Dynamic values
  const primaryCat = primaryBottleneck ? primaryBottleneck.category : null;
  const primaryObsText = primaryCat ? PRIMARY_OBSERVATIONS[primaryCat] : "Your core study systems are verified stable across all measured categories.";
  const whatMeansText = primaryCat ? WHAT_THIS_MEANS[primaryCat] : "You have established a solid prep foundation. Focus on advanced test strategies to maximize your competitive rank potential.";
  const summaryObsText = primaryCat ? PREP_SUMMARY_OBSERVATIONS[primaryCat] : "Preparation benchmarks are verified stable.";
  
  // Strong foundations mappings
  const strongObsText = STRONG_FOUNDATIONS[strongCategory]?.observation || "Your consistency is developing well.";
  const strongExplanationText = STRONG_FOUNDATIONS[strongCategory]?.explanation || "Your commitment to standard preparation cycles is positive.";

  const strongCategoryLabelMap: Record<string, string> = {
    "Focus": "Focus and study stamina",
    "Revision": "Structured revision habits",
    "Accuracy": "Conceptual problem-solving accuracy",
    "Time Management": "Mock test review habits",
    "Confidence": "Exam-day mindset and resilience"
  };
  const strongCategoryLabel = strongCategoryLabelMap[strongCategory] || strongCategory;

  const getWeakestPhrases = () => {
    const sorted = Object.entries(metrics).sort((a, b) => a[1] - b[1]);
    const mapping: Record<string, string> = {
      "Revision": "revision process",
      "Time Management": "time allocation and test analysis",
      "Focus": "study focus duration",
      "Accuracy": "problem-solving accuracy",
      "Confidence": "exam-day anxiety management"
    };
    const weak = sorted.slice(0, 3).map(([cat]) => mapping[cat]);
    if (weak.length === 0) return "study system structure";
    if (weak.length === 1) return weak[0];
    if (weak.length === 2) return `${weak[0]} and ${weak[1]}`;
    return `${weak[0]}, ${weak[1]} and ${weak[2]}`;
  };

  const getWeakestCategoryBulletPoints = () => {
    const sorted = Object.entries(metrics).sort((a, b) => a[1] - b[1]);
    const bullets: string[] = [];
    
    // Take bottom 3 categories
    const bottom3 = sorted.slice(0, 3).map(([cat]) => cat);
    
    bottom3.forEach(cat => {
      if (cat === "Time Management") {
        bullets.push("Revision");
        bullets.push("Time Management");
        bullets.push("Test Analysis");
      } else if (cat === "Focus") {
        bullets.push("Focus");
      } else if (cat === "Revision") {
        bullets.push("Revision");
      } else if (cat === "Accuracy") {
        bullets.push("Accuracy");
      } else if (cat === "Confidence") {
        bullets.push("Confidence");
      }
    });
    
    const result = Array.from(new Set(bullets));
    if (result.length === 0) {
      return ["Revision", "Time Management", "Test Analysis"];
    }
    return result;
  };

  return (
    <div className="w-full max-w-4xl py-6 space-y-8 animate-fade-in font-sans">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2 px-4 rounded-lg bg-card/60 border border-border/40 hover:border-border"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Terminal
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-hover transition-colors py-2 px-4 rounded-lg bg-gold/5 border border-gold/20 hover:border-gold/40 cursor-pointer min-h-[40px] disabled:opacity-50"
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download Report PDF"}
          </button>
          
          <button className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-hover transition-colors py-2 px-4 rounded-lg bg-gold/5 border border-gold/20 hover:border-gold/40 cursor-pointer min-h-[40px]">
            <RefreshCw className="h-4 w-4" />
            Synchronize Data
          </button>
        </div>
      </div>

      {/* Main Scoring & Performance Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Overall Score Badge */}
          <div className="flex flex-col items-center justify-center space-y-4 py-6 border-b md:border-b-0 md:border-r border-border/60">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              Overall Score
            </span>
            <ScoreBadge score={overallScore} size="lg" className="w-full max-w-[220px]" />
            
            <div className="text-center space-y-1 mt-2">
              <span className="text-xs text-gold font-mono block font-bold">Report Confidence: High</span>
              <span className="text-[10px] text-zinc-500 block font-mono">Generated from your audit responses.</span>
            </div>
          </div>

          {/* Preparation Summary snapshot */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-gold uppercase tracking-wider block">Diagnostic Overview</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Preparation Summary</h3>
            </div>
            
            <div className="bg-zinc-950/60 p-5 rounded-2xl border border-border/80 space-y-3 font-sans text-sm text-left">
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-zinc-400 font-medium">Overall Preparation</span>
                <span className={cn("font-bold font-mono text-xs px-2 py-0.5 rounded border uppercase tracking-wider scale-95", 
                  overallScore >= 75 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : 
                  overallScore >= 60 ? "text-gold border-gold/20 bg-gold/5" : 
                  overallScore >= 40 ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : 
                  "text-red-400 border-red-500/20 bg-red-500/5"
                )}>
                  {overallPrepLabel}
                </span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-border/20 gap-4">
                <span className="text-zinc-400 font-medium shrink-0">Primary Observation</span>
                <span className="text-white text-right text-xs leading-normal font-light">{summaryObsText}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-zinc-400 font-medium">Strong Foundation</span>
                <span className="text-white text-right text-xs font-semibold">{strongCategoryLabel}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-zinc-400 font-medium">Highest Impact Area</span>
                <span className="text-red-400 text-right text-xs font-semibold font-mono">{primaryCat || "None"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400 font-medium">Estimated Improvement</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">+{potentialImprovement.gain}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Matrix */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 text-left">
        <div className="bg-zinc-900/30 p-2 border border-border/20 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest pl-2">Category Performance Index</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {Object.entries(metrics).map(([catName, catScore]) => {
            const isRevision = catName === "Revision";
            const isAccuracy = catName === "Accuracy";
            const isTime = catName === "Time Management";
            
            let CatIcon = Target;
            if (isRevision) CatIcon = BookOpen;
            if (isAccuracy) CatIcon = Activity;
            if (isTime) CatIcon = Clock;
            if (catName === "Confidence") CatIcon = MessageSquare;

            const isBottleneck = topBottlenecks.some(b => b.category === catName);
            const isPrimary = primaryBottleneck && primaryBottleneck.category === catName;

            return (
              <div key={catName} className={cn(
                "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300",
                isPrimary 
                  ? "bg-red-500/[0.01] border-red-500/20 hover:border-red-500/40" 
                  : "bg-card border-border hover:border-gold/20"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                    isPrimary 
                      ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                      : "bg-[#1E1E1E] text-zinc-400 border border-border"
                  )}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      {catName}
                      {isPrimary && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 uppercase tracking-widest font-extrabold scale-90">
                          Primary Opportunity
                        </span>
                      )}
                      {!isPrimary && isBottleneck && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-widest font-bold scale-90">
                          Opportunity
                        </span>
                      )}
                    </h4>
                    <span className="text-zinc-500 text-[10px]">Rating: {getCategoryGradeName(catScore)}</span>
                  </div>
                </div>

                {/* Progress bar on card */}
                <div className="flex items-center gap-4 flex-1 sm:justify-end">
                  <div className="h-1.5 w-full bg-zinc-900 border border-border/20 rounded-full overflow-hidden relative max-w-[120px] hidden sm:block">
                    <div 
                      style={{ width: `${catScore}%` }} 
                      className={cn("h-full rounded-full",
                        catScore >= 75 ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]" :
                        catScore >= 60 ? "bg-gold shadow-[0_0_6px_rgba(212,175,55,0.3)]" :
                        catScore >= 40 ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]" :
                        "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)]"
                      )}
                    />
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded border font-semibold font-mono", getCategoryColorClass(catScore))}>
                    {catScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Observation & What This Means */}
      <div className="bg-[#141414]/90 border border-border rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 text-left">
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-red-500/70" />
        
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
            <ShieldAlert className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">Primary Observation</span>
            <h3 className="text-white font-bold text-base leading-snug font-sans">
              {primaryObsText}
            </h3>
          </div>
        </div>
        
        <div className="pl-14 border-t border-border/15 pt-4 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">What This Means</span>
          <p className="text-zinc-300 text-sm leading-relaxed font-light">
            {whatMeansText}
          </p>
        </div>
      </div>

      {/* Strong Foundations */}
      <div className="bg-[#141414]/90 border border-border rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 text-left">
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-emerald-500/70" />
        
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Strong Foundations</span>
            <h3 className="text-white font-bold text-base leading-snug font-sans">
              {strongObsText}
            </h3>
          </div>
        </div>
        
        <div className="pl-14 border-t border-border/15 pt-4 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Impact Detail</span>
          <p className="text-zinc-300 text-sm leading-relaxed font-light">
            {strongExplanationText}
          </p>
        </div>
      </div>

      {/* Highest Impact Area & Improvement Potential */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-blue-500/70" />
        
        <div className="flex items-start gap-4 flex-1">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Highest Impact Area</span>
            <h3 className="text-white font-bold text-lg font-sans">
              {primaryCat || "Advanced Strategy"}
            </h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              {potentialImprovement.gain > 0 ? (
                <>
                  Addressing this specific diagnostic bottleneck could significantly raise your overall preparation index.
                </>
              ) : (
                <>
                  Performance benchmarks verified stable at peak limits. Continue focus to secure high ranks.
                </>
              )}
            </p>
            <div className="pt-1">
              <span className="text-[9px] text-zinc-500 block italic leading-tight font-mono">
                How We Calculated This: Estimated using your lowest scoring preparation dimensions.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0 bg-zinc-950/60 p-5 rounded-2xl border border-border/80 w-full md:w-56 font-mono text-xs">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-zinc-500">Current Preparation Score</span>
            <span className="text-white font-bold">{potentialImprovement.currentScore}%</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-border/20 pb-2">
            <span className="text-zinc-500">Potential Preparation Score</span>
            <span className="text-gold font-bold">{potentialImprovement.potentialScore}%</span>
          </div>
          <div className="flex justify-between items-center pt-1.5">
            <span className="text-emerald-400 font-semibold">Estimated Improvement</span>
            <span className="text-emerald-400 font-extrabold text-sm">+{potentialImprovement.gain}%</span>
          </div>
        </div>
      </div>

      {/* What Your Report Says */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-left space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight font-sans">What Your Report Says</h3>
        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-none">Based on your answers...</p>
        <div className="space-y-4 text-zinc-300 text-sm md:text-base leading-relaxed font-light font-sans">
          <p>You're putting in enough effort.</p>
          <p>
            However, your <span className="text-white font-semibold">{getWeakestPhrases()}</span> are costing you valuable marks.
          </p>
          <p>These are process problems, not intelligence problems.</p>
        </div>
      </div>

      {/* Good News */}
      <div className="bg-emerald-500/[0.02] border border-emerald-500/20 hover:border-emerald-500/30 rounded-2xl p-6 md:p-8 text-left relative overflow-hidden shadow-lg">
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-emerald-500/70" />
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-emerald-400 font-sans">Good News</h3>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-light font-sans">
              These problems are fixable. Students with a preparation pattern similar to yours often improve their performance after correcting their study system.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="text-center py-4 space-y-1">
        <div className="text-zinc-700 text-sm font-mono tracking-widest leading-none">──────────────────────────</div>
        <div className="text-base md:text-lg font-bold font-mono uppercase animate-shimmer-text">Recommended Next Step</div>
        <div className="text-zinc-700 text-sm font-mono tracking-widest leading-none">──────────────────────────</div>
      </div>

      {/* Study System Reset Bootcamp Card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Offline Illustration Hero Image */}
          <div className="w-full lg:w-1/3 shrink-0 rounded-xl overflow-hidden border border-border bg-zinc-950/40 relative aspect-video lg:aspect-square">
            <Image 
              src="/offline-kiosk-session.png" 
              alt="Study System Reset Bootcamp Illustration"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority
            />
          </div>
          
          <div className="flex-1 space-y-5 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block">Recommended based on your Performance Audit.</span>
              <h3 className="text-2xl font-bold text-white">🎯 Study System Reset Bootcamp</h3>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <a
                href="https://maps.app.goo.gl/Hma99SxdirGofdiD7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-zinc-900 border border-border/40 text-zinc-300 text-xs font-mono hover:border-gold/30 transition-colors"
              >
                <span className="flex items-center gap-1.5"><span>📍</span><span>CNM System Labs</span></span>
                <span className="text-[10px] text-gold/70 font-mono">Click to view on Google Maps</span>
              </a>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-border/40 text-zinc-300 text-xs font-mono">
                <span>🕒</span>
                <span>{BOOTCAMP_CONFIG.duration}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-border/40 text-zinc-300 text-xs font-mono">
                <span>👥</span>
                <span>Small Group Workshop</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-border/40 text-zinc-300 text-xs font-mono">
                <span>🎯</span>
                <span>Personalized Guidance</span>
              </div>
            </div>

            {/* You'll Learn bullet points */}
            <div className="bg-zinc-950/40 border border-border/60 rounded-xl p-4 space-y-2.5">
              <h4 className="text-white text-xs font-mono uppercase tracking-wider mb-2">You'll Learn</h4>
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Why your marks are stuck</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>How toppers structure revision</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>How to analyse mock tests</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Your personalised 30-day action plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why We Recommended This */}
      <div className="bg-card/40 border border-border/60 rounded-2xl p-6 text-left space-y-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Why We Recommended This</h4>
        <p className="text-zinc-300 text-sm leading-relaxed font-light font-sans">
          We recommend this bootcamp because your audit indicates improvement opportunities in:
        </p>
        <div className="space-y-1.5 pl-1">
          {getWeakestCategoryBulletPoints().map((bullet) => (
            <div key={bullet} className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{bullet}</span>
            </div>
          ))}
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed font-light font-sans">
          This bootcamp focuses specifically on improving these areas.
        </p>
      </div>

      {/* Upcoming Bootcamp Card */}
      <div className="bg-card border-2 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl space-y-6 animate-gold-border-glow">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="space-y-1 text-left">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight font-sans">
            📅 Upcoming Study System Reset Bootcamp
          </h3>
          <p className="text-zinc-400 text-xs md:text-sm font-light font-sans">
            Recommended based on your Performance Audit
          </p>
        </div>

        {/* Large Easy-to-Read Info Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
          <div className="bg-[#1E1E1E]/80 border border-border p-4 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">📅 Date</span>
            <span className="text-white text-sm md:text-base font-bold font-sans">{BOOTCAMP_CONFIG.date}</span>
          </div>
          <div className="bg-[#1E1E1E]/80 border border-border p-4 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">🕒 Time</span>
            <span className="text-white text-sm md:text-base font-bold font-sans">{BOOTCAMP_CONFIG.time}</span>
          </div>
          <div className="bg-[#1E1E1E]/80 border border-border p-4 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">📍 Venue</span>
            <a
              href="https://maps.app.goo.gl/Hma99SxdirGofdiD7"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-gold transition-colors"
            >
              <span className="text-white text-sm md:text-base font-bold font-sans hover:text-gold transition-colors block">{BOOTCAMP_CONFIG.venue}</span>
              <span className="text-[10px] text-gold/70 font-mono">Click to view on Google Maps</span>
            </a>
          </div>
          <div className="bg-[#1E1E1E]/80 border border-border p-4 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">👥 Format</span>
            <span className="text-white text-sm md:text-base font-bold font-sans">{BOOTCAMP_CONFIG.format}</span>
          </div>
          <div className="bg-[#1E1E1E]/80 border border-border p-4 rounded-xl space-y-1 sm:col-span-2 md:col-span-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">⏱ Duration</span>
            <span className="text-white text-sm md:text-base font-bold font-sans">{BOOTCAMP_CONFIG.duration}</span>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
        <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/40 border border-border/60 text-sm md:text-base text-zinc-300 font-mono font-medium">
          <span>👥</span>
          <span>500+ Students Audited</span>
        </div>
        <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/40 border border-border/60 text-sm md:text-base text-zinc-300 font-mono font-medium">
          <span>⭐</span>
          <span>Small Group Workshop</span>
        </div>
        <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/40 border border-border/60 text-sm md:text-base text-zinc-300 font-mono font-medium">
          <span>⏱</span>
          <span>20-Minute Interactive Session</span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          onClick={handleBookSession}
          disabled={isBooking || session.sessionStatus === "Booked"}
          className={cn(
            "w-full px-10 py-5 font-bold text-sm md:text-base rounded-xl tracking-wide uppercase transition-all duration-300 min-h-[56px] flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_25px_rgba(59,130,246,0.2)] shrink-0",
            session.sessionStatus === "Booked"
              ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 hover:border-blue-600 hover:shadow-[0_4px_30px_rgba(59,130,246,0.3)]"
          )}
        >
          {isBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Booking Bootcamp Seat...
            </>
          ) : session.sessionStatus === "Booked" ? (
            <>Bootcamp Seat Booked ✓</>
          ) : (
            <>Book My Bootcamp Seat</>
          )}
        </button>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 text-left bg-card border border-border rounded-2xl p-6 md:p-8">
        <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans border-b border-border/40 pb-2">Frequently Asked Questions</h3>
        <div className="space-y-4 font-sans">
          <div className="space-y-1">
            <h4 className="text-white text-sm font-semibold">Is this Bootcamp completely free?</h4>
            <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed">
              Yes, the Bootcamp session is completely free.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-white text-sm font-semibold">Is this coaching?</h4>
            <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed">
              No. It is a diagnostic workshop designed to help you improve your study system based on your audit.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-white text-sm font-semibold">Do I need to bring anything?</h4>
            <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed">
              Bring your latest mock test if available.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center justify-center gap-1 py-8 text-[10px] text-zinc-600 font-mono border-t border-border/40">
        <span>CNM System Labs</span>
        <span>Driven by Rank Engine</span>
      </div>
    </div>
  );
}

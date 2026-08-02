export interface Option {
  label: string;
  labelHindi?: string;
  points: number;
  description?: string;
  descriptionHindi?: string;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  textHindi?: string;
  description?: string;
  descriptionHindi?: string;
  helperText?: string;
  helperTextHindi?: string;
  options: Option[];
}

export const questions: Question[] = [
  // FOCUS (q1 - q4)
  {
    id: "q1",
    category: "Focus",
    text: "How often do you check your phone during study sessions?",
    textHindi: "पढ़ाई के दौरान आप कितनी बार अपना फ़ोन चेक करते हैं?",
    options: [
      { label: "Almost Never", labelHindi: "लगभग कभी नहीं", points: 10 },
      { label: "1–2 Times", labelHindi: "1–2 बार", points: 7 },
      { label: "3–5 Times", labelHindi: "3–5 बार", points: 4 },
      { label: "Constantly", labelHindi: "लगातार (बार-बार)", points: 0 }
    ]
  },
  {
    id: "q2",
    category: "Focus",
    text: "Can you study continuously for 90 minutes without distraction?",
    textHindi: "क्या आप बिना किसी Distraction के लगातार 90 मिनट तक पढ़ाई कर सकते हैं?",
    options: [
      { label: "Easily", labelHindi: "आसानी से", points: 10 },
      { label: "Most Days", labelHindi: "ज़्यादातर दिनों में", points: 7 },
      { label: "Rarely", labelHindi: "शायद ही कभी", points: 3 },
      { label: "Never", labelHindi: "कभी नहीं", points: 0 }
    ]
  },
  {
    id: "q3",
    category: "Focus",
    text: "How often does your mind wander while studying?",
    textHindi: "पढ़ाई करते समय आपका ध्यान कितनी बार भटकता है?",
    options: [
      { label: "Almost Never", labelHindi: "लगभग कभी नहीं", points: 10 },
      { label: "Rarely", labelHindi: "शायद ही कभी", points: 7 },
      { label: "Sometimes", labelHindi: "कभी-कभी", points: 5 },
      { label: "Frequently", labelHindi: "अक्सर", points: 2 },
      { label: "Constantly", labelHindi: "लगातार (हमेशा)", points: 0 }
    ]
  },
  {
    id: "q4",
    category: "Focus",
    text: "When you sit to study, how long does it take before real studying starts?",
    textHindi: "जब आप पढ़ाई करने बैठते हैं, तो असली पढ़ाई शुरू होने में कितना समय लगता है?",
    options: [
      { label: "Immediately", labelHindi: "तुरंत", points: 10 },
      { label: "5–10 Minutes", labelHindi: "5–10 मिनट", points: 7 },
      { label: "10–20 Minutes", labelHindi: "10–20 मिनट", points: 3 },
      { label: "20+ Minutes", labelHindi: "20 मिनट से ज़्यादा", points: 0 }
    ]
  },
  // REVISION (q5 - q8)
  {
    id: "q5",
    category: "Revision",
    text: "How often do you revise completed chapters?",
    textHindi: "आप पूरे हो चुके Chapters का Revision कितनी बार करते हैं?",
    options: [
      { label: "Weekly", labelHindi: "हर हफ़्ते (Weekly)", points: 10 },
      { label: "Every 2–3 Weeks", labelHindi: "हर 2–3 हफ़्ते में", points: 7 },
      { label: "Occasionally", labelHindi: "कभी-कभार", points: 3 },
      { label: "Almost Never", labelHindi: "लगभग कभी नहीं", points: 0 }
    ]
  },
  {
    id: "q6",
    category: "Revision",
    text: "After 30 days, how much of a chapter do you typically remember?",
    textHindi: "30 दिनों के बाद, आमतौर पर आपको एक Chapter का कितना हिस्सा याद रहता है?",
    options: [
      { label: "80–100%", labelHindi: "80–100%", points: 10 },
      { label: "60–80%", labelHindi: "60–80%", points: 7 },
      { label: "40–60%", labelHindi: "40–60%", points: 3 },
      { label: "Less Than 40%", labelHindi: "40% से कम", points: 0 }
    ]
  },
  {
    id: "q7",
    category: "Revision",
    text: "Do you maintain short notes or revision notes?",
    textHindi: "क्या आप Short Notes या Revision Notes बनाते हैं?",
    options: [
      { label: "For Every Chapter", labelHindi: "हर एक Chapter के लिए", points: 10 },
      { label: "For Most Chapters", labelHindi: "ज़्यादातर Chapters के लिए", points: 7 },
      { label: "For Few Chapters", labelHindi: "कुछ ही Chapters के लिए", points: 3 },
      { label: "No Notes", labelHindi: "कोई Notes नहीं", points: 0 }
    ]
  },
  {
    id: "q8",
    category: "Revision",
    text: "Do you have a fixed revision schedule?",
    textHindi: "क्या आपके पास Revision का कोई फिक्स्ड Schedule है?",
    options: [
      { label: "Always", labelHindi: "हमेशा", points: 10 },
      { label: "Mostly", labelHindi: "ज़्यादातर समय", points: 7 },
      { label: "Sometimes", labelHindi: "कभी-कभी", points: 3 },
      { label: "Never", labelHindi: "कभी नहीं", points: 0 }
    ]
  },
  // PRACTICE & CONCEPTS (q9 - q12)
  {
    id: "q9",
    category: "Accuracy",
    text: "When facing a difficult question, what do you usually do?",
    textHindi: "किसी कठिन Question का सामना करने पर आप आमतौर पर क्या करते हैं?",
    options: [
      { label: "Try Multiple Approaches", labelHindi: "अलग-अलग तरीक़ों (Approaches) से कोशिश करते हैं", points: 10 },
      { label: "Revisit Concepts", labelHindi: "Concepts दोबारा पढ़ते हैं", points: 7 },
      { label: "Check Solution Quickly", labelHindi: "जल्दी से Solution देख लेते हैं", points: 3 },
      { label: "Skip It", labelHindi: "उसे छोड़ (Skip कर) देते हैं", points: 0 }
    ]
  },
  {
    id: "q10",
    category: "Accuracy",
    text: "How often do you reattempt wrong questions?",
    textHindi: "आप गलत हुए Questions को दोबारा कितनी बार खुद से सॉल्व करने की कोशिश करते हैं?",
    options: [
      { label: "Always", labelHindi: "हमेशा", points: 10 },
      { label: "Often", labelHindi: "अक्सर", points: 7 },
      { label: "Sometimes", labelHindi: "कभी-कभी", points: 3 },
      { label: "Never", labelHindi: "कभी नहीं", points: 0 }
    ]
  },
  {
    id: "q11",
    category: "Accuracy",
    text: "How comfortable are you with applying concepts to new questions?",
    textHindi: "नये Questions में Concepts लागू करने में आप कितनी सहूलियत महसूस करते हैं?",
    options: [
      { label: "Very Comfortable", labelHindi: "बहुत सहज (Very Comfortable)", points: 10 },
      { label: "Comfortable", labelHindi: "सहज (Comfortable)", points: 7 },
      { label: "Somewhat Comfortable", labelHindi: "थोड़ा सहज (Somewhat Comfortable)", points: 3 },
      { label: "Not Comfortable", labelHindi: "बिल्कुल सहज नहीं", points: 0 }
    ]
  },
  {
    id: "q12",
    category: "Accuracy",
    text: "How many quality questions do you solve daily?",
    textHindi: "आप रोज़ाना कितने अच्छे Quality Questions सॉल्व करते हैं?",
    options: [
      { label: "100+", labelHindi: "100 से ज़्यादा", points: 10 },
      { label: "50–100", labelHindi: "50–100", points: 7 },
      { label: "20–50", labelHindi: "20–50", points: 3 },
      { label: "Less Than 20", labelHindi: "20 से कम", points: 0 }
    ]
  },
  // TEST PERFORMANCE (q13 - q16)
  {
    id: "q13",
    category: "Time Management",
    text: "How often do you take mock tests?",
    textHindi: "आप कितनी बार Mock Tests देते हैं?",
    options: [
      { label: "Weekly", labelHindi: "हर हफ़्ते (Weekly)", points: 10 },
      { label: "Twice Monthly", labelHindi: "महीने में 2 बार", points: 7 },
      { label: "Monthly", labelHindi: "महीने में 1 बार", points: 3 },
      { label: "Rarely", labelHindi: "शायद ही कभी", points: 0 }
    ]
  },
  {
    id: "q14",
    category: "Time Management",
    text: "What do you do after a mock test?",
    textHindi: "Mock Test देने के बाद आप क्या करते हैं?",
    options: [
      { label: "Detailed Analysis", labelHindi: "विस्तार से Analysis (Detailed Analysis) करते हैं", points: 10 },
      { label: "Quick Review", labelHindi: "जल्दी से एक बार Review कर लेते हैं", points: 7 },
      { label: "Only Check Score", labelHindi: "सिर्फ़ Score देखते हैं", points: 3 },
      { label: "Move On", labelHindi: "आगे बढ़ जाते हैं (कुछ नहीं करते)", points: 0 }
    ]
  },
  {
    id: "q15",
    category: "Time Management",
    text: "How many mistakes are usually silly mistakes?",
    textHindi: "आपकी गलतियों में से कितनी गलतियाँ आमतौर पर Silly Mistakes (छोटी-मोटी भूल) होती हैं?",
    options: [
      { label: "Very Few", labelHindi: "बहुत ही कम", points: 10 },
      { label: "Some", labelHindi: "कुछ हद तक", points: 7 },
      { label: "Many", labelHindi: "काफ़ी ज़्यादा", points: 3 },
      { label: "Most Mistakes", labelHindi: "ज़्यादातर गलतियाँ", points: 0 }
    ]
  },
  {
    id: "q16",
    category: "Time Management",
    text: "Do you maintain an error log of mistakes?",
    textHindi: "क्या आप अपनी गलतियों का Error Log (गलतियों का रिकॉर्ड) रखते हैं?",
    options: [
      { label: "Always", labelHindi: "हमेशा", points: 10 },
      { label: "Often", labelHindi: "अक्सर", points: 7 },
      { label: "Occasionally", labelHindi: "कभी-कभार", points: 3 },
      { label: "Never", labelHindi: "कभी नहीं", points: 0 }
    ]
  },
  // EXECUTION & MINDSET (q17 - q20)
  {
    id: "q17",
    category: "Confidence",
    text: "How often do you complete your planned study targets?",
    textHindi: "आप अपने तय किए गए Study Targets को कितनी बार पूरा कर पाते हैं?",
    options: [
      { label: "Almost Always", labelHindi: "लगभग हमेशा", points: 10 },
      { label: "Often", labelHindi: "अक्सर", points: 7 },
      { label: "Sometimes", labelHindi: "कभी-कभी", points: 3 },
      { label: "Rarely", labelHindi: "शायद ही कभी", points: 0 }
    ]
  },
  {
    id: "q18",
    category: "Confidence",
    text: "Current Pending Syllabus level?",
    textHindi: "फिलहाल आपका कितना Syllabus बाकी (Pending) है?",
    options: [
      { label: "No Pending Syllabus", labelHindi: "कोई Pending Syllabus नहीं", points: 10 },
      { label: "Small Pending Syllabus", labelHindi: "थोड़ा-सा Pending Syllabus", points: 7 },
      { label: "Moderate Pending Syllabus", labelHindi: "मध्यम (Moderate) Pending Syllabus", points: 3 },
      { label: "Large Pending Syllabus", labelHindi: "काफ़ी ज़्यादा Pending Syllabus", points: 0 }
    ]
  },
  {
    id: "q19",
    category: "Confidence",
    text: "How do you react after a poor mock test?",
    textHindi: "Mock Test में कम मार्क्स आने पर आप कैसा महसूस या रिएक्ट करते हैं?",
    options: [
      { label: "Analyze And Improve", labelHindi: "गलतियाँ देखकर सुधार करते हैं (Analyze And Improve)", points: 10 },
      { label: "Recover Quickly", labelHindi: "जल्दी से संभालते हैं और आगे बढ़ते हैं", points: 7 },
      { label: "Feel Demotivated", labelHindi: "Demotivated महसूस करते हैं", points: 3 },
      { label: "Give Up For A While", labelHindi: "कुछ समय के लिए पढ़ाई छोड़ देते हैं", points: 0 }
    ]
  },
  {
    id: "q20",
    category: "Confidence",
    text: "How confident are you about achieving your target rank?",
    textHindi: "अपनी Target Rank हासिल करने को लेकर आप कितने कॉन्फिडेंट हैं?",
    options: [
      { label: "Very Confident", labelHindi: "बहुत कॉन्फिडेंट (Very Confident)", points: 10 },
      { label: "Confident", labelHindi: "कॉन्फिडेंट", points: 7 },
      { label: "Unsure", labelHindi: "अनिश्चित (Unsure)", points: 3 },
      { label: "Not Confident", labelHindi: "बिल्कुल कॉन्फिडेंट नहीं", points: 0 }
    ]
  }
];

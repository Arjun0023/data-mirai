import StreamLabsLogo from "../assets/streamlabs-logo.png";
import BroadcastlyLogo from "../assets/broadcastly-logo.png";
import LiveStreamerLogo from "../assets/livestreamer-logo.png";
import CloudCastLogo from "../assets/cloudcast-logo.png";

import streamImage from "../assets/streamer.jpeg";
import chart from "../assets/chart.png";
import optimize from "../assets/optimize.jpeg";
import audienceEngagementImage from "../assets/audience.jpeg";
import monetizeImage from "../assets/monetize.jpeg";
import automationImage from "../assets/automation.jpeg";
import user1 from "../assets/user1.jpeg";
import user2 from "../assets/user2.jpeg";
import user3 from "../assets/user3.jpeg";
import user4 from "../assets/user4.jpeg";
import user5 from "../assets/user5.jpeg";
import user6 from "../assets/user6.jpeg";

import {
  RiBarChart2Line,
  RiSettings2Line,
  RiTeamLine,
  RiTwitchLine,
  RiTerminalWindowLine,
  RiYoutubeLine,
  RiCalendarLine,
  RiLockFill,
  RiSortAlphabetDesc,
  RiTerminalBoxFill
} from "@remixicon/react";

export const HERO_CONTENT = {
  badgeText: "🚀 New Feature: View Insights in Your Language Now Live!",
  mainHeading: "Automatic Analytics \n Instant Clarity",
  subHeading:
    "Upload your data. Ask questions in English, Hinglish, or any Indian language. Get instant charts, insights, and actionable steps – all without hiring a data team.",
  callToAction: {
    primary: "Get Started",
    secondary: "View Demo",
  },
  trustedByText: "Turn Your Excel & CSV Data Into Smart Insights – In Your Language. No Technical Expertise Needed.",
};

export const BRAND_LOGOS = [
  { src: StreamLabsLogo, alt: "StreamLabs" },
  { src: BroadcastlyLogo, alt: "Broadcastly" },
  { src: LiveStreamerLogo, alt: "LiveStreamer" },
  { src: CloudCastLogo, alt: "CloudCast" },
];

export const HOW_IT_WORKS_CONTENT = {
  sectionTitle: "The Problem we Solve!",
  sectionDescription:
    "Small businesses often sit on valuable data without the means to understand or act on it. Hiring data analysts is expensive. Using BI tools is complicated. That’s where we come in.",
  steps: [
    {
      title: "Upload Your Excel File",
      description:
        "Simply drag and drop your Excel (.csv) file—no technical skills needed.",
      imageSrc: streamImage,
      imageAlt: "Streaming Setup",
    },
    {
      title: "Ask Your Question",
      description:
        "Type your question in plain English, Hinglish, or any Indian language. Ask anything, like: “Show monthly sales trend” or “पिछले महीने के टॉप 5 उत्पाद क्या थे?”",
      imageSrc: audienceEngagementImage,
      imageAlt: "Audience Engagement",
      users: [user1, user2, user3, user5],
    },
    {
      title: "Get Instant Insights",
      description:
        "We’ll generate a visual chart, a summary of key takeaways, and action steps – all in seconds.",
      imageSrc: chart,
      imageAlt: "Performance Analytics",
    },
    {
      title: "We Analyze Your Data",
      description:
        "Our engine processes your data and interprets your question to find the most relevant insights.",
      imageSrc: optimize,
      imageAlt: "Optimize Settings",
    },
    {
      title: "Save to Dashboard",
      description:
        "Like the chart? Just click “Save to Dashboard” and it’s added instantly.",
      imageSrc: monetizeImage,
      imageAlt: "Monetization",
    },
    {
      title: "View Charts, Summaries & Actionable Insights",
      description:
        "Get an instant visualization, a written summary, and AI-suggested next steps tailored to your business goals.",
      imageSrc: automationImage,
      imageAlt: "Workflow Automation",
    },
  ],
};

export const KEY_FEATURES_CONTENT = {
  sectionTitle: "Features",
  sectionDescription:
    "Everything You Need – Nothing You Don’t",
  features: [
    {
      id: 1,
      icon: <RiBarChart2Line className="w-8 h-8" />,
      title: "📈 Auto-Generated Charts & Summaries",
      description:
        "Visualizations with plain-language explanations and business insights.",
    },
    {
      id: 2,
      icon: <RiSettings2Line className="w-8 h-8" />,
      title: " No Technical Skills Required",
      description:
        "Designed for business users, not developers or analysts.",
    },
    {
      id: 3,
      icon: <RiLockFill className="w-8 h-8" />,
      title: "Secure & Private",
      description:
        "Your data is never shared. Everything stays safe and secure.",
    },
    {
      id: 4,
      icon: <RiSortAlphabetDesc className="w-8 h-8" />,
      title: "Multilingual AI Query Engine",
      description:
        "Ask questions in regional Indian languages – no need to translate your thoughts.",
    },
    {
      id: 5,
      icon: <RiTerminalBoxFill className="w-8 h-8" />,
      title: "Manual Chart Builder",
      description:
        "Build personalized views with drag-and-drop widgets, filters, and charts tailored to different team needs—from execs to analysts.",
    },
    {
      id: 6,
      icon: <RiCalendarLine className="w-8 h-8" />,
      title: "Data Driven Descision Making",
      description:
        "Make data driven decisions with real-time data analysis and insights.",
    },
  ],
};

export const PLANS_CONTENT = {
  sectionTitle: "Choose Your Plan",
  sectionDescription:
    "AutoInsigh Ai offers flexible pricing plans to fit every user’s needs, from beginner to pro.",
  popularBadge: "Most Popular",
  ctaText: "Get Started",
  plans: [
    {
      name: "Basic",
      price: "₹ 1499/month",
      description:
        "Ideal for small businesses just getting started with data.",
      features: [
        "Auto-generated analytics from CSV",
        "Simple dashboard views",
        "Export basic reports",
        "Supports 1 user",
        "Insights in English",
        
      ],
    },
    {
      name: "Pro",
      price: "₹ 2499/month",
      description:
        "For growing businesses that need deeper insights.",
      features: [
        "Advanced AI-generated insights",
        "Customizable dashboards",
        "Real-time data updates",
        "Up to 5 users",
        "Insights in 6 Indian languages (English, Hindi, Marathi, Tamil, Telugu, Kannada)",
      ],
      popular: true,
    },
    {
      name: "Elite",
      price: "₹5499/month",
      description:
        "For teams that need full control, power, and branding.",
      features: [
        "Full analytics suite with smart recommendations",
        "Insights in all major Indian regional languages",
        "Unlimited users",
        
      ],
    },
  ],
};

export const TESTIMONIALS_CONTENT = {
  sectionTitle: "What Our User Say",
  sectionDescription:
    "Hear from some of the top streamers who use Streamerzz to engage with their audience and grow their channels.",
  reviews: [
    {
      name: "Hardik prajapat",
      title: "Data scientist",
      review:
        "I uploaded a basic sales CSV and got a beautiful dashboard with insights in minutes. No tech skills needed. Super easy to use!",
      image: user1,
    },
    {
      name: "Arjun Pawar",
      title: "software developer",
      review:
        "Love that I can view reports in Marathi. It’s so helpful for our local staff to understand and take action.",
      image: user2,
    },
    {
      name: "Aaliya sutar",
      title: "software developer",
      review:
        "The mobile view of the dashboard is awesome. I can check performance in real-time during meetings or while traveling.",
      image: user3,
    },
    {
      name: "Prateek Lewis",
      title: "Frontend Developer",
      review:
        "We used to create charts manually. Now, the platform does everything automatically with AI. Just upload and go.",
      image: user4,
    },
    {
      name: "Chris Joel",
      title: "AI/ML Developer",
      review:
        "No need to learn anything. Just drag, drop, and your analytics are ready. I even shared the dashboard with my team.",
      image: user5,
    },
    {
      name: "Aditya Chaudhari",
      title: "Frontend Developer",
      review:
        "I don’t know analytics tools like Power BI, but this platform made things simple. The dashboards are clean and very helpful..",
      image: user6,
    },
  ],
};

export const FOOTER_CONTENT = {
  sections: [
    {
      title: "TOOLS & SERVICES",
      links: [
        { text: "Real-time Analytics", url: "#" },
        { text: "Customizable Alerts", url: "#" },
        { text: "Integrated Chat Systems", url: "#" },
        { text: "Instant Notifications", url: "#" },
      ],
    },
    {
      title: "SUPPORT & RESOURCES",
      links: [
        { text: "Subscription Plans", url: "#" },
        { text: "AI Features Guide", url: "#" },
        { text: "Frequently Asked Questions", url: "#" },
        { text: "Product Updates", url: "#" },
        { text: "Community Support", url: "#" },

      ],
    },
    {
      title: "CONNECT WITH US",
      links: [
        { text: "Twitter", url: "#" },
        { text: "LinkedIn", url: "#" },
        { text: "YouTube", url: "#" },
      ],
    },
    {
      title: "LEARN & EXPLORE",
      links: [
        { text: "Regional Insights", url: "#" },
        { text: "Smart Metrics That Matter", url: "#" },
        { text: "Auto Dashboards", url: "#" },
        { text: "Predict What’s Next", url: "#" },
        
      ],
    },
  ],
  platformsText:
    "",
  copyrightText: "© 2025 AutoInisigh, Inc. All rights reserved.",
};

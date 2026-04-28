"use client"

import Link from "next/link"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"
import {
  BookOpen, FileText, Calculator, Receipt, Building2,
  BadgeCheck, Users, Briefcase, Scale, Globe, ArrowRight, ChevronRight
} from "lucide-react"

const Antigravity = dynamic(() => import('../../components/Antigravity'), { ssr: false })

const services = [
  {
    id: "accounting",
    icon: BookOpen,
    gradient: "from-indigo-500 to-blue-500",
    title: "Accounting & Bookkeeping",
    summary: "Accurate, timely books so you always know where your business stands.",
    details: [
      "Maintenance of books of accounts on monthly, quarterly, or annual basis",
      "Journal entries and day-to-day transaction recording — sales, purchases, expenses, receipts",
      "Ledger scrutiny, account-wise analysis, and reconciliation of balances",
      "Bank Reconciliation Statements (BRS)",
      "Trial Balance preparation for management review",
      "Tally ERP / Tally Prime accounting support",
      "Subsidiary records — debtors ledger, creditors ledger, fixed assets register",
    ],
  },
  {
    id: "financial-statements",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-500",
    title: "Financial Statement Preparation",
    summary: "Professionally drafted financials for compliance, lenders, and investors.",
    details: [
      "Balance Sheet as per applicable standards and Schedule III (Companies Act, 2013)",
      "Statement of Profit & Loss with proper income and expenditure classification",
      "Cash Flow Statement — Direct and Indirect methods",
      "Detailed Notes to Accounts — accounting policies, contingent liabilities, related party disclosures",
      "Financial statements for partnership firms, LLPs, and proprietorships",
      "Restating or reformatting financials to meet lender / investor requirements",
    ],
  },
  {
    id: "income-tax",
    icon: Calculator,
    gradient: "from-violet-500 to-purple-500",
    title: "Income Tax Services",
    summary: "End-to-end ITR filing, tax planning, and notice handling for all entity types.",
    details: [
      "ITR filing for individuals (salaried, professional, business), HUFs, firms, LLPs, and companies",
      "Tax computation, income classification, and deduction working under Sections 80C, 80D, 80G, etc.",
      "Tax planning and advisory — legitimate structuring to minimize tax liability",
      "Advance tax computation and payment scheduling (Sections 234B & 234C)",
      "TDS/TCS working, deposit scheduling, and reconciliation with Form 26AS / AIS / TIS",
      "Filing of TDS Returns — Form 24Q, 26Q, 27Q, and 27EQ",
      "Drafting replies to Income Tax notices and representation before Assessing Officer",
      "Capital gains computation — short-term and long-term (shares, mutual funds, property)",
    ],
  },
  {
    id: "gst",
    icon: Receipt,
    gradient: "from-orange-500 to-amber-500",
    title: "GST Services",
    summary: "Complete GST compliance — registration, returns, reconciliation, and advisory.",
    details: [
      "GST registration — regular, composition, casual, non-resident, OIDAR",
      "Monthly / quarterly return filing — GSTR-1, GSTR-3B, CMP-08, GSTR-9, GSTR-9C",
      "GST reconciliation — matching GSTR-2A / 2B with purchase registers and ITC ledgers",
      "Input Tax Credit (ITC) analysis, reversal computation, and annual reconciliation",
      "Advisory on rate classification, place of supply, RCM, and exemptions",
      "Drafting replies to GST notices and departmental communications",
      "GST refund applications — exports, inverted duty structure, excess cash ledger",
    ],
  },
  {
    id: "roc",
    icon: Building2,
    gradient: "from-cyan-500 to-sky-500",
    title: "ROC / Company Law Compliance",
    summary: "Incorporation, annual filings, and ongoing compliance under Companies Act, 2013.",
    details: [
      "Company incorporation — Private Limited, Section 8, OPC (DIN, DSC, name reservation, MOA/AOA)",
      "LLP incorporation — FiLLiP filing, LLP Agreement drafting, designated partner KYC",
      "ROC annual forms — AOC-4 (Financial Statements), MGT-7 / MGT-7A (Annual Return)",
      "Event-based forms — DIR-3 KYC, DIR-12, SH-7, INC-20A, and others",
      "Drafting of Board Resolutions, Notices, and Minutes of Meetings",
      "Director KYC (DIR-3 KYC / DIR-3 KYC Web) — annual filing",
      "Annual compliance calendar management and statutory due date tracking",
    ],
  },
  {
    id: "registrations",
    icon: BadgeCheck,
    gradient: "from-pink-500 to-rose-500",
    title: "MSME, Startup & Other Registrations",
    summary: "All key business registrations handled end-to-end.",
    details: [
      "Udyam Registration (MSME) — online registration and certificate",
      "PAN and TAN application for individuals, firms, companies, HUFs, trusts",
      "Shop & Establishment Registration under respective State Acts",
      "Import Export Code (IEC) registration with DGFT",
      "Startup India Registration — DPIIT recognition and self-certification",
      "Professional Tax Registration and Returns filing",
      "FSSAI (Food License) basic registration and state license assistance",
      "Trademark application filing support and advisory",
    ],
  },
  {
    id: "payroll",
    icon: Users,
    gradient: "from-blue-500 to-indigo-600",
    title: "Payroll Processing & Labour Compliance",
    summary: "Accurate payroll, PF/ESIC compliance, and employee cost optimization.",
    details: [
      "Salary structure design — Basic, HRA, Special Allowance, LTA, Medical",
      "Monthly payroll processing — salary computation, net pay, deduction schedules",
      "PF (Provident Fund) working and monthly challan filing",
      "ESIC contribution working and return filing",
      "Form 16 / Form 16A issuance support",
      "Labour law compliance under the four new Labour Codes",
      "Employee cost optimization — CTC restructuring to maximize take-home",
      "Full and Final Settlement computation upon employee exit",
    ],
  },
  {
    id: "advisory",
    icon: Briefcase,
    gradient: "from-indigo-500 to-blue-500",
    title: "Business Consulting & Advisory",
    summary: "Strategic guidance for startups and growing businesses.",
    details: [
      "Business setup advisory — entity selection to first compliance",
      "Entity selection — Proprietorship vs. Partnership vs. LLP vs. Private Limited",
      "Process improvement review — identifying inefficiencies in financial operations",
      "SOP drafting for finance, accounting, and compliance functions",
      "Internal control design for small and mid-sized businesses",
      "Business plan and financial model preparation for startups",
    ],
  },
  {
    id: "representation",
    icon: Scale,
    gradient: "from-red-500 to-orange-500",
    title: "Representation & Liaison",
    summary: "Expert representation before tax and regulatory authorities.",
    details: [
      "Authorized Representative before Income Tax Department — scrutiny, assessment, rectification",
      "Representation before GST Department — notices, personal hearings, ex-parte prevention",
      "Filing of rectification applications under Section 154 of the Income Tax Act",
      "Filing of condonation of delay applications and miscellaneous petitions",
      "Liaison with PF, ESIC, and other labour department authorities",
    ],
  },
  {
    id: "fema",
    icon: Globe,
    gradient: "from-purple-500 to-violet-500",
    title: "FEMA / RBI & International Compliance",
    summary: "Cross-border transaction advisory and foreign investment reporting.",
    details: [
      "Advisory on FEMA compliances for NRIs, foreign investments, and cross-border transactions",
      "Filing of Form FC-GPR (foreign investment reporting) and FC-TRS (transfer of shares)",
      "Annual Return on Foreign Liabilities and Assets (FLA Return)",
      "Advisory on NRO / NRE account transactions, repatriation rules, and ODI compliances",
      "Loan & finance documentation — CMA data, project reports for bank loan applications",
    ],
  },
]

export default function FinancialServicesPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="fixed inset-0 z-0">
        <Antigravity color="#5227FF" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-40 pb-24">

        {/* Hero */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <BadgeCheck className="w-4 h-4" />
            Professional Financial Services
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Finance & Compliance{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
              Done Right
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
            End-to-end financial, taxation, and compliance services for individuals, startups, and businesses — delivered by experienced professionals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              Get a Free Consultation <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 hover:border-indigo-500/30 rounded-2xl p-7 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/5"
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${service.gradient} text-white shadow-lg flex-shrink-0`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{service.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{service.summary}</p>
                </div>
              </div>

              {/* Details */}
              <ul className="space-y-2 mt-4">
                {service.details.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${service.gradient} mt-1.5 flex-shrink-0`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center max-w-2xl mx-auto bg-gradient-to-br from-gray-900 via-indigo-950/20 to-gray-900 rounded-3xl border border-gray-800 p-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">
            Tell us about your requirements and we'll get back to you within 24 hours with a tailored plan.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

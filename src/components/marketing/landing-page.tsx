import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Database,
  Globe,
  LinkIcon,
  Lock,
  Scissors,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    title: "Bookings from calls, texts, and DMs",
    description:
      "Managing appointments across multiple channels leads to double bookings and missed opportunities.",
    icon: Calendar,
  },
  {
    title: "Customers forget appointments",
    description:
      "No reminders, no-shows, lost time, lost revenue, and an unhappy schedule.",
    icon: Clock,
  },
  {
    title: "Manual tracking of services and staff",
    description:
      "Spreadsheets and notes make it hard to manage services, pricing, and staff availability.",
    icon: Users,
  },
  {
    title: "No clear overview of your business",
    description:
      "Without insights, it is hard to know what is working and what needs to grow.",
    icon: BarChart3,
  },
];

const features = [
  {
    title: "Online booking page",
    description: "Share your booking link and let customers book anytime.",
    icon: Globe,
  },
  {
    title: "Appointment management",
    description: "View, manage, and update appointments with ease.",
    icon: Calendar,
  },
  {
    title: "Service management",
    description: "Add services, set durations, and manage pricing.",
    icon: Scissors,
  },
  {
    title: "Customer records",
    description: "Store customer details and booking history in one place.",
    icon: Database,
  },
  {
    title: "Staff support",
    description: "Add staff members and assign services and schedules.",
    icon: Users,
  },
  {
    title: "Plan usage tracking",
    description: "Monitor bookings used and manage your plan.",
    icon: BarChart3,
  },
];

const businessTypes = [
  "Barbers",
  "Nail Techs",
  "Cleaners",
  "Tutors",
  "Photographers",
  "Makeup Artists",
  "Massage Therapists",
  "Small Clinics",
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "Get started and explore Schedora.",
    bookings: "20 bookings / month",
    features: [
      "Online booking page",
      "Manage services",
      "1 staff member",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$19",
    description: "Everything you need to run your business.",
    bookings: "100 bookings / month",
    features: [
      "All Free features",
      "Multiple staff members",
      "Customer records",
      "Booking reminders",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$39",
    description: "For growing businesses with unlimited bookings.",
    bookings: "Unlimited bookings",
    features: [
      "All Starter features",
      "Priority support",
      "Advanced insights",
      "Custom booking link",
    ],
    highlighted: false,
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Problems />
      <Features />
      <HowItWorks />
      <BusinessTypes />
      <DashboardShowcase />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-black text-white">
            <Sparkles className="size-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">schedora</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          <a href="#features" className="hover:text-black">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-black">
            How it works
          </a>
          <a href="#pricing" className="hover:text-black">
            Pricing
          </a>
          <a href="#faq" className="hover:text-black">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/sign-in">Log in</Link>
          </Button>

          <Button asChild className="bg-black text-white hover:bg-neutral-800">
            <Link href="/sign-up">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-neutral-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Badge variant="outline" className="mb-6 rounded-full px-4 py-2">
            Appointment booking for service businesses Works
          </Badge>

          <h1 className="max-w-2xl text-5xl font-bold tracking-tight md:text-6xl">
            Run your bookings, customers, services, and staff from one simple
            dashboard.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
            Schedora is appointment booking software built for modern local
            service businesses. Save time, stay organized, and grow with
            confidence.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-neutral-800"
            >
              <Link href="/sign-up" className="inline-flex items-center gap-2">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2"
              >
                View demo
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-neutral-600">
            <Check className="size-4" />
            No credit card required. Set up in minutes.
          </div>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <Card className="overflow-hidden rounded-2xl border-neutral-200 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-black text-white">
                <Store className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Glow Barbershop</p>
                <p className="text-xs text-neutral-500">Business dashboard</p>
              </div>
            </div>

            <div className="hidden w-64 items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-neutral-500 md:flex">
              <Search className="size-4" />
              Search appointments...
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Today's appointments", "12"],
              ["Upcoming appointments", "28"],
              ["Total bookings", "68"],
              ["Total customers", "243"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <p className="text-sm text-neutral-500">{label}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Today&apos;s schedule</h3>
                <Calendar className="size-4" />
              </div>

              <div className="space-y-3">
                {[
                  ["9:00 AM", "Dwayne Carter", "Fade + Beard", "Confirmed"],
                  ["10:30 AM", "Marvin McKinney", "Haircut", "Confirmed"],
                  ["12:00 PM", "Cody Fisher", "Fade", "Pending"],
                  [
                    "1:30 PM",
                    "Brooklyn Simmons",
                    "Haircut + Beard",
                    "Completed",
                  ],
                ].map((row) => (
                  <div
                    key={row.join("-")}
                    className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-3 text-sm"
                  >
                    <span className="text-neutral-500">{row[0]}</span>
                    <span className="font-medium">{row[1]}</span>
                    <span className="text-neutral-600">{row[2]}</span>
                    <Badge variant="secondary">{row[3]}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <h3 className="font-semibold">Monthly booking usage</h3>
              <p className="mt-5 text-3xl font-bold">68 / 100</p>
              <div className="mt-4 h-3 rounded-full bg-neutral-200">
                <div className="h-3 w-[68%] rounded-full bg-black" />
              </div>
              <p className="mt-4 text-sm leading-6 text-neutral-600">
                You have 32 bookings remaining on the Starter plan.
              </p>
              <Button variant="outline" className="mt-5 w-full">
                Upgrade plan
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrustedBy() {
  return (
    <section className="border-b border-neutral-200 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-medium text-neutral-500">
          Trusted by service businesses around the world
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm font-semibold text-neutral-500 md:grid-cols-6">
          {[
            "GLOW",
            "The Nail Place",
            "CleanPro",
            "PureHealth",
            "TutorBright",
            "StyleHub",
          ].map((brand) => (
            <div
              key={brand}
              className="rounded-xl border border-neutral-200 py-4"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problems() {
  return (
    <section className="border-b border-neutral-200 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Problems"
          title="The challenges slowing your business down"
          description="Schedora removes the manual work that makes appointments hard to manage."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <Card
              key={problem.title}
              className="rounded-2xl border-neutral-200"
            >
              <CardContent className="p-6">
                <problem.icon className="size-6" />
                <h3 className="mt-5 font-semibold">{problem.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-b border-neutral-200 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to run and grow your business"
          description="A clean operating system for appointments, customers, services, staff, and bookings."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="rounded-2xl border-neutral-200"
            >
              <CardContent className="p-6">
                <feature.icon className="size-6" />
                <h3 className="mt-5 font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    [
      "1",
      "Create your account",
      "Sign up in seconds and set up your business profile.",
    ],
    ["2", "Add your services", "Add services, durations, prices, and staff."],
    [
      "3",
      "Set your availability",
      "Choose your working hours and manage your schedule.",
    ],
    [
      "4",
      "Share your booking link",
      "Share your public booking link and start getting bookings.",
    ],
  ];

  return (
    <section id="how-it-works" className="border-b border-neutral-200 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Process"
          title="Get started in 4 simple steps"
          description="Simple enough for small businesses, structured enough for serious growth."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-2xl border border-neutral-200 p-6 text-center"
            >
              <div className="mx-auto grid size-9 place-items-center rounded-full border border-neutral-300 font-semibold">
                {number}
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessTypes() {
  return (
    <section className="border-b border-neutral-200 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Use cases"
          title="Built for every service business"
          description="One booking system for many business types."
        />

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {businessTypes.map((type) => (
            <div
              key={type}
              className="rounded-2xl border border-neutral-200 p-5 text-center text-sm font-medium"
            >
              {type}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardShowcase() {
  return (
    <section className="border-b border-neutral-200 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <Badge variant="outline" className="mb-5">
            Dashboard
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight">
            Your business, at a glance every single day.
          </h2>
          <p className="mt-5 leading-7 text-neutral-600">
            From today&apos;s schedule to upcoming appointments and plan usage,
            Schedora gives you complete visibility so you can focus on what you
            do best.
          </p>

          <Button variant="outline" className="mt-8">
            Explore all features
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-b border-neutral-200 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start free and upgrade when your business grows."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <Card
              key={plan.name}
              className={`rounded-2xl border-neutral-200 ${
                plan.highlighted ? "border-black shadow-sm" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.highlighted ? <Badge>Most popular</Badge> : null}
                </div>

                <p className="mt-3 text-sm text-neutral-600">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-neutral-500"> /month</span>
                </div>

                <p className="mt-3 font-medium">{plan.bookings}</p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-neutral-700"
                    >
                      <Check className="size-4" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-8 w-full ${
                    plan.highlighted
                      ? "bg-black text-white hover:bg-neutral-800"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href="/sign-up">Start free</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="border-b border-neutral-200 py-16">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know before getting started."
        />

        <Accordion
          type="single"
          collapsible
          className="mt-10 rounded-2xl border border-neutral-200 px-6"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Is there a free trial?</AccordionTrigger>
            <AccordionContent>
              Yes. You can start free and test the main booking features before
              upgrading.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Can customers book 24/7?</AccordionTrigger>
            <AccordionContent>
              Yes. Customers can use your public booking link anytime, based on
              the availability you set.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              Can I manage multiple staff members?
            </AccordionTrigger>
            <AccordionContent>
              Yes. Staff support is included so businesses can assign services
              and schedules.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionContent>
              Schedora is designed with tenant isolation, protected routes, and
              server-side validation.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-3xl border border-neutral-200 p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-black text-white">
              <Calendar className="size-6" />
            </div>

            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                Ready to take control of your bookings?
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-neutral-600">
                Join thousands of service businesses using Schedora to save time
                and grow.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-black text-white hover:bg-neutral-800"
            >
              <Link href="/sign-up">Start free</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/dashboard">View demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-black text-white">
              <Sparkles className="size-4" />
            </div>
            <span className="text-xl font-bold">schedora</span>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-600">
            Simple booking. Smarter business.
          </p>
        </div>

        <FooterColumn
          title="Product"
          items={["Features", "How it works", "Pricing", "Updates"]}
        />
        <FooterColumn
          title="Company"
          items={["About us", "Contact", "Careers", "Privacy"]}
        />
        <FooterColumn
          title="Resources"
          items={["Help center", "Guides", "Status", "API"]}
        />
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-6 text-sm text-neutral-500">
        © 2026 Schedora. All rights reserved.
      </div>
    </footer>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge variant="outline" className="mb-4">
        {eyebrow}
      </Badge>
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-4 leading-7 text-neutral-600">{description}</p>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-neutral-600">
        {items.map((item) => (
          <li key={item}>
            <a
              href={
                item === "Features"
                  ? "#features"
                  : item === "How it works"
                    ? "#how-it-works"
                    : item === "Pricing"
                      ? "#pricing"
                      : "#"
              }
              className="hover:text-black"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

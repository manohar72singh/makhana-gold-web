import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { PageFAQ } from "@/components/storefront/PageFAQ";
import { getFaqCategories } from "@/lib/content";
import { generateWebPageSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Quality Certifications & Lab Reports | Makhana Gold",
  description:
    "View all FSSAI licenses, organic certifications, lab test reports, and quality compliance documents for Makhana Gold products. 100% certified, traceable, and compliant with Indian food safety standards.",
  keywords:
    "Makhana Gold FSSAI certificate, organic makhana certification, lab test report makhana, food safety India, fox nuts quality certification",
  alternates: {
    canonical: "/certifications",
  },
  openGraph: {
    title: "Certifications & Quality Documents | Makhana Gold",
    description:
      "Our full certification portfolio — FSSAI, organic India, lab reports, and quality compliance for every Makhana Gold product.",
    url: "https://makhanagold.com/certifications",
    siteName: "Makhana Gold",
    images: ["/images/vibrant/hero.jpg"],
    type: "website",
  },
};

export default async function CertificationsPage() {
  let certifications: {
    id: number;
    name: string;
    issuingBody: string;
    certificateNumber: string | null;
    validUntil: Date | null;
    documentUrl: string | null;
    badgeImage: string | null;
    description: string | null;
  }[] = [];

  try {
    certifications = await (prisma as any).certification.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // Table may not be migrated yet in development
  }

  const faqCategories = await getFaqCategories();
  const certFaqs = faqCategories.flatMap((cat) => cat.items.map((item) => ({ question: item.q, answer: item.a })));

  const pageSchema = generateWebPageSchema({
    name: "Quality Certifications & Lab Reports — Makhana Gold",
    description:
      "Official FSSAI, organic, and lab test certifications for all Makhana Gold products.",
    url: "/certifications",
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Certifications & Quality", url: "/certifications" },
  ]);

  const displayCerts = certifications;

  return (
    <main className="max-w-container-max mx-auto px-5 sm:px-gutter py-10 sm:py-16">
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-on-surface-variant font-label-sm text-xs mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" title="Makhana Gold Home" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
          </li>
          <li aria-current="page">
            <span className="text-primary font-semibold">Certifications & Quality</span>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="text-center max-w-3xl mx-auto mb-12">
        <span className="font-label-md text-xs uppercase tracking-widest text-amber-700 font-black block mb-3">
          Verified Quality & Compliance
        </span>
        <h1 className="font-headline-lg text-3xl sm:text-5xl font-black text-on-surface mb-4 tracking-tight">
          Our Certifications &amp; Lab Reports
        </h1>
        <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
          We believe in radical transparency. Every Makhana Gold product undergoes rigorous testing by NABL-accredited labs
          and complies with all applicable Indian and international food safety standards.
        </p>
      </header>

      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-[#2B1B04] to-amber-900 rounded-3xl p-6 sm:p-8 mb-12 text-white grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: "verified", label: "FSSAI Licensed", value: "Central License" },
          { icon: "science", label: "Lab Tested", value: "NABL Accredited" },
          { icon: "eco", label: "Natural Ingredients", value: "Zero Artificial" },
          { icon: "workspace_premium", label: "Quality Assured", value: "Every Batch" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <span
              className="material-symbols-outlined text-amber-300 text-[32px] block mb-1"
              title={item.label}
              aria-label={item.label}
            >
              {item.icon}
            </span>
            <p className="font-bold text-xs text-amber-200 mb-0.5">{item.value}</p>
            <p className="text-[10px] text-amber-400 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Certifications Grid */}
      <section aria-label="Quality certificates and documents">
        <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#D84315] text-[24px]">workspace_premium</span>
          Quality Certificates
        </h2>

        {displayCerts.length === 0 && (
          <div className="bg-[#FAF6EE] rounded-3xl border border-amber-900/10 p-8 text-center mb-12">
            <span className="material-symbols-outlined text-amber-400 text-[36px] block mb-2" aria-hidden="true">
              hourglass_top
            </span>
            <p className="text-sm text-on-surface-variant">
              Our certificates are being finalized for publication. Contact us via{" "}
              <Link href="/support" className="text-primary font-semibold underline">
                support
              </Link>{" "}
              for verified copies in the meantime.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-amber-900/10 shadow-warm-1 hover:shadow-warm-2 transition-all overflow-hidden flex flex-col"
            >
              {/* Certificate Badge */}
              <div className="bg-gradient-to-br from-[#FAF6EE] to-amber-50 p-6 flex items-center justify-center min-h-[140px] border-b border-amber-900/8">
                {cert.badgeImage ? (
                  <Image
                    src={cert.badgeImage}
                    alt={`${cert.name} — ${cert.issuingBody} certification badge`}
                    title={cert.name}
                    width={120}
                    height={100}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-amber-700 text-[36px]"
                      title={cert.name}
                      aria-label={`${cert.name} certification icon`}
                    >
                      verified
                    </span>
                  </div>
                )}
              </div>

              {/* Certificate Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1">{cert.name}</h3>
                  <p className="text-[11px] font-bold text-amber-700 mb-2">{cert.issuingBody}</p>

                  {cert.certificateNumber && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-[12px] text-on-surface-variant">tag</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {cert.certificateNumber}
                      </span>
                    </div>
                  )}

                  {cert.validUntil && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="material-symbols-outlined text-[12px] text-emerald-600">event_available</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        Valid until{" "}
                        <time dateTime={cert.validUntil.toISOString()}>
                          {new Date(cert.validUntil).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                        </time>
                      </span>
                    </div>
                  )}

                  {cert.description && (
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{cert.description}</p>
                  )}
                </div>

                {cert.documentUrl ? (
                  <a
                    href={cert.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Download ${cert.name} PDF`}
                    aria-label={`Download ${cert.name} certificate document`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#D84315] hover:bg-[#BF360C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Download Certificate
                  </a>
                ) : (
                  <div className="flex items-center gap-1.5 py-2.5 px-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="material-symbols-outlined text-[13px] text-amber-600">info</span>
                    <span className="text-[10px] text-amber-800 font-medium">Document available on request</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lab Testing Process */}
      <section aria-label="Our testing and quality process" className="bg-[#FAF6EE] rounded-3xl border border-amber-900/10 p-6 sm:p-10 mb-12">
        <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">
          Our Quality Testing Process
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
          Every batch of Makhana Gold products goes through a multi-stage quality verification process before reaching you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              icon: "water",
              title: "Source Verification",
              desc: "Wetland GPS mapping, farmer certification, and harvest season documentation.",
            },
            {
              step: "02",
              icon: "science",
              title: "Lab Testing",
              desc: "NABL-accredited lab analysis for heavy metals, pesticides, microbials & nutrition.",
            },
            {
              step: "03",
              icon: "verified_user",
              title: "FSSAI Inspection",
              desc: "Mandatory food safety compliance checks at licensed manufacturing unit.",
            },
            {
              step: "04",
              icon: "package_2",
              title: "Batch Release",
              desc: "Only approved batches are packed, sealed, and dispatched from our facility.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-black text-amber-500 bg-amber-100 px-2 py-0.5 rounded-md">
                  Step {item.step}
                </span>
              </div>
              <span
                className="material-symbols-outlined text-[#D84315] text-[28px] block mb-2"
                title={item.title}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <h4 className="font-bold text-sm text-on-surface mb-1">{item.title}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact for Docs */}
      <section
        aria-label="Request certification documents"
        className="bg-gradient-to-br from-amber-950 to-[#1C150C] rounded-3xl p-6 sm:p-10 text-white text-center mb-12"
      >
        <span className="material-symbols-outlined text-amber-400 text-[36px] block mb-3" aria-hidden="true">
          description
        </span>
        <h2 className="font-headline-md text-2xl font-bold text-white mb-2">
          Need Specific Documents?
        </h2>
        <p className="text-amber-200 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
          For B2B procurement, private label partnerships, or compliance purposes — contact us to receive
          certified copies of any document listed above.
        </p>
        <Link
          href="/support"
          title="Contact Makhana Gold support team for certification documents"
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md"
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>
          Request Documents
        </Link>
      </section>

      {/* FAQ Section */}
      <div className="border-t border-amber-900/10">
        <PageFAQ
          faqs={certFaqs}
          title="Certification FAQs"
          subtitle="Everything you need to know about our quality standards and compliance"
        />
      </div>
    </main>
  );
}

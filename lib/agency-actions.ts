"use server";

import { getPrisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

export async function getAgencySettings() {
  const prisma = getPrisma();
  let settings = await prisma.agencySettings.findUnique({
    where: { id: "default" }
  });

  if (!settings) {
    settings = await prisma.agencySettings.create({
      data: {
        id: "default",
        companyName: "CoreWebLabs",
        website: "https://www.coreweblabs.com",
        portfolioUrl: "https://www.coreweblabs.com/portfolio",
        senderName: "Hassan",
        senderEmail: "hassannaqvi@coreweblabs.com",
        proposalTheme: "Modern",
        brandColors: { primary: "#2563eb", secondary: "#1e293b" } as any,
        emailSignature: "<p>Best regards,<br><strong>Hassan</strong><br>Founder, CoreWebLabs</p>",
        youtube: "https://youtube.com/channel/UCqGzcfYv6AdaV0OsXVWIkew/",
        howWeCanHelp: [
          { id: "1", title: "White-Label WordPress Support", description: "Figma/Framer/PSD to pixel-perfect, custom Gutenberg, Elementor or Bricks theme builds.", icon: "Code", enabled: true },
          { id: "2", title: "Custom WooCommerce Integrations", description: "Build robust e-commerce solutions with complex cart actions, payments, subscriptions, and custom APIs.", icon: "ShoppingBag", enabled: true },
          { id: "3", title: "Page Speed Optimization", description: "Optimize database queries, asset loading, and server caching to hit green Core Web Vitals scores.", icon: "Zap", enabled: true },
          { id: "4", title: "Ongoing Site Maintenance", description: "Comprehensive backup workflows, security scans, custom troubleshooting, and version updates.", icon: "Shield", enabled: true }
        ] as any
      }
    });
  }

  if (settings && settings.senderEmail === "hassan@coreweblabs.com") {
    settings = await prisma.agencySettings.update({
      where: { id: "default" },
      data: { senderEmail: "hassannaqvi@coreweblabs.com" }
    });
  }

  if (settings && !settings.youtube) {
    settings = await prisma.agencySettings.update({
      where: { id: "default" },
      data: { youtube: "https://youtube.com/channel/UCqGzcfYv6AdaV0OsXVWIkew/" }
    });
  }

  if (settings && !settings.howWeCanHelp) {
    settings = await prisma.agencySettings.update({
      where: { id: "default" },
      data: {
        howWeCanHelp: [
          { id: "1", title: "White-Label WordPress Support", description: "Figma/Framer/PSD to pixel-perfect, custom Gutenberg, Elementor or Bricks theme builds.", icon: "Code", enabled: true },
          { id: "2", title: "Custom WooCommerce Integrations", description: "Build robust e-commerce solutions with complex cart actions, payments, subscriptions, and custom APIs.", icon: "ShoppingBag", enabled: true },
          { id: "3", title: "Page Speed Optimization", description: "Optimize database queries, asset loading, and server caching to hit green Core Web Vitals scores.", icon: "Zap", enabled: true },
          { id: "4", title: "Ongoing Site Maintenance", description: "Comprehensive backup workflows, security scans, custom troubleshooting, and version updates.", icon: "Shield", enabled: true }
        ] as any
      }
    });
  }

  return settings;
}

export async function updateAgencySettings(data: any) {
  try {
    const prisma = getPrisma();
    const settings = await prisma.agencySettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data }
    });
    revalidatePath("/agency/settings");
    revalidatePath("/agency/proposal");
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Seed default templates if database has none
export async function seedDefaultTemplates() {
  const prisma = getPrisma();
  const count = await prisma.agencyEmailTemplate.count();
  if (count > 0) return;

  const defaults = [
    {
      name: "Initial Outreach",
      category: "Outreach",
      subject: "Partnership Inquiry: White-Label Development Support for {{agency_name}}",
      bodyHtml: `<p>Hi {{contact_name}},</p>
<p>I hope you're having a great week.</p>
<p>I've been following {{agency_name}} and love the work you guys do. I noticed you offer services like {{services}}. As an agency, managing development overhead can be tough, especially when client demands fluctuate.</p>
<p>We work as a white-label development partner for digital agencies, helping them scale by handling all their design-to-WordPress, custom plugins, WooCommerce, and headless development, without the cost of in-house hires.</p>
<p>I put together a quick partnership proposal specifically for {{agency_name}} here: <a href="{{proposal_url}}">{{proposal_url}}</a></p>
<p>Could we discuss if this could be a fit for your active project queue?</p>
<p>Best regards,</p>`,
      description: "First touch email introducing white-label services.",
      status: "Active"
    },
    {
      name: "Follow-up One",
      category: "Follow-up",
      subject: "Quick follow-up: White-label development for {{agency_name}}",
      bodyHtml: `<p>Hi {{contact_name}},</p>
<p>I wanted to follow up on my previous email. I know things get incredibly busy at agency offices.</p>
<p>Did you get a chance to look over the proposal page I made for you? <a href="{{proposal_url}}">{{proposal_url}}</a></p>
<p>We specialize in fast, pixel-perfect WordPress development. Let me know if you have any projects in your pipeline that we could help with.</p>
<p>Best,</p>`,
      description: "First follow-up sent after 3-5 days.",
      status: "Active"
    },
    {
      name: "Follow-up Two",
      category: "Follow-up",
      subject: "Overloaded client pipeline at {{agency_name}}?",
      bodyHtml: `<p>Hi {{contact_name}},</p>
<p>Just checking in. Many agencies we partner with face bottle-necks where they have more client requests than developers to handle them. We act as that flexible, scalable resource.</p>
<p>If you're interested, you can view some of our recent work here: <a href="{{portfolio_url}}">{{portfolio_url}}</a></p>
<p>I'd love to chat briefly by email or WhatsApp to see if we can help you take on more projects without adding full-time payroll.</p>
<p>Regards,</p>`,
      description: "Second follow-up focusing on scalability.",
      status: "Active"
    },
    {
      name: "Follow-up Three",
      category: "Follow-up",
      subject: "One last try: WP Development Support for {{agency_name}}",
      bodyHtml: `<p>Hi {{contact_name}},</p>
<p>I won't keep crowding your inbox. I assume this isn't a priority for {{agency_name}} right now, which is totally fine!</p>
<p>If you ever find yourself needing reliable, fast white-label WordPress or frontend developers to scale your capacity on-demand, please keep us in mind.</p>
<p>Our details are on this page if you ever need them: <a href="{{proposal_url}}">{{proposal_url}}</a></p>
<p>Wishing you and {{agency_name}} all the best.</p>
<p>Best regards,</p>`,
      description: "Final break-up outreach email.",
      status: "Active"
    },
    {
      name: "Thank You",
      category: "Outreach",
      subject: "Thanks for connecting!",
      bodyHtml: `<p>Hi {{contact_name}},</p>
<p>Thanks for getting back to me. I'm really excited about the possibility of collaborating with {{agency_name}}.</p>
<p>I will stay in touch. Let me know if you have any upcoming website redesigns, custom builds, or maintenance tasks we can help you estimate.</p>
<p>Best,</p>`,
      description: "Thank you email after positive reply.",
      status: "Active"
    },
    {
      name: "Reconnection",
      category: "Outreach",
      subject: "Checking back: WordPress Dev Support for {{agency_name}}",
      bodyHtml: `<p>Hi {{contact_name}},</p>
<p>It's been a while since we last spoke. I wanted to check in and see how things are going at {{agency_name}}.</p>
<p>Do you have any active WordPress, Shopify, or frontend development needs that require extra support this quarter?</p>
<p>Best regards,</p>`,
      description: "Sent months later to re-engage.",
      status: "Active"
    }
  ];

  for (const item of defaults) {
    await prisma.agencyEmailTemplate.create({ data: item });
  }
}

export async function replaceVariables(text: string, agency: any, settings: any) {
  const proposalUrl = `${settings.website || 'https://www.coreweblabs.com'}/agency/proposal/${agency.slug}`;
  const vars: Record<string, string> = {
    agency_name: agency.name || "",
    contact_name: agency.contactName || "",
    website: agency.website || "",
    country: agency.country || "",
    city: agency.city || "",
    proposal_url: proposalUrl,
    portfolio_url: settings.portfolioUrl || "https://www.coreweblabs.com/portfolio",
    company_name: settings.companyName || "CoreWebLabs",
    sender_name: settings.senderName || "",
    sender_email: settings.senderEmail || "",
    team_email: settings.teamEmail || "",
    website_url: settings.website || "",
    whatsapp: settings.whatsapp || "",
    current_date: new Date().toLocaleDateString(),
    services: (agency.services || []).join(", ")
  };

  let result = text;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, val);
  }
  return result;
}

export async function createAgency(data: {
  name: string;
  website: string;
  contactName?: string;
  email?: string;
  linkedin?: string;
  country?: string;
  city?: string;
  services: string[];
  techStack: string[];
  notes?: string;
  status: string;
}) {
  try {
    const prisma = getPrisma();
    const slugify = (text: string) =>
      text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

    const companySlug = "coreweblabs-to-" + slugify(data.name);

    // Ensure uniqueness of slug
    let finalSlug = companySlug;
    let counter = 1;
    while (await prisma.agency.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${companySlug}-${counter}`;
      counter++;
    }

    const headline = `Reliable White-label Development Partner for ${data.name}`;
    const intro = `We help agencies like ${data.name} scale their development capacity, deliver pixel-perfect websites, and increase profit margins without hiring in-house.`;

    const agency = await prisma.agency.create({
      data: {
        ...data,
        slug: finalSlug,
        proposalHeadline: headline,
        proposalIntro: intro
      }
    });

    // Automatically create email draft after saving using the Initial Outreach template or settings default template
    const settings = await getAgencySettings();
    await seedDefaultTemplates();

    let template = null;
    if (settings.defaultTemplateId) {
      template = await prisma.agencyEmailTemplate.findUnique({
        where: { id: settings.defaultTemplateId }
      });
    }
    if (!template) {
      template = await prisma.agencyEmailTemplate.findFirst({
        where: { name: "Initial Outreach" }
      });
    }

    if (template) {
      const subject = await replaceVariables(template.subject, agency, settings);
      let bodyHtml = await replaceVariables(template.bodyHtml, agency, settings);
      
      // Append signature if it exists
      if (settings.emailSignature) {
        bodyHtml += `<br>${settings.emailSignature}`;
      }

      await prisma.agencyEmail.create({
        data: {
          agencyId: agency.id,
          templateId: template.id,
          subject,
          bodyHtml,
          status: "Draft"
        }
      });

      // Update status to Email Draft
      await prisma.agency.update({
        where: { id: agency.id },
        data: { status: "Email Draft" }
      });
    }

    // Automatically create a manual follow-up task due in 3 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    await prisma.agencyFollowup.create({
      data: {
        agencyId: agency.id,
        dueDate,
        status: "Pending",
        notes: "Send first follow-up outreach email."
      }
    });

    revalidatePath("/agency/dashboard");
    revalidatePath("/agency/agencies");
    return { success: true, agency };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAgencies(filters?: {
  search?: string;
  status?: string;
  country?: string;
  services?: string[];
  techStack?: string[];
}) {
  const prisma = getPrisma();
  const where: any = {};

  if (filters?.status && filters.status !== "All") {
    where.status = filters.status;
  }
  if (filters?.country && filters.country !== "All") {
    where.country = filters.country;
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { website: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { contactName: { contains: s, mode: "insensitive" } },
      { country: { contains: s, mode: "insensitive" } },
      { city: { contains: s, mode: "insensitive" } }
    ];
  }
  if (filters?.services && filters.services.length > 0) {
    where.services = { hasSome: filters.services };
  }
  if (filters?.techStack && filters.techStack.length > 0) {
    where.techStack = { hasSome: filters.techStack };
  }

  return prisma.agency.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      emails: true,
      followups: true
    }
  });
}

export async function getAgencyById(id: string) {
  const prisma = getPrisma();
  return prisma.agency.findUnique({
    where: { id },
    include: {
      emails: { orderBy: { createdAt: "desc" } },
      followups: { orderBy: { dueDate: "asc" } }
    }
  });
}

export async function updateAgency(id: string, data: any) {
  try {
    const prisma = getPrisma();
    const agency = await prisma.agency.update({
      where: { id },
      data
    });
    revalidatePath("/agency/dashboard");
    revalidatePath("/agency/agencies");
    revalidatePath(`/agency/agencies/${id}`);
    revalidatePath(`/agency/proposal/${agency.slug}`);
    return { success: true, agency };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAgency(id: string) {
  try {
    const prisma = getPrisma();
    await prisma.agency.delete({
      where: { id }
    });
    revalidatePath("/agency/dashboard");
    revalidatePath("/agency/agencies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// EMAIL TEMPLATES ACTIONS
export async function getAgencyEmailTemplates() {
  const prisma = getPrisma();
  await seedDefaultTemplates();
  return prisma.agencyEmailTemplate.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createAgencyEmailTemplate(data: {
  name: string;
  category?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  description?: string;
  status: string;
}) {
  try {
    const prisma = getPrisma();
    const template = await prisma.agencyEmailTemplate.create({
      data
    });
    revalidatePath("/agency/templates");
    return { success: true, template };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAgencyEmailTemplate(id: string, data: any) {
  try {
    const prisma = getPrisma();
    const template = await prisma.agencyEmailTemplate.update({
      where: { id },
      data
    });
    revalidatePath("/agency/templates");
    return { success: true, template };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAgencyEmailTemplate(id: string) {
  try {
    const prisma = getPrisma();
    await prisma.agencyEmailTemplate.delete({
      where: { id }
    });
    revalidatePath("/agency/templates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// EMAIL CAMPAIGNS & HISTORY
export async function getAgencyEmails(agencyId?: string) {
  const prisma = getPrisma();
  return prisma.agencyEmail.findMany({
    where: agencyId ? { agencyId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { agency: true }
  });
}

export async function saveAgencyEmailDraft(data: {
  agencyId: string;
  subject: string;
  bodyHtml: string;
  templateId?: string;
}) {
  try {
    const prisma = getPrisma();
    const draft = await prisma.agencyEmail.create({
      data: {
        ...data,
        status: "Draft"
      }
    });
    revalidatePath(`/agency/agencies/${data.agencyId}`);
    revalidatePath("/agency/emails");
    return { success: true, draft };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendAgencyEmail(id: string, customBody?: string, customSubject?: string) {
  try {
    const prisma = getPrisma();
    const emailObj = await prisma.agencyEmail.findUnique({
      where: { id },
      include: { agency: true }
    });

    if (!emailObj) throw new Error("Email log not found");
    if (!emailObj.agency.email) throw new Error("Agency email is missing");

    const settings = await getAgencySettings();
    const resendApiKey = process.env.RESEND_API_KEY || settings.senderName; // fallback if needed or custom

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Simulating email send (Development Mode).");
      
      await prisma.agencyEmail.update({
        where: { id },
        data: {
          subject: customSubject || emailObj.subject,
          bodyHtml: customBody || emailObj.bodyHtml,
          status: "Sent",
          sentAt: new Date()
        }
      });

      await prisma.agency.update({
        where: { id: emailObj.agencyId },
        data: { status: "Email Sent" }
      });

      revalidatePath(`/agency/agencies/${emailObj.agencyId}`);
      revalidatePath("/agency/emails");
      return { success: true, simulated: true };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = customSubject || emailObj.subject;
    const body = customBody || emailObj.bodyHtml;

    const { compileEmailHtml } = await import("./email-wrap");
    const compiledHtml = compileEmailHtml(body, settings, emailObj.agency);

    const fromAddress = settings.senderEmail || "hassannaqvi@coreweblabs.com";
    const fromName = settings.senderName || "Hassan";

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: emailObj.agency.email,
      subject: subject,
      html: compiledHtml
    });

    if (error) {
      throw new Error(error.message);
    }

    await prisma.agencyEmail.update({
      where: { id },
      data: {
        subject,
        bodyHtml: body,
        status: "Sent",
        sentAt: new Date()
      }
    });

    await prisma.agency.update({
      where: { id: emailObj.agencyId },
      data: { status: "Email Sent" }
    });

    revalidatePath(`/agency/agencies/${emailObj.agencyId}`);
    revalidatePath("/agency/emails");
    return { success: true };
  } catch (error: any) {
    const prisma = getPrisma();
    await prisma.agencyEmail.update({
      where: { id },
      data: {
        status: "Failed",
        errorMessage: error.message
      }
    });
    return { success: false, error: error.message };
  }
}

// FOLLOW UPS
export async function getAgencyFollowups() {
  const prisma = getPrisma();
  return prisma.agencyFollowup.findMany({
    orderBy: { dueDate: "asc" },
    include: { agency: true }
  });
}

export async function createAgencyFollowup(data: {
  agencyId: string;
  dueDate: Date;
  notes?: string;
}) {
  try {
    const prisma = getPrisma();
    const followup = await prisma.agencyFollowup.create({
      data: {
        agencyId: data.agencyId,
        dueDate: data.dueDate,
        notes: data.notes,
        status: "Pending"
      }
    });
    revalidatePath(`/agency/agencies/${data.agencyId}`);
    revalidatePath("/agency/followups");
    return { success: true, followup };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAgencyFollowup(id: string, data: any) {
  try {
    const prisma = getPrisma();
    const followup = await prisma.agencyFollowup.update({
      where: { id },
      data
    });
    revalidatePath(`/agency/agencies/${followup.agencyId}`);
    revalidatePath("/agency/followups");
    return { success: true, followup };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAgencyFollowup(id: string) {
  try {
    const prisma = getPrisma();
    const followup = await prisma.agencyFollowup.delete({
      where: { id }
    });
    revalidatePath(`/agency/agencies/${followup.agencyId}`);
    revalidatePath("/agency/followups");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ANALYTICS & DASHBOARD METRICS
export async function getAgencyDashboardMetrics() {
  const prisma = getPrisma();
  const agencies = await prisma.agency.findMany({
    include: { emails: true }
  });

  const totalAgencies = agencies.length;
  const emailsDrafted = agencies.reduce((acc, a) => acc + a.emails.filter(e => e.status === "Draft").length, 0);
  const emailsSent = agencies.reduce((acc, a) => acc + a.emails.filter(e => e.status === "Sent").length, 0);
  const replies = agencies.filter(a => a.status === "Replied").length;
  const interested = agencies.filter(a => a.status === "Interested").length;
  const proposalViews = agencies.reduce((acc, a) => acc + a.proposalViewCount, 0);
  const clientsWon = agencies.filter(a => a.status === "Client").length;

  const followupsDue = await prisma.agencyFollowup.count({
    where: {
      status: "Pending",
      dueDate: { lte: new Date() }
    }
  });

  const recentAgencies = await prisma.agency.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const recentEmails = await prisma.agencyEmail.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { agency: true }
  });

  const upcomingFollowups = await prisma.agencyFollowup.findMany({
    where: { status: "Pending" },
    orderBy: { dueDate: "asc" },
    take: 5,
    include: { agency: true }
  });

  return {
    totalAgencies,
    emailsDrafted,
    emailsSent,
    replies,
    interested,
    proposalViews,
    clientsWon,
    followupsDue,
    recentAgencies,
    recentEmails,
    upcomingFollowups
  };
}

export async function getAgencyProposalBySlug(slug: string) {
  const prisma = getPrisma();
  return prisma.agency.findUnique({
    where: { slug }
  });
}

export async function trackProposalView(slug: string) {
  try {
    const prisma = getPrisma();
    const agency = await prisma.agency.findUnique({ where: { slug } });
    if (!agency) return { success: false };

    // Avoid double counting view count too easily
    await prisma.agency.update({
      where: { slug },
      data: {
        proposalViewCount: { increment: 1 },
        proposalViewedAt: new Date(),
        status: agency.status === "Email Sent" || agency.status === "Opened" || agency.status === "New" ? "Proposal Viewed" : undefined
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

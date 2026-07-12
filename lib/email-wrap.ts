export function compileEmailHtml(bodyContent: string, settings: any, agency: any, includeProposal: boolean = true) {
  // Replace variables in the content first
  const proposalUrl = includeProposal ? `${settings.website || 'https://www.coreweblabs.com'}/agency/proposal/${agency.slug}` : "";
  const vars: Record<string, string> = {
    agency_name: agency.name || "Agency Partner",
    contact_name: agency.contactName || "Team",
    website: agency.website || "",
    country: agency.country || "",
    city: agency.city || "",
    proposal_url: proposalUrl,
    portfolio_url: settings.portfolioUrl || "https://www.coreweblabs.com/portfolio",
    company_name: settings.companyName || "CoreWebLabs",
    sender_name: settings.senderName || "Hassan",
    sender_email: settings.senderEmail || "hassannaqvi@coreweblabs.com"
  };

  let compiledBody = bodyContent;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    compiledBody = compiledBody.replace(regex, value);
  }

  // Generate social media icons HTML
  const socialLinks = [];
  if (settings.github) {
    socialLinks.push(`<a href="${settings.github}" style="margin: 0 8px; color: #64748b; text-decoration: none; font-size: 12px; font-weight: bold;">GitHub</a>`);
  }
  
  const socialSection = socialLinks.length > 0 
    ? `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center;">
        ${socialLinks.join(" &bull; ")}
       </div>`
    : "";

  const brandColor = settings.brandColors?.primary || "#4f46e5";

  // Build the complete email HTML wrapper template
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName || "Outreach Email"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header-bar {
      height: 4px;
      background-color: ${brandColor};
    }
    .header {
      padding: 30px;
      text-align: center;
      border-b: 1px solid #f1f5f9;
    }
    .logo {
      max-height: 40px;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 30px 40px;
      color: #334155;
      font-size: 15px;
      line-height: 1.6;
    }
    .content p {
      margin-bottom: 20px;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${brandColor};
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      color: #64748b;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: ${brandColor};
      text-decoration: none;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header-bar"></div>
      <div class="header">
        ${settings.companyLogo && settings.companyLogo !== "https://coreweblabs.com/logo.png"
          ? `<img src="${settings.companyLogo}" alt="${settings.companyName || "CoreWebLabs"}" style="max-height: 40px;" />`
          : `<table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:0 auto;">
              <tr>
                <td style="width:40px;height:40px;background-color:#2563eb;border-radius:12px;text-align:center;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:900;line-height:40px;">C</td>
                <td style="padding-left:12px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;vertical-align:middle;">CoreWeb<span style="color:#2563eb;">Labs</span></td>
              </tr>
            </table>`
        }
      </div>
      <div class="content">
        ${compiledBody}
        
        ${includeProposal && !(compiledBody.includes("proposal_url") || compiledBody.includes("/proposal/"))
          ? `<div class="cta-container">
              <a href="${proposalUrl}" class="btn" target="_blank">View Custom Partnership Proposal</a>
             </div>`
          : ""
        }

        <div class="signature">
          ${settings.emailSignature || `<p>Best regards,<br><strong>${settings.senderName || "Hassan"}</strong><br>${settings.companyName || "CoreWebLabs"}</p>`}
        </div>
      </div>
      <div class="footer">
        <p><strong>${settings.companyName || "CoreWebLabs"}</strong></p>
        ${settings.website ? `<p><a href="${settings.website}">${settings.website.replace(/^https?:\/\/(www\.)?/, "")}</a></p>` : ""}
        ${settings.teamEmail ? `<p>Questions? Contact us at <a href="mailto:${settings.teamEmail}">${settings.teamEmail}</a></p>` : ""}
        
        ${socialSection}

        <p style="margin-top: 20px; font-size: 11px; color: #94a3b8;">
          You received this email because you are in our outreach CRM list. If you wish to stop receiving these messages, please reply to unsubscribe.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

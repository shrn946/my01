import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_MENU = [
  { id: "home", label: "Home", href: "/", visible: true },
  { id: "about", label: "About", href: "/about", visible: true },
  { id: "services", label: "Services", "href": "/services", visible: true },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", visible: true },
  { id: "demo-websites", label: "Demo Websites", href: "/demo-websites", visible: true },
  { 
    id: "blog-dropdown",
    label: "Blog", 
    href: "/blog",
    visible: true,
    children: [
      { id: "articles", label: "Articles", href: "/blog", visible: true },
      { id: "videos", label: "Videos", href: "/videos", visible: true },
      { id: "addons", label: "Free Addons", href: "/free-addons", visible: true }
    ]
  },
  { id: "reviews", label: "Reviews", href: "/reviews", visible: true },
  { id: "contact", label: "Contact", href: "/contact", visible: true }
];

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const navItems = settings?.navItems || DEFAULT_MENU;
    return NextResponse.json(navItems);
  } catch (error) {
    return NextResponse.json(DEFAULT_MENU);
  }
}

export async function POST(request: Request) {
  try {
    const navItems = await request.json();
    await prisma.settings.upsert({
      where: { id: "default" },
      update: { navItems },
      create: { id: "default", navItems }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update menu" }, { status: 500 });
  }
}

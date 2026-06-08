import type { Metadata } from "next";
import Image from "next/image";
import { AdminTabs } from "@/components/admin-tabs";
import { BlogEditor } from "@/components/blog-editor";
import { LogoutButton } from "@/components/logout-button";
import { MediaImageField } from "@/components/media-image-field";
import { deleteBlogPost, deleteHeroSlide, deleteMedia, deleteProject, deleteReview, deleteUser, saveBlogPost, saveHeroSlide, saveInnerHeroSettings, saveProject, saveReview, saveUser, uploadMedia } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getBlogPosts, getContactMessages, getHeroSlides, getInnerHeroSettings, getMediaAssets, getProjects, getReviews, getUsers } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Trash2, ExternalLink, ChevronDown, LayoutDashboard, FileText, FolderKanban, Star, Users as UsersIcon, MessageSquare, Image as ImageIcon } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage portfolio projects, blog posts, reviews, and contact submissions."
};

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const [projects, posts, reviews, messages, users, media, slides, innerHeroSettings] = await Promise.all([
    getProjects(),
    getBlogPosts(),
    getReviews(),
    getContactMessages(),
    getUsers(),
    getMediaAssets(),
    getHeroSlides(false),
    getInnerHeroSettings()
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <section className="section !py-12 lg:!py-20">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <FadeIn>
            <span className="eyebrow">Control Center</span>
            <h1 className="mt-2 text-4xl font-black text-ink sm:text-5xl lg:text-6xl tracking-tight">Dashboard</h1>
            <p className="mt-4 text-slate-500 font-medium">Signed in as <span className="text-primary font-bold">{user.email}</span></p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <LogoutButton />
          </FadeIn>
        </div>

        <AdminTabs
          tabs={[
            {
              label: "Overview",
              children: (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Projects" value={projects.length} icon={FolderKanban} color="bg-blue-500" />
                  <Stat label="Blog Posts" value={posts.length} icon={FileText} color="bg-emerald-500" />
                  <Stat label="Reviews" value={reviews.length} icon={Star} color="bg-amber-500" />
                  <Stat label="Messages" value={messages.length} icon={MessageSquare} color="bg-purple-500" />
                  <Stat label="Users" value={users.length} icon={UsersIcon} color="bg-rose-500" />
                  <Stat label="Media" value={media.length} icon={ImageIcon} color="bg-sky-500" />
                  <Stat label="Slides" value={slides.length} icon={LayoutDashboard} color="bg-indigo-500" />
                </div>
              )
            },
            {
              label: "Settings",
              children: (
                <div className="max-w-4xl mx-auto">
                  <AdminBlock title="Inner Page Hero Settings">
                    <InnerHeroSettingsForm settings={innerHeroSettings} media={media} />
                  </AdminBlock>
                </div>
              )
            },
            {
              label: "Slider",
              children: (
                <div className="space-y-8">
                  <AdminBlock title="Add New Slide">
                    <SlideForm media={media} />
                  </AdminBlock>
                  <AdminBlock title="Existing Slides">
                    <div className="grid gap-6">
                      {slides.map((slide: any) => (
                        <EditableCard key={slide.id ?? slide.title} title={slide.title} deleteAction={deleteHeroSlide} id={slide.id}>
                          <SlideForm slide={slide} media={media} />
                        </EditableCard>
                      ))}
                      {!slides.length ? <Empty label="No slides found." /> : null}
                    </div>
                  </AdminBlock>
                </div>
              )
            },
            {
              label: "Media",
              children: (
                <AdminBlock title="Media Library">
                  <form action={uploadMedia} className="mb-10 grid gap-6 rounded-[2rem] bg-white p-8 shadow-premium md:grid-cols-[1fr_1fr_auto] md:items-end">
                    <label className="grid gap-3 text-sm font-bold text-ink">
                      Upload New Image
                      <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white" />
                    </label>
                    <BaseInput label="Alt Text" name="alt" placeholder="Descriptive text..." />
                    <button className="flex h-[50px] items-center justify-center rounded-2xl bg-primary px-8 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
                      Upload Asset
                    </button>
                  </form>
                  
                  {media.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {media.map((asset: any) => (
                        <article key={asset.id} className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-soft transition-all hover:shadow-premium">
                          <div className="relative aspect-square bg-slate-100 overflow-hidden">
                            <Image src={asset.url} alt={asset.alt ?? asset.fileName} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL</span>
                              <CopyButton text={asset.url} />
                            </div>
                            <p className="truncate rounded-xl bg-slate-50 p-3 font-mono text-[10px] text-slate-500">{asset.url}</p>
                            <form action={deleteMedia} className="mt-6">
                              <input type="hidden" name="id" value={asset.id} />
                              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-xs font-black text-rose-600 transition-colors hover:bg-rose-600 hover:text-white">
                                <Trash2 size={14} /> Delete
                              </button>
                            </form>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <Empty label="No media uploaded yet." />
                  )}
                </AdminBlock>
              )
            },
            {
              label: "Users",
              children: (
                <div className="space-y-12">
                  <AdminBlock title="Create User Account">
                    <UserForm />
                  </AdminBlock>
                  <AdminBlock title="System Users">
                    <div className="grid gap-6">
                      {users.map((item: any) => (
                        <EditableCard key={item.id} title={`${item.email} (${item.role})`} deleteAction={deleteUser} id={item.id}>
                          <UserForm user={item} />
                        </EditableCard>
                      ))}
                      {!users.length ? <Empty label="No users found." /> : null}
                    </div>
                  </AdminBlock>
                </div>
              )
            },
            {
              label: "Projects",
              children: (
                <div className="space-y-12">
                  <AdminBlock title="Add New Case Study">
                    <ProjectForm media={media} />
                  </AdminBlock>
                  <AdminBlock title="Manage Projects">
                    <div className="grid gap-6">
                      {projects.map((project: any) => (
                        <EditableCard key={project.id ?? project.slug} title={project.title} deleteAction={deleteProject} id={project.id}>
                          <ProjectForm project={project} media={media} />
                        </EditableCard>
                      ))}
                      {!projects.length ? <Empty label="No projects found." /> : null}
                    </div>
                  </AdminBlock>
                </div>
              )
            },
            {
              label: "Blog",
              children: (
                <div className="space-y-12">
                  <AdminBlock title="Write New Article">
                    <BlogPostForm media={media} />
                  </AdminBlock>
                  <AdminBlock title="Manage Articles">
                    <div className="grid gap-6">
                      {posts.map((post: any) => (
                        <EditableCard key={post.id ?? post.slug} title={post.title} deleteAction={deleteBlogPost} id={post.id}>
                          <BlogPostForm post={post} media={media} />
                        </EditableCard>
                      ))}
                      {!posts.length ? <Empty label="No blog posts found." /> : null}
                    </div>
                  </AdminBlock>
                </div>
              )
            },
            {
              label: "Reviews",
              children: (
                <div className="space-y-12">
                  <AdminBlock title="Add Client Feedback">
                    <ReviewForm media={media} />
                  </AdminBlock>
                  <AdminBlock title="Manage Testimonials">
                    <div className="grid gap-6">
                      {reviews.map((review: any) => (
                        <EditableCard key={review.id ?? `${review.client}-${review.company}`} title={`${review.client} - ${review.platform}`} deleteAction={deleteReview} id={review.id}>
                          <ReviewForm review={review} media={media} />
                        </EditableCard>
                      ))}
                      {!reviews.length ? <Empty label="No reviews found." /> : null}
                    </div>
                  </AdminBlock>
                </div>
              )
            },
            {
              label: "Messages",
              children: (
                <AdminBlock title="Project Inquiries">
                  <div className="overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-premium">
                    {messages.length ? messages.map((message: any) => (
                      <div key={message.id} className="border-b border-slate-50 p-8 last:border-b-0 transition-colors hover:bg-slate-50">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-black text-ink">{message.name}</h3>
                            <p className="mt-1 text-sm font-bold text-primary">{message.projectType}</p>
                          </div>
                          <div className="text-right">
                            <time className="text-xs font-black uppercase tracking-widest text-slate-400">{formatDate(message.createdAt)}</time>
                            <p className="mt-1 text-sm font-black text-ink">{message.budget}</p>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">{message.email}</span>
                          {message.phone && <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">{message.phone}</span>}
                        </div>
                        <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm leading-relaxed text-slate-600 border border-black/5">
                          {message.message}
                        </div>
                      </div>
                    )) : <Empty label="No contact submissions yet." />}
                  </div>
                </AdminBlock>
              )
            }
          ]}
        />
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-black/5 bg-white p-8 shadow-soft transition-all hover:shadow-premium">
      <div className={cn("absolute right-0 top-0 h-2 w-full", color)} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-black text-ink tracking-tight">{value}</p>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg", color)}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function AdminBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-8 flex items-center gap-4">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        <div className="h-px flex-1 bg-black/5" />
      </div>
      {children}
    </section>
  );
}

function EditableCard({ title, id, deleteAction, children }: { title: string; id?: string; deleteAction: (formData: FormData) => Promise<void>; children: React.ReactNode }) {
  return (
    <details className="group rounded-[2rem] border border-black/5 bg-white p-2 shadow-soft transition-all open:shadow-premium">
      <summary className="flex cursor-pointer list-none items-center justify-between p-6 outline-none">
        <span className="text-lg font-black text-ink group-open:text-primary transition-colors">{title}</span>
        <ChevronDown size={20} className="text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="p-6 pt-0">
        <div className="rounded-2xl border border-black/5 bg-slate-50/50 p-6">
          {children}
        </div>
        {id ? (
          <form action={deleteAction} className="mt-6 flex justify-end">
            <input type="hidden" name="id" value={id} />
            <button className="flex items-center gap-2 rounded-xl bg-rose-50 px-6 py-3 text-sm font-black text-rose-600 transition-all hover:bg-rose-600 hover:text-white">
              <Trash2 size={16} /> Delete Record
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-xs font-bold text-amber-800 border border-amber-100 flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200">!</div>
            Seed fallback item. Use Prisma to manage this record.
          </div>
        )}
      </div>
    </details>
  );
}

function BaseInput({ label, name, defaultValue = "", placeholder = "", required = false }: { label: string; name: string; defaultValue?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-3 text-sm font-bold text-ink">
      {label}
      <input 
        name={name} 
        defaultValue={defaultValue} 
        placeholder={placeholder}
        required={required} 
        className="w-full rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5" 
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue = "", required = false }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="grid gap-3 text-sm font-bold text-ink">
      {label}
      <textarea 
        name={name} 
        defaultValue={defaultValue} 
        required={required} 
        rows={4} 
        className="w-full rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5" 
      />
    </label>
  );
}

function InnerHeroSettingsForm({ settings, media }: { settings: any; media: any[] }) {
  return (
    <form action={saveInnerHeroSettings} className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <MediaImageField label="Fallback Background Image" name="fallbackImage" defaultValue={settings?.fallbackImage ?? ""} media={media} required />
      <div className="grid gap-6 md:grid-cols-3">
        <BaseInput label="Overlay Color" name="overlayColor" defaultValue={settings?.overlayColor ?? "#07111f"} required />
        <BaseInput label="Overlay Opacity (0-100)" name="overlayOpacity" defaultValue={String(settings?.overlayOpacity ?? 65)} required />
        <BaseInput label="Hero Height (px)" name="heroHeight" defaultValue={String(settings?.heroHeight ?? 360)} required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Title Color" name="titleColor" defaultValue={settings?.titleColor ?? "#ffffff"} required />
        <BaseInput label="Breadcrumb Color" name="breadcrumbColor" defaultValue={settings?.breadcrumbColor ?? "#dbeafe"} required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-3 text-sm font-bold text-ink">
          Background Position
          <select name="backgroundPosition" defaultValue={settings?.backgroundPosition ?? "center center"} className="w-full appearance-none rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5">
            <option value="center center">Center Center</option>
            <option value="center top">Center Top</option>
            <option value="center bottom">Center Bottom</option>
            <option value="left center">Left Center</option>
            <option value="right center">Right Center</option>
          </select>
        </label>
        <label className="grid gap-3 text-sm font-bold text-ink">
          Background Attachment
          <select name="backgroundAttachment" defaultValue={settings?.backgroundAttachment ?? "scroll"} className="w-full appearance-none rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5">
            <option value="scroll">Scroll</option>
            <option value="fixed">Fixed</option>
          </select>
        </label>
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
        Save Settings
      </button>
    </form>
  );
}

function SlideForm({ slide, media }: { slide?: any; media: any[] }) {
  return (
    <form action={saveHeroSlide} className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <input type="hidden" name="id" value={slide?.id ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Title" name="title" defaultValue={slide?.title ?? ""} required />
        <BaseInput label="Sort Order" name="sortOrder" defaultValue={String(slide?.sortOrder ?? 0)} />
      </div>
      <TextArea label="Subtitle" name="subtitle" defaultValue={slide?.subtitle ?? ""} required />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Button Text" name="buttonText" defaultValue={slide?.buttonText ?? "Hire Me"} required />
        <BaseInput label="Button Link" name="buttonLink" defaultValue={slide?.buttonLink ?? "/contact"} required />
      </div>
      <MediaImageField label="Background Image" name="image" defaultValue={slide?.image ?? ""} media={media} required />
      <label className="flex items-center gap-3 text-sm font-bold text-ink">
        <input type="checkbox" name="active" defaultChecked={slide?.active ?? true} className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary" /> 
        Active slide on homepage
      </label>
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
        Save Hero Slide
      </button>
    </form>
  );
}

function ProjectForm({ project, media }: { project?: any; media: any[] }) {
  return (
    <form action={saveProject} className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Title" name="title" defaultValue={project?.title} required />
        <BaseInput label="Slug" name="slug" defaultValue={project?.slug} />
      </div>
      <BaseInput label="Category" name="category" defaultValue={project?.category ?? "WordPress"} required />
      <MediaImageField label="Featured Image URL" name="image" defaultValue={project?.image ?? ""} media={media} required />
      <TextArea label="Short Description" name="description" defaultValue={project?.description} required />
      <TextArea label="Overview" name="overview" defaultValue={project?.overview} required />
      <TextArea label="Client Problem" name="problem" defaultValue={project?.problem} required />
      <TextArea label="My Solution" name="solution" defaultValue={project?.solution} required />
      <TextArea label="Result" name="result" defaultValue={project?.result} required />
      <BaseInput label="Tools Used (comma separated)" name="tools" defaultValue={project?.tools?.join(", ")} required />
      <BaseInput label="Gallery URLs (comma separated)" name="gallery" defaultValue={project?.gallery?.join(", ")} />
      <BaseInput label="Live Website URL" name="liveUrl" defaultValue={project?.liveUrl ?? ""} />
      <label className="flex items-center gap-3 text-sm font-bold text-ink">
        <input type="checkbox" name="featured" defaultChecked={project?.featured} className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary" /> 
        Featured on homepage
      </label>
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
        Save Project
      </button>
    </form>
  );
}

function BlogPostForm({ post, media }: { post?: any; media: any[] }) {
  return (
    <form action={saveBlogPost} className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Title" name="title" defaultValue={post?.title} required />
        <BaseInput label="Slug" name="slug" defaultValue={post?.slug} />
      </div>
      <BaseInput label="Category" name="category" defaultValue={post?.category ?? "WordPress"} required />
      <BaseInput label="Author" name="author" defaultValue={post?.author ?? "Hassan"} required />
      <MediaImageField label="Featured Image URL" name="image" defaultValue={post?.image ?? ""} media={media} required />
      <TextArea label="Excerpt" name="excerpt" defaultValue={post?.excerpt} required />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="SEO Meta Title" name="metaTitle" defaultValue={post?.metaTitle ?? ""} />
        <BaseInput label="SEO Meta Description" name="metaDescription" defaultValue={post?.metaDescription ?? ""} />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-ink">Post Content</p>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
          <BlogEditor defaultValue={post?.content ?? ""} />
        </div>
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-ink">
        <input type="checkbox" name="featured" defaultChecked={post?.featured} className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary" /> 
        Featured on homepage
      </label>
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
        Save Post
      </button>
    </form>
  );
}

function ReviewForm({ review, media }: { review?: any; media: any[] }) {
  return (
    <form action={saveReview} className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <input type="hidden" name="id" value={review?.id ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Client Name" name="client" defaultValue={review?.client} required />
        <BaseInput label="Project / Service Name" name="service" defaultValue={review?.service ?? ""} />
        <BaseInput label="Company" name="company" defaultValue={review?.company} required />
        <BaseInput label="Country" name="country" defaultValue={review?.country} required />
        <BaseInput label="Rating (1-5)" name="rating" defaultValue={String(review?.rating ?? 5)} required />
        <BaseInput label="Platform" name="platform" defaultValue={review?.platform} required />
        <BaseInput label="Sort Order" name="sortOrder" defaultValue={String(review?.sortOrder ?? 0)} />
      </div>
      <MediaImageField label="Client Image / Avatar" name="image" defaultValue={review?.image ?? ""} media={media} />
      <TextArea label="Review Text" name="text" defaultValue={review?.text} required />
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm font-bold text-ink">
          <input type="checkbox" name="active" defaultChecked={review?.active ?? true} className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary" /> 
          Published
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-ink">
          <input type="checkbox" name="featured" defaultChecked={review?.featured} className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary" /> 
          Featured on homepage
        </label>
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
        Save Review
      </button>
    </form>
  );
}

function UserForm({ user }: { user?: any }) {
  return (
    <form action={saveUser} className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <input type="hidden" name="id" value={user?.id ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <BaseInput label="Display Name" name="name" defaultValue={user?.name ?? ""} />
        <BaseInput label="Email Address" name="email" defaultValue={user?.email ?? ""} required />
      </div>
      <label className="grid gap-3 text-sm font-bold text-ink">
        System Role
        <select name="role" defaultValue={user?.role ?? "CLIENT"} className="w-full appearance-none rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5">
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>
      <BaseInput label={user ? "New Password (leave blank to keep current)" : "Password"} name="password" type="password" />
      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600">
        Save User Account
      </button>
    </form>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-20 text-center">
      <p className="text-sm font-bold text-slate-400">{label}</p>
    </div>
  );
}

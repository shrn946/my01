const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const item = {
    title: 'Manor Dental Centre',
    slug: 'manor-dental-centre',
    categoryName: 'Healthcare and Wellness',
    description: 'A modern, patient-focused website for Manor Dental Centre, providing comprehensive dental care services.',
    overview: 'The clinic needed an engaging and reassuring online presence to attract new patients and facilitate easy appointment bookings.',
    problem: 'Their previous site was outdated and lacked modern usability standards.',
    solution: 'Designed a clean, modern interface with a focus on trust and patient testimonials.',
    result: 'Improved patient engagement and booking rates.',
    tools: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598256989800-fea5ce5146f2?auto=format&fit=crop&w=800&q=80'
    ],
    liveUrl: 'https://www.manordentalcentre.co.uk/',
    featured: true
  };

  const cat = await prisma.category.findUnique({ where: { slug: 'healthcare-and-wellness' } });
  if (!cat) {
    console.log("Category not found");
    return;
  }

  await prisma.project.upsert({
    where: { slug: item.slug },
    update: {
      title: item.title,
      category: { connect: { id: cat.id } },
      description: item.description,
      overview: item.overview,
      problem: item.problem,
      solution: item.solution,
      result: item.result,
      tools: item.tools,
      image: item.image,
      gallery: item.gallery,
      liveUrl: item.liveUrl,
      featured: item.featured
    },
    create: {
      title: item.title,
      slug: item.slug,
      category: { connect: { id: cat.id } },
      description: item.description,
      overview: item.overview,
      problem: item.problem,
      solution: item.solution,
      result: item.result,
      tools: item.tools,
      image: item.image,
      gallery: item.gallery,
      liveUrl: item.liveUrl,
      featured: item.featured
    }
  });
  console.log("Inserted!");
}

main().finally(() => prisma.$disconnect());

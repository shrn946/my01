const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newReviews = [
  {
    client: "Freelancer Client",
    company: "",
    country: "Global",
    rating: 5,
    text: "GREAT WORK! WORKED FAST I will order from here again !",
    platform: "Freelancer",
    image: null,
    service: "WordPress Development",
    sortOrder: 1,
    active: true,
    featured: true
  },
  {
    client: "Freelancer Client",
    company: "",
    country: "Global",
    rating: 5,
    text: "Excellent results",
    platform: "Freelancer",
    image: null,
    service: "WordPress Development",
    sortOrder: 2,
    active: true,
    featured: true
  },
  {
    client: "Freelancer Client",
    company: "",
    country: "Global",
    rating: 5,
    text: "This project was a pretty simple project for a Wordpress pro, but it was done in under 2 hours and for a great price. I will definitely be hiring from here again.",
    platform: "Freelancer",
    image: null,
    service: "WordPress Development",
    sortOrder: 3,
    active: true,
    featured: true
  },
  {
    client: "Freelancer Client",
    company: "",
    country: "Global",
    rating: 5,
    text: "My freelancer has delivered satisfactory work immediately upon acceptance of the project and stayed with the project till it was done.",
    platform: "Freelancer",
    image: null,
    service: "WordPress Development",
    sortOrder: 4,
    active: true,
    featured: true
  },
  {
    client: "Freelancer Client",
    company: "",
    country: "Global",
    rating: 5,
    text: "Fantastic Work and very quick - did exactly what he said he would do for us!",
    platform: "Freelancer",
    image: null,
    service: "WordPress Development",
    sortOrder: 5,
    active: true,
    featured: true
  },
  {
    client: "Freelancer Client",
    company: "",
    country: "Global",
    rating: 5,
    text: "Verry fast and honest man! And verry knowledgeable",
    platform: "Freelancer",
    image: null,
    service: "WordPress Development",
    sortOrder: 6,
    active: true,
    featured: true
  }
];

async function main() {
  await prisma.review.updateMany({
    data: { featured: false }
  });

  for (const r of newReviews) {
    await prisma.review.create({ data: r });
  }

  console.log("Updated featured reviews!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

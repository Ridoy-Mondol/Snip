// import cron from "node-cron";
// import { prisma } from "@/prisma/client";

// async function publishScheduledBlogs() {
//   const currentTime = new Date();

//   console.log("Cron job started at:", currentTime)
  
//   const currentMinuteTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes(), 0, 0);

//   console.log("Cron job running at:", currentTime);

//   try {
//     const blogsToPublish = await prisma.blog.findMany({
//       where: {
//         scheduledAt: {
//           gte: currentMinuteTime, 
//           lt: new Date(currentMinuteTime.getTime() + 60000) 
//         },
//         status: "draft", 
//       },
//     });

//     if (blogsToPublish.length === 0) return; 

//     await prisma.blog.updateMany({
//       where: {
//         id: {
//           in: blogsToPublish.map((blog) => blog.id),
//         },
//       },
//       data: {
//         status: "published",
//         scheduledAt: null,
//         createdAt: new Date(),
//       },
//     });

//     console.log(`${blogsToPublish.length} blogs have been published.`);
//   } catch (error) {
//     console.error("Error publishing scheduled blogs:", error);
//   }
// }

// cron.schedule("* * * * *", publishScheduledBlogs);

// setInterval(() => {}, 1000);

// export default publishScheduledBlogs;




// import { prisma } from "@/prisma/client";

// Prevent Prisma from running in the browser
// if (typeof window !== "undefined") {
//   throw new Error("PrismaClient is unable to be run in the browser.");
// }

// Use dynamic import to fix ESM/CJS issues
const cronPromise = import("node-cron");

// const prisma = new PrismaClient();

async function publishScheduledBlogs() {
  const currentTime = new Date();
  console.log("✅ Cron job started at:", currentTime);

  const currentMinuteTime = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
    currentTime.getHours(),
    currentTime.getMinutes(),
    0,
    0
  );

  console.log("🔄 Cron job running at:", currentTime);

  // try {
  //   const blogsToPublish = await prisma.blog.findMany({
  //     where: {
  //       scheduledAt: {
  //         gte: currentMinuteTime,
  //         lt: new Date(currentMinuteTime.getTime() + 60000),
  //       },
  //       status: "draft",
  //     },
  //   });

  //   if (blogsToPublish.length === 0) return;

  //   await prisma.blog.updateMany({
  //     where: {
  //       id: {
  //         in: blogsToPublish.map((blog) => blog.id),
  //       },
  //     },
  //     data: {
  //       status: "published",
  //       scheduledAt: null,
  //       createdAt: new Date(),
  //     },
  //   });

  //   console.log(`✅ ${blogsToPublish.length} blogs have been published.`);
  // } catch (error) {
  //   console.error("❌ Error publishing scheduled blogs:", error);
  // }
}

// Function to start cron job only on the server
async function startCronJob() {
  if (typeof window !== "undefined") return; // Prevent execution in browser

  const cron = await cronPromise; // Wait for dynamic import
  cron.default.schedule("* * * * *", publishScheduledBlogs);
  console.log("✅ Cron job scheduler started.");
}

// Ensure this runs only on the server
// if (typeof window === "undefined") {
  startCronJob();
// }

export default publishScheduledBlogs;

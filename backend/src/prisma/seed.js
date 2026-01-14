import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.post.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create admin user
  const adminPasswordHash = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@uiu.edu',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      role: 'admin',
      studentId: 'ADM001',
      avatarUrl: 'https://via.placeholder.com/150?text=Admin',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create creators
  const creators = [];
  for (let i = 1; i <= 5; i++) {
    const passwordHash = await hashPassword(`creator${i}123`);
    const creator = await prisma.user.create({
      data: {
        email: `creator${i}@uiu.edu`,
        passwordHash,
        name: `Creator ${i}`,
        role: 'creator',
        studentId: `STU${String(i).padStart(3, '0')}`,
        avatarUrl: `https://via.placeholder.com/150?text=Creator${i}`,
      },
    });
    creators.push(creator);
  }
  console.log('✅ Created 5 creator users');

  // Create viewers
  const viewers = [];
  for (let i = 1; i <= 5; i++) {
    const passwordHash = await hashPassword(`viewer${i}123`);
    const viewer = await prisma.user.create({
      data: {
        email: `viewer${i}@uiu.edu`,
        passwordHash,
        name: `Viewer ${i}`,
        role: 'viewer',
        studentId: `STU${String(i + 100).padStart(3, '0')}`,
        avatarUrl: `https://via.placeholder.com/150?text=Viewer${i}`,
      },
    });
    viewers.push(viewer);
  }
  console.log('✅ Created 5 viewer users');

  // Create sample posts
  const posts = [];
  
  // Video posts
  for (let i = 1; i <= 3; i++) {
    const creator = creators[i % creators.length];
    const post = await prisma.post.create({
      data: {
        authorId: creator.id,
        type: 'video',
        title: `Amazing Video Tutorial ${i}`,
        description: `This is an awesome video tutorial about web development. Learn advanced concepts in ${i * 10} minutes.`,
        mediaUrl: `https://video.example.com/video${i}.mp4`,
        thumbnailUrl: `https://via.placeholder.com/320x180?text=Video+${i}`,
        duration: i * 10,
        status: 'approved',
      },
    });
    posts.push(post);
  }

  // Audio posts
  for (let i = 1; i <= 3; i++) {
    const creator = creators[(i + 1) % creators.length];
    const post = await prisma.post.create({
      data: {
        authorId: creator.id,
        type: 'audio',
        title: `Inspiring Podcast Episode ${i}`,
        description: `Join us in this inspiring podcast discussion about innovation, technology, and entrepreneurship.`,
        mediaUrl: `https://audio.example.com/podcast${i}.mp3`,
        duration: i * 30,
        status: 'approved',
      },
    });
    posts.push(post);
  }

  // Blog posts
  for (let i = 1; i <= 3; i++) {
    const creator = creators[(i + 2) % creators.length];
    const post = await prisma.post.create({
      data: {
        authorId: creator.id,
        type: 'blog',
        title: `Comprehensive Guide to ${['React', 'Node.js', 'TypeScript'][i - 1]}`,
        description: `A detailed blog post covering all aspects of ${['React', 'Node.js', 'TypeScript'][i - 1]} development. Perfect for beginners and intermediate developers.`,
        mediaUrl: 'https://blog.example.com',
        status: 'approved',
      },
    });
    posts.push(post);
  }

  console.log('✅ Created 9 approved posts');

  // Create pending posts
  for (let i = 1; i <= 2; i++) {
    const creator = creators[i % creators.length];
    await prisma.post.create({
      data: {
        authorId: creator.id,
        type: i === 1 ? 'video' : 'blog',
        title: `Pending ${i === 1 ? 'Video' : 'Blog'} Post ${i}`,
        description: 'This post is awaiting admin approval',
        mediaUrl: `https://example.com/pending${i}`,
        status: 'pending',
      },
    });
  }
  console.log('✅ Created 2 pending posts');

  // Create interactions (views, likes, ratings)
  for (const post of posts) {
    // Add views
    for (let i = 0; i < Math.floor(Math.random() * 50) + 10; i++) {
      const viewer = viewers[i % viewers.length];
      await prisma.interaction.upsert({
        where: {
          userId_postId_type: {
            userId: viewer.id,
            postId: post.id,
            type: 'view',
          },
        },
        update: {},
        create: {
          userId: viewer.id,
          postId: post.id,
          type: 'view',
        },
      });
    }

    // Add ratings
    for (let i = 0; i < Math.floor(Math.random() * 10) + 2; i++) {
      const viewer = viewers[i % viewers.length];
      const rating = Math.floor(Math.random() * 5) + 1;
      await prisma.interaction.upsert({
        where: {
          userId_postId_type: {
            userId: viewer.id,
            postId: post.id,
            type: 'rating',
          },
        },
        update: { value: rating },
        create: {
          userId: viewer.id,
          postId: post.id,
          type: 'rating',
          value: rating,
        },
      });
    }

    // Add likes
    for (let i = 0; i < Math.floor(Math.random() * 15) + 2; i++) {
      const viewer = viewers[i % viewers.length];
      await prisma.interaction.upsert({
        where: {
          userId_postId_type: {
            userId: viewer.id,
            postId: post.id,
            type: 'like',
          },
        },
        update: {},
        create: {
          userId: viewer.id,
          postId: post.id,
          type: 'like',
        },
      });
    }
  }
  console.log('✅ Created interactions (views, likes, ratings)');

  // Update post stats based on interactions
  for (const post of posts) {
    const viewCount = await prisma.interaction.count({
      where: {
        postId: post.id,
        type: 'view',
      },
    });

    const ratings = await prisma.interaction.findMany({
      where: {
        postId: post.id,
        type: 'rating',
      },
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + (r.value || 0), 0) / ratings.length
        : 0;

    await prisma.post.update({
      where: { id: post.id },
      data: {
        views: viewCount,
        rating: averageRating,
      },
    });
  }
  console.log('✅ Updated post statistics');

  // Create sample comments
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const viewer = viewers[i % viewers.length];
    
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: viewer.id,
        content: `Great ${post.type}! Very informative and well-presented. Looking forward to more content like this.`,
      },
    });
  }
  console.log('✅ Created sample comments');

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📋 Test Credentials:');
  console.log('   Admin: admin@uiu.edu / admin123');
  console.log('   Creator: creator1@uiu.edu / creator1123');
  console.log('   Viewer: viewer1@uiu.edu / viewer1123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

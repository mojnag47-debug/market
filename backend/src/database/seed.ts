import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create roles first
    console.log('Creating system roles...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'System Administrator with full access',
        permissions: JSON.stringify([
          'user.create', 'user.read', 'user.update', 'user.delete',
          'product.create', 'product.read', 'product.update', 'product.delete',
          'order.create', 'order.read', 'order.update', 'order.delete',
          'payment.read', 'payment.update',
          'system.settings', 'system.audit'
        ])
      }
    });

    const sellerRole = await prisma.role.upsert({
      where: { name: 'SELLER' },
      update: {},
      create: {
        name: 'SELLER',
        description: 'Seller with product and order management access',
        permissions: JSON.stringify([
          'product.create', 'product.read', 'product.update',
          'order.read', 'order.update'
        ])
      }
    });

    const buyerRole = await prisma.role.upsert({
      where: { name: 'BUYER' },
      update: {},
      create: {
        name: 'BUYER',
        description: 'Regular buyer with basic access',
        permissions: JSON.stringify([
          'product.read', 'order.create', 'order.read',
          'cart.create', 'cart.read', 'cart.update', 'cart.delete'
        ])
      }
    });

    // Create admin user
    console.log('Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('Admin123!@#', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@nextgen-marketplace.com' },
      update: {},
      create: {
        email: 'admin@nextgen-marketplace.com',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        password: hashedAdminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        phoneNumber: '+1-555-0001',
        bio: 'System Administrator for NextGen Marketplace'
      }
    });

    // Create sample seller users
    console.log('Creating sample seller users...');
    const seller1Password = await bcrypt.hash('Seller123!', 12);
    const seller1 = await prisma.user.upsert({
      where: { email: 'seller1@example.com' },
      update: {},
      create: {
        email: 'seller1@example.com',
        username: 'techstore_seller',
        firstName: 'John',
        lastName: 'Tech',
        password: seller1Password,
        role: 'SELLER',
        status: 'ACTIVE',
        emailVerified: true,
        phoneNumber: '+1-555-0101',
        bio: 'Electronics and gadgets specialist'
      }
    });

    const seller2Password = await bcrypt.hash('Seller456!', 12);
    const seller2 = await prisma.user.upsert({
      where: { email: 'seller2@example.com' },
      update: {},
      create: {
        email: 'seller2@example.com',
        username: 'fashion_boutique',
        firstName: 'Sarah',
        lastName: 'Fashion',
        password: seller2Password,
        role: 'SELLER',
        status: 'ACTIVE',
        emailVerified: true,
        phoneNumber: '+1-555-0102',
        bio: 'Fashion and lifestyle products'
      }
    });

    // Create seller profiles
    console.log('Creating seller profiles...');
    const seller1Profile = await prisma.sellerProfile.upsert({
      where: { userId: seller1.id },
      update: {},
      create: {
        userId: seller1.id,
        businessName: 'TechStore Solutions',
        businessType: 'Electronics Retailer',
        description: 'Premium electronics and technology solutions',
        website: 'https://techstore.example.com',
        verified: true,
        verificationDate: new Date(),
        rating: 4.8,
        totalReviews: 150,
        totalSales: 500
      }
    });

    const seller2Profile = await prisma.sellerProfile.upsert({
      where: { userId: seller2.id },
      update: {},
      create: {
        userId: seller2.id,
        businessName: 'Fashion Boutique Co.',
        businessType: 'Fashion Retailer',
        description: 'Trendy fashion and lifestyle products',
        website: 'https://fashionboutique.example.com',
        verified: true,
        verificationDate: new Date(),
        rating: 4.6,
        totalReviews: 89,
        totalSales: 320
      }
    });

    // Create sample buyer users
    console.log('Creating sample buyer users...');
    const buyer1Password = await bcrypt.hash('Buyer123!', 12);
    const buyer1 = await prisma.user.upsert({
      where: { email: 'buyer1@example.com' },
      update: {},
      create: {
        email: 'buyer1@example.com',
        username: 'john_buyer',
        firstName: 'John',
        lastName: 'Doe',
        password: buyer1Password,
        role: 'BUYER',
        status: 'ACTIVE',
        emailVerified: true,
        phoneNumber: '+1-555-0201',
        address: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        })
      }
    });

    // Create categories
    console.log('Creating product categories...');
    const electronicsCategory = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets'
      }
    });

    const laptopsCategory = await prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Laptops and portable computers',
        parentId: electronicsCategory.id
      }
    });

    const smartphonesCategory = await prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and accessories',
        parentId: electronicsCategory.id
      }
    });

    const fashionCategory = await prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and fashion accessories'
      }
    });

    const mensClothingCategory = await prisma.category.upsert({
      where: { slug: 'mens-clothing' },
      update: {},
      create: {
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Clothing for men',
        parentId: fashionCategory.id
      }
    });

    // Create sample products
    console.log('Creating sample products...');
    
    // Tech products
    const laptop1 = await prisma.product.upsert({
      where: { sku: 'LAPTOP-001' },
      update: {},
      create: {
        name: 'MacBook Pro 14" M3',
        slug: 'macbook-pro-14-m3',
        description: 'Powerful laptop with M3 chip, perfect for professional work and creative tasks. Features stunning Liquid Retina XDR display, advanced camera system, and all-day battery life.',
        shortDescription: 'Professional laptop with M3 chip and 14" display',
        price: 1999.99,
        compareAtPrice: 2199.99,
        costPrice: 1500.00,
        sku: 'LAPTOP-001',
        barcode: '123456789001',
        quantity: 50,
        lowStockThreshold: 5,
        weight: 1.6,
        dimensions: JSON.stringify({ length: 31.26, width: 22.12, height: 1.55 }),
        images: [
          'https://example.com/macbook-1.jpg',
          'https://example.com/macbook-2.jpg'
        ],
        tags: ['apple', 'laptop', 'professional', 'm3'],
        status: 'ACTIVE',
        featured: true,
        metaTitle: 'MacBook Pro 14" M3 - Professional Laptop',
        metaDescription: 'Get the new MacBook Pro with M3 chip for unparalleled performance',
        sellerId: seller1.id,
        categoryId: laptopsCategory.id,
        viewCount: 1250,
        salesCount: 25
      }
    });

    const smartphone1 = await prisma.product.upsert({
      where: { sku: 'PHONE-001' },
      update: {},
      create: {
        name: 'iPhone 15 Pro 256GB',
        slug: 'iphone-15-pro-256gb',
        description: 'Latest iPhone with titanium design, A17 Pro chip, and professional camera system. Includes USB-C connectivity and Action Button.',
        shortDescription: 'Premium smartphone with titanium design',
        price: 1199.99,
        compareAtPrice: 1299.99,
        costPrice: 900.00,
        sku: 'PHONE-001',
        barcode: '123456789002',
        quantity: 100,
        lowStockThreshold: 10,
        weight: 0.187,
        dimensions: JSON.stringify({ length: 14.67, width: 7.08, height: 0.83 }),
        images: [
          'https://example.com/iphone-1.jpg',
          'https://example.com/iphone-2.jpg'
        ],
        tags: ['apple', 'smartphone', 'premium', '5g'],
        status: 'ACTIVE',
        featured: true,
        metaTitle: 'iPhone 15 Pro 256GB - Premium Smartphone',
        metaDescription: 'Experience the latest iPhone with titanium design and A17 Pro chip',
        sellerId: seller1.id,
        categoryId: smartphonesCategory.id,
        viewCount: 2100,
        salesCount: 45
      }
    });

    // Fashion products
    const shirt1 = await prisma.product.upsert({
      where: { sku: 'SHIRT-001' },
      update: {},
      create: {
        name: 'Premium Cotton Dress Shirt',
        slug: 'premium-cotton-dress-shirt',
        description: 'High-quality cotton dress shirt perfect for business and formal occasions. Features wrinkle-resistant fabric and classic fit.',
        shortDescription: 'Professional dress shirt in premium cotton',
        price: 89.99,
        compareAtPrice: 119.99,
        costPrice: 45.00,
        sku: 'SHIRT-001',
        barcode: '123456789003',
        quantity: 200,
        lowStockThreshold: 20,
        weight: 0.3,
        dimensions: JSON.stringify({ length: 30, width: 20, height: 2 }),
        images: [
          'https://example.com/shirt-1.jpg',
          'https://example.com/shirt-2.jpg'
        ],
        tags: ['shirt', 'business', 'cotton', 'formal'],
        status: 'ACTIVE',
        featured: false,
        metaTitle: 'Premium Cotton Dress Shirt - Business Attire',
        metaDescription: 'Professional dress shirt made from premium cotton',
        sellerId: seller2.id,
        categoryId: mensClothingCategory.id,
        viewCount: 450,
        salesCount: 30
      }
    });

    // Create a sample cart
    console.log('Creating sample cart items...');
    await prisma.cartItem.createMany({
      data: [
        {
          userId: buyer1.id,
          productId: smartphone1.id,
          quantity: 1
        },
        {
          userId: buyer1.id,
          productId: shirt1.id,
          quantity: 2
        }
      ],
      skipDuplicates: true
    });

    // Create system settings
    console.log('Creating system settings...');
    const systemSettings = [
      { key: 'site_name', value: 'NextGen Marketplace', description: 'Site name' },
      { key: 'currency', value: 'USD', description: 'Default currency' },
      { key: 'tax_rate', value: '0.08', description: 'Default tax rate', type: 'number' },
      { key: 'shipping_rate', value: '9.99', description: 'Default shipping rate', type: 'number' },
      { key: 'free_shipping_threshold', value: '100', description: 'Free shipping threshold', type: 'number' },
      { key: 'low_stock_notification', value: 'true', description: 'Enable low stock notifications', type: 'boolean' },
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications', type: 'boolean' },
      { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode status', type: 'boolean' }
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Seller Profiles: ${await prisma.sellerProfile.count()}`);
    console.log(`- Categories: ${await prisma.category.count()}`);
    console.log(`- Products: ${await prisma.product.count()}`);
    console.log(`- Cart Items: ${await prisma.cartItem.count()}`);
    console.log(`- Roles: ${await prisma.role.count()}`);
    console.log(`- System Settings: ${await prisma.systemSetting.count()}`);

    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@nextgen-marketplace.com');
    console.log('Password: Admin123!@#');
    
    console.log('\n🛒 Sample Seller Accounts:');
    console.log('1. Email: seller1@example.com, Password: Seller123!');
    console.log('2. Email: seller2@example.com, Password: Seller456!');
    
    console.log('\n👤 Sample Buyer Account:');
    console.log('Email: buyer1@example.com, Password: Buyer123!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
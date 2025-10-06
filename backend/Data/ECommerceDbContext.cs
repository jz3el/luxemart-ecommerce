using Microsoft.EntityFrameworkCore;
using ECommerceAPI.Models;

namespace ECommerceAPI.Data
{
    public class ECommerceDbContext : DbContext
    {
        public ECommerceDbContext(DbContextOptions<ECommerceDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(u => u.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.CategoryId);
                entity.HasIndex(c => c.Name).IsUnique();
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(c => c.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Product entity
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.ProductId);
                entity.HasIndex(p => p.SKU).IsUnique().HasFilter("[SKU] IS NOT NULL");
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(p => p.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure relationship with Category
                entity.HasOne(p => p.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Order entity
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.OrderId);
                entity.HasIndex(o => o.OrderNumber).IsUnique();
                entity.Property(o => o.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(o => o.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure relationship with User
                entity.HasOne(o => o.User)
                    .WithMany(u => u.Orders)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure OrderItem entity
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(oi => oi.OrderItemId);

                // Configure relationships
                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure CartItem entity
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(ci => ci.CartItemId);
                entity.Property(ci => ci.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(ci => ci.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Configure relationships
                entity.HasOne(ci => ci.User)
                    .WithMany(u => u.CartItems)
                    .HasForeignKey(ci => ci.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                    .WithMany(p => p.CartItems)
                    .HasForeignKey(ci => ci.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Ensure unique combination of User and Product in cart
                entity.HasIndex(ci => new { ci.UserId, ci.ProductId }).IsUnique();
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private static void SeedData(ModelBuilder modelBuilder)
        {
            var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category
                {
                    CategoryId = 1,
                    Name = "Electronics",
                    Description = "Electronic devices and accessories",
                    IsActive = true,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Category
                {
                    CategoryId = 2,
                    Name = "Clothing",
                    Description = "Fashion and apparel",
                    IsActive = true,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Category
                {
                    CategoryId = 3,
                    Name = "Books",
                    Description = "Books and literature",
                    IsActive = true,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                }
            );

            // Seed Admin User
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    UserId = 1,
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@ecommerce.com",
                    PasswordHash = GetAdminPasswordHash(), // Password: Admin123!
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                }
            );

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    ProductId = 1,
                    Name = "Smartphone",
                    Description = "Latest smartphone with advanced features",
                    Price = 599.99m,
                    SKU = "PHONE-001",
                    StockQuantity = 50,
                    LowStockThreshold = 10,
                    CategoryId = 1,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Product
                {
                    ProductId = 2,
                    Name = "T-Shirt",
                    Description = "Comfortable cotton t-shirt",
                    Price = 29.99m,
                    SKU = "SHIRT-001",
                    StockQuantity = 100,
                    LowStockThreshold = 20,
                    CategoryId = 2,
                    IsActive = true,
                    IsFeatured = false,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Product
                {
                    ProductId = 3,
                    Name = "Programming Guide",
                    Description = "Comprehensive guide to modern programming",
                    Price = 49.99m,
                    SKU = "BOOK-001",
                    StockQuantity = 25,
                    LowStockThreshold = 5,
                    CategoryId = 3,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                }
            );
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is User || e.Entity is Category || e.Entity is Product || 
                           e.Entity is Order || e.Entity is CartItem)
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Property("CreatedAt") != null)
                        entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }

                if (entry.Property("UpdatedAt") != null)
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }

        private static string GetAdminPasswordHash()
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var saltedPassword = "Admin123!" + "SaltValue123!";
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(saltedPassword));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}

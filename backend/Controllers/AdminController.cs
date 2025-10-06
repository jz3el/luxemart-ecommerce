using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ECommerceAPI.Data;
using ECommerceAPI.Models;
using ECommerceAPI.DTOs;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ECommerceDbContext _context;

        public AdminController(ECommerceDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.IsActive);
            var totalOrders = await _context.Orders.CountAsync();
            var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != OrderStatus.Cancelled)
                .SumAsync(o => o.TotalAmount);

            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new AdminOrderSummaryDto
                {
                    OrderId = o.OrderId,
                    OrderNumber = o.OrderNumber,
                    UserName = $"{o.User.FirstName} {o.User.LastName}",
                    UserEmail = o.User.Email,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status.ToString(),
                    OrderDate = o.CreatedAt
                })
                .ToListAsync();

            var lowStockProducts = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity <= p.LowStockThreshold)
                .Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    SKU = p.SKU,
                    StockQuantity = p.StockQuantity,
                    LowStockThreshold = p.LowStockThreshold,
                    Price = p.Price
                })
                .ToListAsync();

            var dashboard = new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalOrders = totalOrders,
                TotalProducts = totalProducts,
                TotalRevenue = totalRevenue,
                RecentOrders = recentOrders,
                LowStockProducts = lowStockProducts
            };

            return Ok(dashboard);
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
            [FromQuery] string? search = null,
            [FromQuery] string? role = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.FirstName.Contains(search) ||
                                        u.LastName.Contains(search) ||
                                        u.Email.Contains(search));
            }

            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role == role);
            }

            var totalCount = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    City = u.City,
                    State = u.State,
                    ZipCode = u.ZipCode,
                    Country = u.Country,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            var result = new PagedResult<UserDto>
            {
                Items = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        // PUT: api/admin/users/{id}/toggle-status
        [HttpPut("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (user.Role == "Admin")
            {
                return BadRequest(new { message = "Cannot deactivate admin users." });
            }

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully." });
        }

        // PUT: api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto updateRoleDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (user.UserId == currentUserId)
            {
                return BadRequest(new { message = "Cannot change your own role." });
            }

            user.Role = updateRoleDto.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User role updated successfully." });
        }

        // GET: api/admin/products
        [HttpGet("products")]
        public async Task<ActionResult<PagedResult<ProductDto>>> GetProductsForAdmin(
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Products.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || p.SKU.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    CompareAtPrice = p.CompareAtPrice,
                    SKU = p.SKU,
                    StockQuantity = p.StockQuantity,
                    LowStockThreshold = p.LowStockThreshold,
                    ImageUrl = p.ImageUrl,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.Name,
                    IsActive = p.IsActive,
                    IsFeatured = p.IsFeatured,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();

            var result = new PagedResult<ProductDto>
            {
                Items = products,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        // POST: api/admin/products
        [HttpPost("products")]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if SKU already exists
            var existingSku = await _context.Products.FirstOrDefaultAsync(p => p.SKU == createProductDto.SKU);
            if (existingSku != null)
            {
                return BadRequest(new { message = "A product with this SKU already exists." });
            }

            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                CompareAtPrice = createProductDto.CompareAtPrice,
                SKU = createProductDto.SKU,
                StockQuantity = createProductDto.StockQuantity,
                LowStockThreshold = createProductDto.LowStockThreshold,
                ImageUrl = createProductDto.ImageUrl,
                CategoryId = createProductDto.CategoryId,
                IsActive = createProductDto.IsActive,
                IsFeatured = createProductDto.IsFeatured
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Load the category for response
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            var productDto = new ProductDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                CompareAtPrice = product.CompareAtPrice,
                SKU = product.SKU,
                StockQuantity = product.StockQuantity,
                LowStockThreshold = product.LowStockThreshold,
                ImageUrl = product.ImageUrl,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };

            return CreatedAtAction(nameof(GetProductsForAdmin), new { id = product.ProductId }, productDto);
        }

        // PUT: api/admin/products/{id}
        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto updateProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            // Check if SKU already exists (excluding current product)
            var existingSku = await _context.Products
                .FirstOrDefaultAsync(p => p.SKU == updateProductDto.SKU && p.ProductId != id);
            if (existingSku != null)
            {
                return BadRequest(new { message = "A product with this SKU already exists." });
            }

            // Update product properties
            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.Price = updateProductDto.Price;
            product.CompareAtPrice = updateProductDto.CompareAtPrice;
            product.SKU = updateProductDto.SKU;
            product.StockQuantity = updateProductDto.StockQuantity;
            product.LowStockThreshold = updateProductDto.LowStockThreshold;
            product.ImageUrl = updateProductDto.ImageUrl;
            product.CategoryId = updateProductDto.CategoryId;
            product.IsActive = updateProductDto.IsActive;
            product.IsFeatured = updateProductDto.IsFeatured;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/admin/products/{id}
        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            // Check if product has associated orders
            var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
            if (hasOrders)
            {
                return BadRequest(new { message = "Cannot delete product with existing orders. Consider deactivating instead." });
            }

            // Remove associated cart items first
            var cartItems = await _context.CartItems.Where(ci => ci.ProductId == id).ToListAsync();
            _context.CartItems.RemoveRange(cartItems);

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/admin/orders
        [HttpGet("orders")]
        public async Task<ActionResult<PagedResult<OrderDto>>> GetOrdersForAdmin(
            [FromQuery] string? status = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Orders.Include(o => o.User).AsQueryable();

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, out var statusEnum))
            {
                query = query.Where(o => o.Status == statusEnum);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(o => o.OrderNumber.Contains(search) ||
                                        o.User.FirstName.Contains(search) ||
                                        o.User.LastName.Contains(search) ||
                                        o.User.Email.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    OrderNumber = o.OrderNumber,
                    UserId = o.UserId,
                    UserEmail = o.User.Email,
                    UserFullName = $"{o.User.FirstName} {o.User.LastName}",
                    Status = o.Status,
                    SubTotal = o.SubTotal,
                    TaxAmount = o.TaxAmount,
                    ShippingCost = o.ShippingCost,
                    DiscountAmount = o.DiscountAmount,
                    TotalAmount = o.TotalAmount,
                    ShippingAddress = new OrderAddressDto
                    {
                        FirstName = o.ShippingFirstName,
                        LastName = o.ShippingLastName,
                        Address = o.ShippingAddress,
                        City = o.ShippingCity,
                        State = o.ShippingState,
                        ZipCode = o.ShippingZipCode,
                        Country = o.ShippingCountry,
                        Phone = o.ShippingPhone
                    },
                    BillingAddress = o.BillingAddress != null ? new OrderAddressDto
                    {
                        FirstName = o.BillingFirstName ?? "",
                        LastName = o.BillingLastName ?? "",
                        Address = o.BillingAddress ?? "",
                        City = o.BillingCity ?? "",
                        State = o.BillingState ?? "",
                        ZipCode = o.BillingZipCode ?? "",
                        Country = o.BillingCountry ?? "",
                        Phone = null
                    } : null,
                    PaymentStatus = o.PaymentStatus,
                    CouponCode = o.CouponCode,
                    Notes = o.Notes,
                    TrackingNumber = o.TrackingNumber,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    ShippedAt = o.ShippedAt,
                    DeliveredAt = o.DeliveredAt
                })
                .ToListAsync();

            var result = new PagedResult<OrderDto>
            {
                Items = orders,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }
    }
}
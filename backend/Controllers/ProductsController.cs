using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceAPI.Data;
using ECommerceAPI.Models;
using ECommerceAPI.DTOs;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ECommerceDbContext _context;

        public ProductsController(ECommerceDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductQueryDto query)
        {
            var productsQuery = _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive || query.IsActive == false);

            // Apply filters
            if (query.CategoryId.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);
            }

            if (query.MinPrice.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price >= query.MinPrice.Value);
            }

            if (query.MaxPrice.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price <= query.MaxPrice.Value);
            }

            if (query.IsFeatured.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.IsFeatured == query.IsFeatured.Value);
            }

            if (!string.IsNullOrEmpty(query.Search))
            {
                var searchTerm = query.Search.ToLower();
                productsQuery = productsQuery.Where(p => 
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)) ||
                    (p.SKU != null && p.SKU.ToLower().Contains(searchTerm)));
            }

            if (!string.IsNullOrEmpty(query.Tags))
            {
                productsQuery = productsQuery.Where(p => 
                    p.Tags != null && p.Tags.ToLower().Contains(query.Tags.ToLower()));
            }

            // Apply sorting
            productsQuery = query.SortBy.ToLower() switch
            {
                "name" => query.SortOrder.ToLower() == "desc" 
                    ? productsQuery.OrderByDescending(p => p.Name)
                    : productsQuery.OrderBy(p => p.Name),
                "price" => query.SortOrder.ToLower() == "desc"
                    ? productsQuery.OrderByDescending(p => p.Price)
                    : productsQuery.OrderBy(p => p.Price),
                "createdat" => query.SortOrder.ToLower() == "desc"
                    ? productsQuery.OrderByDescending(p => p.CreatedAt)
                    : productsQuery.OrderBy(p => p.CreatedAt),
                _ => productsQuery.OrderByDescending(p => p.CreatedAt)
            };

            var totalCount = await productsQuery.CountAsync();
            var products = await productsQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductDto
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
                ImageAlt = p.ImageAlt,
                Weight = p.Weight,
                Tags = p.Tags,
                IsActive = p.IsActive,
                IsFeatured = p.IsFeatured,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            }).ToList();

            return Ok(new PagedResult<ProductDto>
            {
                Items = productDtos,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound(new { message = $"Product with ID {id} not found." });
            }

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
                ImageAlt = product.ImageAlt,
                Weight = product.Weight,
                Tags = product.Tags,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name
            };

            return Ok(productDto);
        }

        // GET: api/products/featured
        [HttpGet("featured")]
        public async Task<ActionResult<List<ProductDto>>> GetFeaturedProducts([FromQuery] int count = 8)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsFeatured && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .Take(count)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductDto
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
                ImageAlt = p.ImageAlt,
                Weight = p.Weight,
                Tags = p.Tags,
                IsActive = p.IsActive,
                IsFeatured = p.IsFeatured,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            }).ToList();

            return Ok(productDtos);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == createProductDto.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category not found." });
            }

            // Check if SKU is unique (if provided)
            if (!string.IsNullOrEmpty(createProductDto.SKU))
            {
                var skuExists = await _context.Products.AnyAsync(p => p.SKU == createProductDto.SKU);
                if (skuExists)
                {
                    return BadRequest(new { message = "SKU already exists." });
                }
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
                ImageAlt = createProductDto.ImageAlt,
                Weight = createProductDto.Weight,
                Tags = createProductDto.Tags,
                IsActive = createProductDto.IsActive,
                IsFeatured = createProductDto.IsFeatured,
                CategoryId = createProductDto.CategoryId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Load the category for response
            await _context.Entry(product)
                .Reference(p => p.Category)
                .LoadAsync();

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
                ImageAlt = product.ImageAlt,
                Weight = product.Weight,
                Tags = product.Tags,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, productDto);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto updateProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = $"Product with ID {id} not found." });
            }

            // Check if category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == updateProductDto.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category not found." });
            }

            // Check if SKU is unique (if provided and different from current)
            if (!string.IsNullOrEmpty(updateProductDto.SKU) && updateProductDto.SKU != product.SKU)
            {
                var skuExists = await _context.Products.AnyAsync(p => p.SKU == updateProductDto.SKU);
                if (skuExists)
                {
                    return BadRequest(new { message = "SKU already exists." });
                }
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
            product.ImageAlt = updateProductDto.ImageAlt;
            product.Weight = updateProductDto.Weight;
            product.Tags = updateProductDto.Tags;
            product.IsActive = updateProductDto.IsActive;
            product.IsFeatured = updateProductDto.IsFeatured;
            product.CategoryId = updateProductDto.CategoryId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound(new { message = $"Product with ID {id} not found." });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = $"Product with ID {id} not found." });
            }

            // Instead of hard delete, soft delete by setting IsActive to false
            product.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductId == id);
        }
    }
}
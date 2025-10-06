using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceAPI.Data;
using ECommerceAPI.Models;
using ECommerceAPI.DTOs;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ECommerceDbContext _context;

        public CategoriesController(ECommerceDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories([FromQuery] bool includeInactive = false)
        {
            var categoriesQuery = _context.Categories.AsQueryable();

            if (!includeInactive)
            {
                categoriesQuery = categoriesQuery.Where(c => c.IsActive);
            }

            var categories = await categoriesQuery
                .Include(c => c.Products.Where(p => p.IsActive))
                .OrderBy(c => c.Name)
                .ToListAsync();

            var categoryDtos = categories.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                ProductCount = c.Products.Count
            }).ToList();

            return Ok(categoryDtos);
        }

        // GET: api/categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products.Where(p => p.IsActive))
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound(new { message = $"Category with ID {id} not found." });
            }

            var categoryDto = new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ProductCount = category.Products.Count
            };

            return Ok(categoryDto);
        }

        // GET: api/categories/5/products
        [HttpGet("{id}/products")]
        public async Task<ActionResult<PagedResult<ProductDto>>> GetCategoryProducts(
            int id, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 12)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == id);
            if (!categoryExists)
            {
                return NotFound(new { message = $"Category with ID {id} not found." });
            }

            var productsQuery = _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == id && p.IsActive);

            var totalCount = await productsQuery.CountAsync();
            var products = await productsQuery
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
                Page = page,
                PageSize = pageSize
            });
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto createCategoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if category name is unique
            var nameExists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == createCategoryDto.Name.ToLower());
            if (nameExists)
            {
                return BadRequest(new { message = "Category name already exists." });
            }

            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                ImageUrl = createCategoryDto.ImageUrl,
                IsActive = createCategoryDto.IsActive
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var categoryDto = new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ProductCount = 0
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, categoryDto);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto updateCategoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = $"Category with ID {id} not found." });
            }

            // Check if category name is unique (if different from current)
            if (updateCategoryDto.Name.ToLower() != category.Name.ToLower())
            {
                var nameExists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == updateCategoryDto.Name.ToLower());
                if (nameExists)
                {
                    return BadRequest(new { message = "Category name already exists." });
                }
            }

            // Update category properties
            category.Name = updateCategoryDto.Name;
            category.Description = updateCategoryDto.Description;
            category.ImageUrl = updateCategoryDto.ImageUrl;
            category.IsActive = updateCategoryDto.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound(new { message = $"Category with ID {id} not found." });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound(new { message = $"Category with ID {id} not found." });
            }

            // Check if category has products
            if (category.Products.Any(p => p.IsActive))
            {
                return BadRequest(new { message = "Cannot delete category with active products. Please move products to another category first." });
            }

            // Soft delete by setting IsActive to false
            category.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.CategoryId == id);
        }
    }
}
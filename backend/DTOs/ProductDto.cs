using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public string? SKU { get; set; }
        public int StockQuantity { get; set; }
        public int? LowStockThreshold { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageAlt { get; set; }
        public double? Weight { get; set; }
        public string? Tags { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class CreateProductDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 999999.99)]
        public decimal Price { get; set; }

        [Range(0.01, 999999.99)]
        public decimal? CompareAtPrice { get; set; }

        [StringLength(100)]
        public string? SKU { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Range(0, int.MaxValue)]
        public int? LowStockThreshold { get; set; }

        [StringLength(255)]
        public string? ImageUrl { get; set; }

        [StringLength(500)]
        public string? ImageAlt { get; set; }

        [Range(0, double.MaxValue)]
        public double? Weight { get; set; }

        [StringLength(500)]
        public string? Tags { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        [Required]
        public int CategoryId { get; set; }
    }

    public class UpdateProductDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 999999.99)]
        public decimal Price { get; set; }

        [Range(0.01, 999999.99)]
        public decimal? CompareAtPrice { get; set; }

        [StringLength(100)]
        public string? SKU { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Range(0, int.MaxValue)]
        public int? LowStockThreshold { get; set; }

        [StringLength(255)]
        public string? ImageUrl { get; set; }

        [StringLength(500)]
        public string? ImageAlt { get; set; }

        [Range(0, double.MaxValue)]
        public double? Weight { get; set; }

        [StringLength(500)]
        public string? Tags { get; set; }

        public bool IsActive { get; set; }

        public bool IsFeatured { get; set; }

        [Required]
        public int CategoryId { get; set; }
    }

    public class ProductQueryDto
    {
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsActive { get; set; } = true;
        public string? Search { get; set; }
        public string? Tags { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string SortBy { get; set; } = "CreatedAt";
        public string SortOrder { get; set; } = "desc";
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNext => Page < TotalPages;
        public bool HasPrevious => Page > 1;
    }
}
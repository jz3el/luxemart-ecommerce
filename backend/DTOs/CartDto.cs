using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.DTOs
{
    public class CartItemDto
    {
        public int CartItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductSKU { get; set; }
        public string? ProductImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public int StockQuantity { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }

    public class CartSummaryDto
    {
        public int UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        public int TotalItems { get; set; }
        public decimal SubTotal { get; set; }
        public decimal EstimatedTax { get; set; }
        public decimal EstimatedTotal { get; set; }
        public DateTime LastUpdated { get; set; }
        public bool HasUnavailableItems { get; set; }
    }

    public class CartValidationDto
    {
        public bool IsValid { get; set; }
        public List<string> Issues { get; set; } = new List<string>();
        public List<CartItemDto> UnavailableItems { get; set; } = new List<CartItemDto>();
        public List<CartItemDto> OutOfStockItems { get; set; } = new List<CartItemDto>();
    }
}
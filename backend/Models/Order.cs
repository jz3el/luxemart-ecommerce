using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceAPI.Models
{
    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled,
        Refunded
    }

    public enum PaymentStatus
    {
        Pending,
        Paid,
        Failed,
        Refunded
    }

    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Required]
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [StringLength(100)]
        public string? CouponCode { get; set; }

        // Shipping Information
        [Required]
        [StringLength(100)]
        public string ShippingFirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ShippingLastName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ShippingCity { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ShippingState { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string ShippingZipCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ShippingCountry { get; set; } = string.Empty;

        [StringLength(15)]
        public string? ShippingPhone { get; set; }

        // Billing Information
        [StringLength(100)]
        public string? BillingFirstName { get; set; }

        [StringLength(100)]
        public string? BillingLastName { get; set; }

        [StringLength(500)]
        public string? BillingAddress { get; set; }

        [StringLength(100)]
        public string? BillingCity { get; set; }

        [StringLength(100)]
        public string? BillingState { get; set; }

        [StringLength(20)]
        public string? BillingZipCode { get; set; }

        [StringLength(100)]
        public string? BillingCountry { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        [StringLength(100)]
        public string? TrackingNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ShippedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        // Foreign Keys
        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
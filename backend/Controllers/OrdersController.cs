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
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly ECommerceDbContext _context;

        public OrdersController(ECommerceDbContext context)
        {
            _context = context;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<PagedResult<OrderSummaryDto>>> GetOrders([FromQuery] OrderQueryDto query)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            var ordersQuery = _context.Orders.AsQueryable();

            // If not admin, only show user's own orders
            if (userRole != "Admin")
            {
                ordersQuery = ordersQuery.Where(o => o.UserId == userId);
            }

            // Apply filters
            if (query.Status.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.Status == query.Status.Value);
            }

            if (query.PaymentStatus.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.PaymentStatus == query.PaymentStatus.Value);
            }

            if (query.FromDate.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.CreatedAt >= query.FromDate.Value);
            }

            if (query.ToDate.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.CreatedAt <= query.ToDate.Value);
            }

            if (query.MinAmount.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.TotalAmount >= query.MinAmount.Value);
            }

            if (query.MaxAmount.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.TotalAmount <= query.MaxAmount.Value);
            }

            if (!string.IsNullOrEmpty(query.Search))
            {
                var searchTerm = query.Search.ToLower();
                ordersQuery = ordersQuery.Where(o => 
                    o.OrderNumber.ToLower().Contains(searchTerm) ||
                    o.ShippingFirstName.ToLower().Contains(searchTerm) ||
                    o.ShippingLastName.ToLower().Contains(searchTerm) ||
                    (o.TrackingNumber != null && o.TrackingNumber.ToLower().Contains(searchTerm)));
            }

            // Apply sorting
            ordersQuery = query.SortBy.ToLower() switch
            {
                "ordernumber" => query.SortOrder.ToLower() == "desc"
                    ? ordersQuery.OrderByDescending(o => o.OrderNumber)
                    : ordersQuery.OrderBy(o => o.OrderNumber),
                "status" => query.SortOrder.ToLower() == "desc"
                    ? ordersQuery.OrderByDescending(o => o.Status)
                    : ordersQuery.OrderBy(o => o.Status),
                "totalamount" => query.SortOrder.ToLower() == "desc"
                    ? ordersQuery.OrderByDescending(o => o.TotalAmount)
                    : ordersQuery.OrderBy(o => o.TotalAmount),
                _ => query.SortOrder.ToLower() == "desc"
                    ? ordersQuery.OrderByDescending(o => o.CreatedAt)
                    : ordersQuery.OrderBy(o => o.CreatedAt)
            };

            var totalCount = await ordersQuery.CountAsync();
            var orders = await ordersQuery
                .Include(o => o.OrderItems)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var orderSummaries = orders.Select(o => new OrderSummaryDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                TotalAmount = o.TotalAmount,
                ItemCount = o.OrderItems.Sum(oi => oi.Quantity),
                CreatedAt = o.CreatedAt,
                ShippedAt = o.ShippedAt,
                DeliveredAt = o.DeliveredAt
            }).ToList();

            return Ok(new PagedResult<OrderSummaryDto>
            {
                Items = orderSummaries,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            var orderQuery = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .AsQueryable();

            // If not admin, only allow access to user's own orders
            if (userRole != "Admin")
            {
                orderQuery = orderQuery.Where(o => o.UserId == userId);
            }

            var order = await orderQuery.FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} not found." });
            }

            var orderDto = BuildOrderDto(order);
            return Ok(orderDto);
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto createOrderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            // Get user's cart items
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                return BadRequest(new { message = "Cart is empty. Cannot create order." });
            }

            // Validate cart items
            var validationIssues = new List<string>();
            foreach (var item in cartItems)
            {
                if (!item.Product.IsActive)
                {
                    validationIssues.Add($"Product '{item.Product.Name}' is no longer available.");
                }
                else if (item.Product.StockQuantity < item.Quantity)
                {
                    validationIssues.Add($"Only {item.Product.StockQuantity} items available for '{item.Product.Name}', but you have {item.Quantity} in cart.");
                }
            }

            if (validationIssues.Any())
            {
                return BadRequest(new { message = "Cart validation failed.", issues = validationIssues });
            }

            // Calculate order totals
            var subTotal = cartItems.Sum(ci => ci.Product.Price * ci.Quantity);
            var taxRate = 0.08m; // 8% tax
            var taxAmount = subTotal * taxRate;
            var shippingCost = CalculateShipping(subTotal);
            var discountAmount = 0m; // TODO: Apply coupon discounts
            var totalAmount = subTotal + taxAmount + shippingCost - discountAmount;

            // Create order
            var order = new Order
            {
                OrderNumber = GenerateOrderNumber(),
                UserId = userId,
                Status = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                SubTotal = subTotal,
                TaxAmount = taxAmount,
                ShippingCost = shippingCost,
                DiscountAmount = discountAmount,
                TotalAmount = totalAmount,
                CouponCode = createOrderDto.CouponCode,
                Notes = createOrderDto.Notes,

                // Shipping Address
                ShippingFirstName = createOrderDto.ShippingAddress.FirstName,
                ShippingLastName = createOrderDto.ShippingAddress.LastName,
                ShippingAddress = createOrderDto.ShippingAddress.Address,
                ShippingCity = createOrderDto.ShippingAddress.City,
                ShippingState = createOrderDto.ShippingAddress.State,
                ShippingZipCode = createOrderDto.ShippingAddress.ZipCode,
                ShippingCountry = createOrderDto.ShippingAddress.Country,
                ShippingPhone = createOrderDto.ShippingAddress.Phone,

                // Billing Address (use shipping if not provided)
                BillingFirstName = createOrderDto.BillingAddress?.FirstName ?? createOrderDto.ShippingAddress.FirstName,
                BillingLastName = createOrderDto.BillingAddress?.LastName ?? createOrderDto.ShippingAddress.LastName,
                BillingAddress = createOrderDto.BillingAddress?.Address ?? createOrderDto.ShippingAddress.Address,
                BillingCity = createOrderDto.BillingAddress?.City ?? createOrderDto.ShippingAddress.City,
                BillingState = createOrderDto.BillingAddress?.State ?? createOrderDto.ShippingAddress.State,
                BillingZipCode = createOrderDto.BillingAddress?.ZipCode ?? createOrderDto.ShippingAddress.ZipCode,
                BillingCountry = createOrderDto.BillingAddress?.Country ?? createOrderDto.ShippingAddress.Country
            };

            // Create order items
            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.Product.Price,
                    TotalPrice = cartItem.Product.Price * cartItem.Quantity,
                    ProductName = cartItem.Product.Name,
                    ProductSKU = cartItem.Product.SKU,
                    ProductImageUrl = cartItem.Product.ImageUrl
                };

                order.OrderItems.Add(orderItem);

                // Update product stock
                cartItem.Product.StockQuantity -= cartItem.Quantity;
            }

            // Save order
            _context.Orders.Add(order);

            // Clear cart
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // Load order with related data for response
            await _context.Entry(order)
                .Reference(o => o.User)
                .LoadAsync();

            await _context.Entry(order)
                .Collection(o => o.OrderItems)
                .LoadAsync();

            // Simulate payment processing
            // In a real app, this would integrate with a payment processor
            if (createOrderDto.PaymentMethod == "CreditCard")
            {
                // Simulate successful payment
                order.PaymentStatus = PaymentStatus.Paid;
                order.Status = OrderStatus.Processing;
                await _context.SaveChangesAsync();
            }

            var orderDto = BuildOrderDto(order);
            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, orderDto);
        }

        // PUT: api/orders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto updateStatusDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userRole = GetCurrentUserRole();
            if (userRole != "Admin")
            {
                return Forbid();
            }

            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} not found." });
            }

            var oldStatus = order.Status;
            order.Status = updateStatusDto.Status;
            order.Notes = updateStatusDto.Notes ?? order.Notes;

            if (!string.IsNullOrEmpty(updateStatusDto.TrackingNumber))
            {
                order.TrackingNumber = updateStatusDto.TrackingNumber;
            }

            // Update timestamps based on status change
            if (updateStatusDto.Status == OrderStatus.Shipped && oldStatus != OrderStatus.Shipped)
            {
                order.ShippedAt = DateTime.UtcNow;
            }
            else if (updateStatusDto.Status == OrderStatus.Delivered && oldStatus != OrderStatus.Delivered)
            {
                order.DeliveredAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/orders/{id}/cancel
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            var orderQuery = _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .AsQueryable();

            // Users can only cancel their own orders, admins can cancel any
            if (userRole != "Admin")
            {
                orderQuery = orderQuery.Where(o => o.UserId == userId);
            }

            var order = await orderQuery.FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} not found." });
            }

            // Only allow cancellation of pending or processing orders
            if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Processing)
            {
                return BadRequest(new { message = "Order cannot be cancelled in its current status." });
            }

            // Restore product stock
            foreach (var orderItem in order.OrderItems)
            {
                orderItem.Product.StockQuantity += orderItem.Quantity;
            }

            // Update order status
            order.Status = OrderStatus.Cancelled;

            // If payment was processed, mark for refund
            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                order.PaymentStatus = PaymentStatus.Refunded;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order cancelled successfully." });
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "Customer";
        }

        private static decimal CalculateShipping(decimal subTotal)
        {
            // Simple shipping calculation
            return subTotal >= 100 ? 0 : 9.99m; // Free shipping over $100
        }

        private static string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"ORD-{timestamp}-{random}";
        }

        private static OrderDto BuildOrderDto(Order order)
        {
            return new OrderDto
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                PaymentStatus = order.PaymentStatus,
                SubTotal = order.SubTotal,
                TaxAmount = order.TaxAmount,
                ShippingCost = order.ShippingCost,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                CouponCode = order.CouponCode,
                TrackingNumber = order.TrackingNumber,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                ShippedAt = order.ShippedAt,
                DeliveredAt = order.DeliveredAt,
                UserId = order.UserId,
                UserEmail = order.User.Email,
                UserFullName = $"{order.User.FirstName} {order.User.LastName}",

                ShippingAddress = new OrderAddressDto
                {
                    FirstName = order.ShippingFirstName,
                    LastName = order.ShippingLastName,
                    Address = order.ShippingAddress,
                    City = order.ShippingCity,
                    State = order.ShippingState,
                    ZipCode = order.ShippingZipCode,
                    Country = order.ShippingCountry,
                    Phone = order.ShippingPhone
                },

                BillingAddress = new OrderAddressDto
                {
                    FirstName = order.BillingFirstName ?? "",
                    LastName = order.BillingLastName ?? "",
                    Address = order.BillingAddress ?? "",
                    City = order.BillingCity ?? "",
                    State = order.BillingState ?? "",
                    ZipCode = order.BillingZipCode ?? "",
                    Country = order.BillingCountry ?? "",
                },

                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductSKU = oi.ProductSKU,
                    ProductImageUrl = oi.ProductImageUrl,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            };
        }
    }
}
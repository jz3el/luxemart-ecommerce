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
    public class CartController : ControllerBase
    {
        private readonly ECommerceDbContext _context;

        public CartController(ECommerceDbContext context)
        {
            _context = context;
        }

        // GET: api/cart
        [HttpGet]
        public async Task<ActionResult<CartSummaryDto>> GetCart()
        {
            var userId = GetCurrentUserId();
            
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Category)
                .Where(ci => ci.UserId == userId)
                .OrderBy(ci => ci.CreatedAt)
                .ToListAsync();

            var cartSummary = await BuildCartSummary(userId, cartItems);
            return Ok(cartSummary);
        }

        // POST: api/cart/items
        [HttpPost("items")]
        public async Task<ActionResult<CartItemDto>> AddToCart(AddToCartDto addToCartDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            // Check if product exists and is active
            var product = await _context.Products.FindAsync(addToCartDto.ProductId);
            if (product == null || !product.IsActive)
            {
                return BadRequest(new { message = "Product not found or not available." });
            }

            // Check stock availability
            if (product.StockQuantity < addToCartDto.Quantity)
            {
                return BadRequest(new { message = $"Only {product.StockQuantity} items available in stock." });
            }

            // Check if item already exists in cart
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == addToCartDto.ProductId);

            if (existingCartItem != null)
            {
                // Update existing item quantity
                var newQuantity = existingCartItem.Quantity + addToCartDto.Quantity;
                
                if (product.StockQuantity < newQuantity)
                {
                    return BadRequest(new { message = $"Cannot add {addToCartDto.Quantity} more items. Only {product.StockQuantity - existingCartItem.Quantity} more available." });
                }

                existingCartItem.Quantity = newQuantity;
                await _context.SaveChangesAsync();

                return Ok(await BuildCartItemDto(existingCartItem));
            }
            else
            {
                // Add new item to cart
                var cartItem = new CartItem
                {
                    UserId = userId,
                    ProductId = addToCartDto.ProductId,
                    Quantity = addToCartDto.Quantity
                };

                _context.CartItems.Add(cartItem);
                await _context.SaveChangesAsync();

                // Load the product for response
                await _context.Entry(cartItem)
                    .Reference(ci => ci.Product)
                    .LoadAsync();

                return Ok(await BuildCartItemDto(cartItem));
            }
        }

        // PUT: api/cart/items/{itemId}
        [HttpPut("items/{itemId}")]
        public async Task<IActionResult> UpdateCartItem(int itemId, UpdateCartItemDto updateCartItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.CartItemId == itemId && ci.UserId == userId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            // Check stock availability
            if (cartItem.Product.StockQuantity < updateCartItemDto.Quantity)
            {
                return BadRequest(new { message = $"Only {cartItem.Product.StockQuantity} items available in stock." });
            }

            cartItem.Quantity = updateCartItemDto.Quantity;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/cart/items/{itemId}
        [HttpDelete("items/{itemId}")]
        public async Task<IActionResult> RemoveFromCart(int itemId)
        {
            var userId = GetCurrentUserId();

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartItemId == itemId && ci.UserId == userId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/cart
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();

            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/cart/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCartItemCount()
        {
            var userId = GetCurrentUserId();

            var totalItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .SumAsync(ci => ci.Quantity);

            return Ok(totalItems);
        }

        // GET: api/cart/validate
        [HttpGet("validate")]
        public async Task<ActionResult<CartValidationDto>> ValidateCart()
        {
            var userId = GetCurrentUserId();

            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            var validation = new CartValidationDto { IsValid = true };

            foreach (var item in cartItems)
            {
                if (!item.Product.IsActive)
                {
                    validation.IsValid = false;
                    validation.Issues.Add($"Product '{item.Product.Name}' is no longer available.");
                    validation.UnavailableItems.Add(await BuildCartItemDto(item));
                }
                else if (item.Product.StockQuantity < item.Quantity)
                {
                    validation.IsValid = false;
                    validation.Issues.Add($"Only {item.Product.StockQuantity} items available for '{item.Product.Name}', but you have {item.Quantity} in cart.");
                    validation.OutOfStockItems.Add(await BuildCartItemDto(item));
                }
            }

            return Ok(validation);
        }

        // POST: api/cart/merge
        [HttpPost("merge")]
        public async Task<ActionResult<CartSummaryDto>> MergeCart([FromBody] List<AddToCartDto> guestCartItems)
        {
            var userId = GetCurrentUserId();

            foreach (var guestItem in guestCartItems)
            {
                var product = await _context.Products.FindAsync(guestItem.ProductId);
                if (product == null || !product.IsActive) continue;

                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == guestItem.ProductId);

                if (existingItem != null)
                {
                    var newQuantity = existingItem.Quantity + guestItem.Quantity;
                    existingItem.Quantity = Math.Min(newQuantity, product.StockQuantity);
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        UserId = userId,
                        ProductId = guestItem.ProductId,
                        Quantity = Math.Min(guestItem.Quantity, product.StockQuantity)
                    };
                    _context.CartItems.Add(cartItem);
                }
            }

            await _context.SaveChangesAsync();

            // Return updated cart
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Category)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            var cartSummary = await BuildCartSummary(userId, cartItems);
            return Ok(cartSummary);
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        private async Task<CartSummaryDto> BuildCartSummary(int userId, List<CartItem> cartItems)
        {
            const decimal taxRate = 0.08m; // 8% tax rate

            var cartItemDtos = new List<CartItemDto>();
            decimal subTotal = 0;
            int totalItemCount = 0;
            bool hasUnavailableItems = false;

            foreach (var item in cartItems)
            {
                var cartItemDto = await BuildCartItemDto(item);
                cartItemDtos.Add(cartItemDto);

                if (cartItemDto.IsAvailable)
                {
                    subTotal += cartItemDto.TotalPrice;
                    totalItemCount += cartItemDto.Quantity;
                }
                else
                {
                    hasUnavailableItems = true;
                }
            }

            var estimatedTax = subTotal * taxRate;
            var estimatedTotal = subTotal + estimatedTax;

            return new CartSummaryDto
            {
                UserId = userId,
                Items = cartItemDtos,
                TotalItems = totalItemCount,
                SubTotal = subTotal,
                EstimatedTax = estimatedTax,
                EstimatedTotal = estimatedTotal,
                LastUpdated = cartItems.Any() ? cartItems.Max(ci => ci.UpdatedAt) : DateTime.UtcNow,
                HasUnavailableItems = hasUnavailableItems
            };
        }

        private async Task<CartItemDto> BuildCartItemDto(CartItem cartItem)
        {
            if (cartItem.Product == null)
            {
                await _context.Entry(cartItem)
                    .Reference(ci => ci.Product)
                    .LoadAsync();
            }

            var isAvailable = cartItem.Product?.IsActive == true && cartItem.Product.StockQuantity >= cartItem.Quantity;

            return new CartItemDto
            {
                CartItemId = cartItem.CartItemId,
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product?.Name ?? "",
                ProductSKU = cartItem.Product?.SKU,
                ProductImageUrl = cartItem.Product?.ImageUrl,
                UnitPrice = cartItem.Product?.Price ?? 0,
                Quantity = cartItem.Quantity,
                TotalPrice = isAvailable ? (cartItem.Product?.Price ?? 0) * cartItem.Quantity : 0,
                StockQuantity = cartItem.Product?.StockQuantity ?? 0,
                IsAvailable = isAvailable,
                CreatedAt = cartItem.CreatedAt,
                UpdatedAt = cartItem.UpdatedAt
            };
        }
    }
}
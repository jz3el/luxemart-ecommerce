using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ECommerceAPI.Data;
using ECommerceAPI.Models;
using ECommerceAPI.DTOs;
using ECommerceAPI.Services;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ECommerceDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(ECommerceDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if user with email already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());
            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this email already exists." });
            }

            // Hash password
            var passwordHash = HashPassword(registerDto.Password);

            // Create new user
            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email.ToLower(),
                PasswordHash = passwordHash,
                PhoneNumber = registerDto.PhoneNumber,
                Role = "Customer",
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);
            var expiryHours = double.Parse(HttpContext.RequestServices.GetRequiredService<IConfiguration>()["JWT:ExpiryHours"] ?? "24");

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                State = user.State,
                ZipCode = user.ZipCode,
                Country = user.Country,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Role = user.Role
            };

            var response = new AuthResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(expiryHours),
                User = userDto
            };

            return Ok(response);
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());
            if (user == null || !user.IsActive)
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            // Verify password
            if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);
            var expiryHours = double.Parse(HttpContext.RequestServices.GetRequiredService<IConfiguration>()["JWT:ExpiryHours"] ?? "24");

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                State = user.State,
                ZipCode = user.ZipCode,
                Country = user.Country,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Role = user.Role
            };

            var response = new AuthResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(expiryHours),
                User = userDto
            };

            return Ok(response);
        }

        // GET: api/auth/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
            {
                return NotFound(new { message = "User not found." });
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                State = user.State,
                ZipCode = user.ZipCode,
                Country = user.Country,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Role = user.Role
            };

            return Ok(userDto);
        }

        // PUT: api/auth/profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(UpdateUserDto updateUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
            {
                return NotFound(new { message = "User not found." });
            }

            // Update user properties
            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.PhoneNumber = updateUserDto.PhoneNumber;
            user.Address = updateUserDto.Address;
            user.City = updateUserDto.City;
            user.State = updateUserDto.State;
            user.ZipCode = updateUserDto.ZipCode;
            user.Country = updateUserDto.Country;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return BadRequest(new { message = "Error updating user profile." });
            }

            return NoContent();
        }

        // POST: api/auth/change-password
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
            {
                return NotFound(new { message = "User not found." });
            }

            // Verify current password
            if (!VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            // Hash new password
            user.PasswordHash = HashPassword(changePasswordDto.NewPassword);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return BadRequest(new { message = "Error changing password." });
            }

            return Ok(new { message = "Password changed successfully." });
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var saltedPassword = password + "SaltValue123!";
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private static bool VerifyPassword(string password, string hash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == hash;
        }
    }
}
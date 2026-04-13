using ChatApp.Api.Data;
using ChatApp.Api.Interfaces;
using ChatApp.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;


namespace ChatApp.Api.Services;

public class AuthService : IAuthService
{
    private readonly ChatDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ChatDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<User?> Login(string username, string password)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.Username == username && x.Password == password);
    }

    public async Task<User> Register(string username, string password)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Password = password
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
        new Claim("userId", user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username)
    };

        var key = new SymmetricSecurityKey(
       Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
   );
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "chatapp",
            audience: "chatapp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(5),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
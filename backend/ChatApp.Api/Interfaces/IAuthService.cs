using ChatApp.Api.Models;

namespace ChatApp.Api.Interfaces;

public interface IAuthService
{
    Task<User?> Login(string username, string password);
    Task<User> Register(string username, string password);
    string GenerateToken(User user);
}
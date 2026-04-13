using ChatApp.Api.Models;

namespace ChatApp.Api.Interfaces;

public interface IAuthService
{
    Task<User?> Login(string username, string password);
    Task<User> Register(string username, string password);
    Task<User?> GetUserById(Guid id);
    string GenerateToken(User user);
}
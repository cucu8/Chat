using ChatApp.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(string username, string password)
    {
        var user = await _authService.Login(username, password);

        if (user == null)
            return Unauthorized("Kullanıcı bulunamadı");

        var token = _authService.GenerateToken(user);

        return Ok(new
        {
            token,
            user.Id,
            user.Username
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(string username, string password)
    {
        var user = await _authService.Register(username, password);

        return Ok(new
        {
            user.Id,
            user.Username
        });
    }
}
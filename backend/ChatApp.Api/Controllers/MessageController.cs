using Microsoft.AspNetCore.Mvc;
using ChatApp.Api.Interfaces;
using ChatApp.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace ChatApp.Api.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessageController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    // 1. Mesaj gönder
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] Message message)
    {
        await _messageService.SaveMessage(message.SenderId, message.ReceiverId, message.Content);
        return Ok(message);
    }

    // 2. Mesajları getir
    [HttpGet]
    public IActionResult GetMessages(string user1, string user2)
    {
        var messages = _messageService.GetMessages(user1, user2);
        return Ok(messages);
    }
}
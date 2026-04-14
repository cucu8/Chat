using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Interfaces;
using StackExchange.Redis;
using System.Security.Claims;

namespace ChatApp.Api.Hubs;

public class ChatHub : Hub
{

    private readonly IMessageService _messageService;
    private readonly IAuthService _authService;
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _db;

    public ChatHub(IMessageService messageService, IAuthService authService, IConnectionMultiplexer redis)
    {
        _messageService = messageService;
        _authService = authService;
        _redis = redis;
        _db = _redis.GetDatabase();
    }

    // kullanıcı bağlandığında
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("userId")?.Value;
        var username = Context.User?.FindFirst("username")?.Value;

        if (userId != null && username != null)
        {
            await _db.HashSetAsync($"user:{userId}",
            new HashEntry[]
            {
                new("connectionId", Context.ConnectionId),
                new("username", username)
            });
        }

        Console.WriteLine("USER: " + username);

        await base.OnConnectedAsync();
    }

    // kullanıcı ayrıldığında
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User.FindFirst("userId")?.Value;

        if (userId != null)
        {
            await _db.KeyDeleteAsync($"user:{userId}");
        }

        Console.WriteLine("CONNECTION_DISCONNECTED: " + userId);


        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string senderId, string receiverId, string message)
    {
        await _messageService.SaveMessage(senderId, receiverId, message);

        // sender name
        string senderName = "Bilinmeyen";
        if (Guid.TryParse(senderId, out var senderGuid))
        {
            var sender = await _authService.GetUserById(senderGuid);
            if (sender != null)
            {
                senderName = sender.Username;
            }
        }

        // 🔥 RECEIVER connectionId al
        var receiverConnectionId = await _db.HashGetAsync($"user:{receiverId}", "connectionId");

        if (!receiverConnectionId.IsNullOrEmpty)
        {
            await Clients.Client(receiverConnectionId!)
                .SendAsync("ReceiveMessage", senderName, message);
        }
    }
}
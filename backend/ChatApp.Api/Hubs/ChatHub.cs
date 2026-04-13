using Microsoft.AspNetCore.SignalR;
using ChatApp.Api.Interfaces;

namespace ChatApp.Api.Hubs;

public class ChatHub : Hub
{

    private readonly IMessageService _messageService;
    private static readonly Dictionary<string, string> _connections = new();

    public ChatHub(IMessageService messageService)
    {
        _messageService = messageService;
    }

    // kullanıcı bağlandığında
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext.Request.Query["userId"];

        _connections[Context.ConnectionId] = userId;

        Console.WriteLine($"Connected: {Context.ConnectionId} - User: {userId}");

        await base.OnConnectedAsync();
    }

    // kullanıcı ayrıldığında
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _connections.Remove(Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }

    // mesaj gönderme
    public async Task SendMessage(string senderId, string receiverId, string message)
    {
        await _messageService.SaveMessage(senderId, receiverId, message);

        // 🔥 receiver'ın connectionId'sini bul
        var connectionId = _connections
            .FirstOrDefault(x => x.Value == receiverId).Key;

        //ilgili connetctionID'ye yolla
        if (!string.IsNullOrEmpty(connectionId))
        {
            await Clients.Client(connectionId)
                .SendAsync("ReceiveMessage", senderId, message);
        }
    }
}
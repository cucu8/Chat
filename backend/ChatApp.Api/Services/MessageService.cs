using ChatApp.Api.Interfaces;
using ChatApp.Api.Models;
using ChatApp.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Api.Services;

public class MessageService : IMessageService
{
    private readonly ChatDbContext _context;

    public MessageService(ChatDbContext context)
    {
        _context = context;
    }

    public async Task<List<Message>> SaveMessage(string senderId, string receiverId, string content)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return await GetMessages(senderId, receiverId);
    }
    public async Task<List<Message>> GetMessages(string user1, string user2)
    {
        return await _context.Messages.Where(m =>
            (m.SenderId == user1 && m.ReceiverId == user2) ||
            (m.SenderId == user2 && m.ReceiverId == user1)).OrderBy(m => m.CreatedAt).ToListAsync();
    }
}
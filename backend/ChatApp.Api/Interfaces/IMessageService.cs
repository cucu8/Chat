using ChatApp.Api.Models;

namespace ChatApp.Api.Interfaces;

public interface IMessageService
{
    Task<List<Message>> GetMessages(string user1, string user2);
    Task<List<Message>> SaveMessage(string senderId, string receiverId, string content);
}
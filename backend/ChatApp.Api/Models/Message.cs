namespace ChatApp.Api.Models;

public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string SenderId { get; set; }
    public required string ReceiverId { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
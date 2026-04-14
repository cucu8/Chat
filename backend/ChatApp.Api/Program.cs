using ChatApp.Api.Interfaces;
using ChatApp.Api.Services;
using ChatApp.Api.Hubs;
using ChatApp.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var configuration = new ConfigurationOptions
    {
        EndPoints = { { "redis-13174.c266.us-east-1-3.ec2.cloud.redislabs.com", 13174 } },
        Password = "gHaaxQQdsf9G7e1KcywsrlPyVSYiuQkw",
        User = "default",
        Ssl = false, // Cloud bağlantıları genelde SSL gerektirir
        AbortOnConnectFail = false, // Bağlantı başta başarısız olsa bile uygulama çökmesin, denemeye devam etsin
        ConnectTimeout = 10000, // Bağlantı süresini biraz uzatalım (10 saniye)
        SyncTimeout = 10000
    };

    return ConnectionMultiplexer.Connect(configuration);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddDbContext<ChatDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // frontend adresi
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // 🔥 SignalR için şart
    });
});

builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IAuthService, AuthService>();



var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "chatapp",
            ValidAudience = "chatapp",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };

        // 🔥 BURASI ÖNEMLİ
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseCors("CorsPolicy");
app.UseAuthorization();
app.UseHttpsRedirection();
app.MapControllers();
app.MapHub<ChatHub>("/chatHub");
app.Run();

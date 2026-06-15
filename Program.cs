using CustomerManagementAPI.Connector;
using CustomerManagementAPI.Data;
using CustomerManagementAPI.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.EnableAnnotations();
});

// Add CORS support for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularClient", policyBuilder =>
    {
        policyBuilder
            .SetIsOriginAllowed(origin =>
                origin.StartsWith("http://localhost"))
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerConnector, CustomerConnector>();
builder.Services.AddScoped<ICustomerContactConnector, CustomerContactConnector>();
builder.Services.AddScoped<ICustomerContactRepository, CustomerContactRepository>();

builder.Services.AddScoped<ICustomerBankDetailConnector, CustomerBankDetailConnector>();
builder.Services.AddScoped<ICustomerBankDetailRepository, CustomerBankDetailRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularClient");

app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();

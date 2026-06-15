using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace CustomerManagementAPI.Models;

public class CustomerContact
{
    [Key]
    public int ContactId { get; set; }
    public string PhoneNumber { get; set; }

    public string Email { get; set; }

    public string AddressLine1 { get; set; }

    public string City { get; set; }

    public string State { get; set; }

    public string Country { get; set; }

    public string PostalCode { get; set; }

    public int CustomerId { get; set; }

    [JsonIgnore]
    public Customer? Customer { get; set; }
}
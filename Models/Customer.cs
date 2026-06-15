namespace CustomerManagementAPI.Models;

public class Customer
{
    public int CustomerId { get; set; }

    public string FirstName { get; set; }

    public string MiddleName { get; set; }

    public string LastName { get; set; }


    public DateTime? DateOfBirth { get; set; }

    public string Gender { get; set; }

    public string Occupation { get; set; }

    public bool IsActive { get; set; }

    public string ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
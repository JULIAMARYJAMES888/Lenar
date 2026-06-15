using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace CustomerManagementAPI.Models;

public class CustomerBankDetail
{
    [Key]
    public int BankDetailId { get; set; }
    public string BankName { get; set; }

    public string AccountNumber { get; set; }

    public string IFSCCode { get; set; }

    public string BranchName { get; set; }

    public int CustomerId { get; set; }

    [JsonIgnore]
    public Customer? Customer { get; set; }
}

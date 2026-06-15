using CustomerManagementAPI.Data;
using CustomerManagementAPI.Models;
using System.Linq;

namespace CustomerManagementAPI.Repository
{
    public class CustomerBankDetailRepository
        : ICustomerBankDetailRepository
    {
        private readonly AppDbContext _context;

        public CustomerBankDetailRepository(AppDbContext context)
        {
            _context = context;
        }

        public void AddCustomerBankDetail(
            CustomerBankDetail customerBankDetail)
        {
            _context.CustomerBankDetails.Add(customerBankDetail);

            _context.SaveChanges();
        }

        public List<CustomerBankDetail> GetCustomerBankDetails()
        {
            return _context.CustomerBankDetails.ToList();
        }

        public CustomerBankDetail GetCustomerBankDetailById(int id)
        {
            return _context.CustomerBankDetails
                           .FirstOrDefault(x => x.BankDetailId == id);
        }

        public void UpdateCustomerBankDetail(
            int id,
            CustomerBankDetail customerBankDetail)
        {
            var existingBankDetail =
                _context.CustomerBankDetails
                        .FirstOrDefault(x => x.BankDetailId == id);

            if (existingBankDetail != null)
            {
                existingBankDetail.BankName =
                    customerBankDetail.BankName;

                existingBankDetail.AccountNumber =
                    customerBankDetail.AccountNumber;

                existingBankDetail.IFSCCode =
                    customerBankDetail.IFSCCode;

                existingBankDetail.BranchName =
                    customerBankDetail.BranchName;

                existingBankDetail.CustomerId =
                    customerBankDetail.CustomerId;

                _context.SaveChanges();
            }
        }

        public void DeleteCustomerBankDetail(int id)
        {
            var bankDetail =
                _context.CustomerBankDetails
                        .FirstOrDefault(x => x.BankDetailId == id);

            if (bankDetail != null)
            {
                _context.CustomerBankDetails.Remove(bankDetail);

                _context.SaveChanges();
            }
        }
    }
}
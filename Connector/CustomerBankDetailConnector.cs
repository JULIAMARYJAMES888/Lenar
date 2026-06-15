using CustomerManagementAPI.Models;
using CustomerManagementAPI.Repository;

namespace CustomerManagementAPI.Connector
{
    public class CustomerBankDetailConnector
        : ICustomerBankDetailConnector
    {
        private readonly ICustomerBankDetailRepository
            _customerBankDetailRepository;

        public CustomerBankDetailConnector(
            ICustomerBankDetailRepository customerBankDetailRepository)
        {
            _customerBankDetailRepository =
                customerBankDetailRepository;
        }

        public void AddCustomerBankDetail(
            CustomerBankDetail customerBankDetail)
        {
            _customerBankDetailRepository
                .AddCustomerBankDetail(customerBankDetail);
        }

        public List<CustomerBankDetail> GetCustomerBankDetails()
        {
            return _customerBankDetailRepository
                .GetCustomerBankDetails();
        }

        public CustomerBankDetail GetCustomerBankDetailById(int id)
        {
            return _customerBankDetailRepository
                .GetCustomerBankDetailById(id);
        }

        public void UpdateCustomerBankDetail(
            int id,
            CustomerBankDetail customerBankDetail)
        {
            _customerBankDetailRepository
                .UpdateCustomerBankDetail(id,
                                          customerBankDetail);
        }

        public void DeleteCustomerBankDetail(int id)
        {
            _customerBankDetailRepository
                .DeleteCustomerBankDetail(id);
        }
    }
}
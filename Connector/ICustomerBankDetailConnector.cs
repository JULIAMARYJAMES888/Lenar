using CustomerManagementAPI.Models;

namespace CustomerManagementAPI.Connector
{
    public interface ICustomerBankDetailConnector
    {
        void AddCustomerBankDetail(
            CustomerBankDetail customerBankDetail);

        List<CustomerBankDetail> GetCustomerBankDetails();

        CustomerBankDetail GetCustomerBankDetailById(int id);

        void UpdateCustomerBankDetail(
            int id,
            CustomerBankDetail customerBankDetail);

        void DeleteCustomerBankDetail(int id);
    }
}
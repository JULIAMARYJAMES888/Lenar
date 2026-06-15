using CustomerManagementAPI.Models;

namespace CustomerManagementAPI.Repository
{
    public interface ICustomerContactRepository
    {
        void AddCustomerContact(CustomerContact customerContact);

        List<CustomerContact> GetCustomerContacts();

        CustomerContact GetCustomerContactById(int id);

        void UpdateCustomerContact(int id, CustomerContact customerContact);

        void DeleteCustomerContact(int id);
    }
}
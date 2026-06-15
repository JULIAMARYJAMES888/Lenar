using CustomerManagementAPI.Models;

namespace CustomerManagementAPI.Connector
{
    

    public interface ICustomerConnector
    {
        void AddCustomer(Customer customer);

        List<Customer> GetCustomers();

        Customer GetCustomerById(int id);

        void UpdateCustomer(int id, Customer customer);

        void DeleteCustomer(int id);

        string UploadPhoto(int customerId, IFormFile file);
    }
}
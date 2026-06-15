using CustomerManagementAPI.Models;
using CustomerManagementAPI.Repository;

namespace CustomerManagementAPI.Connector
{
    public class CustomerContactConnector : ICustomerContactConnector
    {
        private readonly ICustomerContactRepository
            _customerContactRepository;

        public CustomerContactConnector(
            ICustomerContactRepository customerContactRepository)
        {
            _customerContactRepository = customerContactRepository;
        }

        public void AddCustomerContact(CustomerContact customerContact)
        {
            _customerContactRepository
                .AddCustomerContact(customerContact);
        }

        public List<CustomerContact> GetCustomerContacts()
        {
            return _customerContactRepository
                .GetCustomerContacts();
        }

        public CustomerContact GetCustomerContactById(int id)
        {
            return _customerContactRepository
                .GetCustomerContactById(id);
        }

        public void UpdateCustomerContact(
            int id,
            CustomerContact customerContact)
        {
            _customerContactRepository
                .UpdateCustomerContact(id, customerContact);
        }

        public void DeleteCustomerContact(int id)
        {
            _customerContactRepository
                .DeleteCustomerContact(id);
        }
    }
}
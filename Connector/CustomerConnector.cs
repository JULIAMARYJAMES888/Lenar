using CustomerManagementAPI.Models;
using CustomerManagementAPI.Repository;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;

namespace CustomerManagementAPI.Connector
{
    public class CustomerConnector : ICustomerConnector
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerConnector(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public void AddCustomer(Customer customer)
        {
            customer.CreatedAt = DateTime.Now;

            _customerRepository.AddCustomer(customer);
        }
        public List<Customer> GetCustomers()
        {
            return _customerRepository.GetCustomers();
        }
        public Customer GetCustomerById(int id)
        {
            return _customerRepository.GetCustomerById(id);
        }
        public void UpdateCustomer(int id, Customer customer)
        {
            _customerRepository.UpdateCustomer(id, customer);
        }
        public void DeleteCustomer(int id)
        {
            _customerRepository.DeleteCustomer(id);
        }
        public string UploadPhoto(int customerId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return "No file selected";
            }

            var allowedExtensions =
                new[] { ".jpg", ".jpeg", ".png" };

            var extension =
                Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                return "Only JPG, JPEG and PNG files are allowed";
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return "File size exceeds 5 MB";
            }

            var customer =
                _customerRepository.GetCustomerById(customerId);

            if (customer == null)
            {
                return "Customer not found";
            }

            return _customerRepository
                .UploadPhoto(customerId, file);
        }
    }
}
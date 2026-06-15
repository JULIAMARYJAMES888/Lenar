using CustomerManagementAPI.Data;
using CustomerManagementAPI.Models;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace CustomerManagementAPI.Repository
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public CustomerRepository(
            AppDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public void AddCustomer(Customer customer)
        {
            _context.Customers.Add(customer);
            _context.SaveChanges();
        }

        public List<Customer> GetCustomers()
        {
            return _context.Customers.ToList();
        }
        public Customer GetCustomerById(int id)
        {
            return _context.Customers.FirstOrDefault(x => x.CustomerId == id);
        }
        public void UpdateCustomer(int id, Customer customer)
        {
            var existingCustomer =
                _context.Customers.FirstOrDefault(x => x.CustomerId == id);

            if (existingCustomer != null)
            {
                existingCustomer.FirstName = customer.FirstName;
                existingCustomer.MiddleName = customer.MiddleName;
                existingCustomer.LastName = customer.LastName;
                existingCustomer.DateOfBirth = customer.DateOfBirth;
                existingCustomer.Gender = customer.Gender;
                existingCustomer.Occupation = customer.Occupation;
                existingCustomer.IsActive = customer.IsActive;
                existingCustomer.ImageUrl = customer.ImageUrl;
                existingCustomer.UpdatedAt = DateTime.Now;

                _context.SaveChanges();
            }
        }
        public void DeleteCustomer(int id)
        {
            var customer =
                _context.Customers.FirstOrDefault(x => x.CustomerId == id);

            if (customer != null)
            {
                _context.Customers.Remove(customer);

                _context.SaveChanges();
            }
        }
        public string UploadPhoto(int customerId, IFormFile file)
        {

            string uploadsFolder =
                Path.Combine(_environment.WebRootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string fileName =
                Guid.NewGuid().ToString() +
                Path.GetExtension(file.FileName);

            string filePath =
                Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            string imageUrl = "/uploads/" + fileName;

            var customer = _context.Customers
    .FirstOrDefault(x => x.CustomerId == customerId);

            if (customer != null)
            {
                customer.ImageUrl = imageUrl;
                customer.UpdatedAt = DateTime.Now;

                _context.SaveChanges();
            }

            return imageUrl;
        }
    }
}
using CustomerManagementAPI.Data;
using CustomerManagementAPI.Models;
using System.Linq;

namespace CustomerManagementAPI.Repository
{
    public class CustomerContactRepository : ICustomerContactRepository
    {
        private readonly AppDbContext _context;

        public CustomerContactRepository(AppDbContext context)
        {
            _context = context;
        }

        public void AddCustomerContact(CustomerContact customerContact)
        {
            _context.CustomerContacts.Add(customerContact);
            _context.SaveChanges();
        }

        public List<CustomerContact> GetCustomerContacts()
        {
            return _context.CustomerContacts.ToList();
        }

        public CustomerContact GetCustomerContactById(int id)
        {
            return _context.CustomerContacts
                           .FirstOrDefault(x => x.ContactId == id);
        }

        public void UpdateCustomerContact(int id,
                                          CustomerContact customerContact)
        {
            var existingContact =
                _context.CustomerContacts
                        .FirstOrDefault(x => x.ContactId == id);

            if (existingContact != null)
            {
                existingContact.PhoneNumber = customerContact.PhoneNumber;
                existingContact.Email = customerContact.Email;
                existingContact.AddressLine1 = customerContact.AddressLine1;
                existingContact.City = customerContact.City;
                existingContact.State = customerContact.State;
                existingContact.Country = customerContact.Country;
                existingContact.PostalCode = customerContact.PostalCode;
                existingContact.CustomerId = customerContact.CustomerId;

                _context.SaveChanges();
            }
        }

        public void DeleteCustomerContact(int id)
        {
            var contact =
                _context.CustomerContacts
                        .FirstOrDefault(x => x.ContactId == id);

            if (contact != null)
            {
                _context.CustomerContacts.Remove(contact);
                _context.SaveChanges();
            }
        }
    }
}
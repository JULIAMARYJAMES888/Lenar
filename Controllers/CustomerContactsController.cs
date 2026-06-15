using CustomerManagementAPI.Connector;
using CustomerManagementAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace CustomerManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerContactsController : ControllerBase
    {
        private readonly ICustomerContactConnector
            _customerContactConnector;

        public CustomerContactsController(
            ICustomerContactConnector customerContactConnector)
        {
            _customerContactConnector = customerContactConnector;
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Create Customer Contact")]
        public IActionResult AddCustomerContact(
            CustomerContact customerContact)
        {
            _customerContactConnector
                .AddCustomerContact(customerContact);

            return Ok("Customer Contact added successfully");
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Get All Customer Contacts")]
        public IActionResult GetCustomerContacts()
        {
            var contacts =
                _customerContactConnector
                    .GetCustomerContacts();

            return Ok(contacts);
        }

        [HttpGet("{id}")]
        [SwaggerOperation(Summary = "Get Customer Contact By Id")]
        public IActionResult GetCustomerContactById(int id)
        {
            var contact =
                _customerContactConnector
                    .GetCustomerContactById(id);

            return Ok(contact);
        }

        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "Update Customer Contact")]
        public IActionResult UpdateCustomerContact(
            int id,
            CustomerContact customerContact)
        {
            _customerContactConnector
                .UpdateCustomerContact(id, customerContact);

            return Ok("Customer Contact updated successfully");
        }

        [HttpDelete("{id}")]
        [SwaggerOperation(Summary = "Delete Customer Contact")]
        public IActionResult DeleteCustomerContact(int id)
        {
            _customerContactConnector
                .DeleteCustomerContact(id);

            return Ok("Customer Contact deleted successfully");
        }
    }
}
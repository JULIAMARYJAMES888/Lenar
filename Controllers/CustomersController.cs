using CustomerManagementAPI.Connector;
using CustomerManagementAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace CustomerManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerConnector _customerConnector;

        public CustomersController(ICustomerConnector customerConnector)
        {
            _customerConnector = customerConnector;
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Create Customer")]
        public IActionResult AddCustomer(Customer customer)
        {
            _customerConnector.AddCustomer(customer);

            return Ok("Customer added successfully");
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Get All Customers")]
        public IActionResult GetCustomers()
        {
            var customers = _customerConnector.GetCustomers();

            return Ok(customers);
        }

        [HttpGet("{id}")]
        [SwaggerOperation(Summary = "Get Customer By Id")]
        public IActionResult GetCustomerById(int id)
        {
            var customer = _customerConnector.GetCustomerById(id);

            return Ok(customer);
        }

        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "Update Customer")]
        public IActionResult UpdateCustomer(int id, Customer customer)
        {
            _customerConnector.UpdateCustomer(id, customer);

            return Ok("Customer updated successfully");
        }

        [HttpDelete("{id}")]
        [SwaggerOperation(Summary = "Delete Customer")]
        public IActionResult DeleteCustomer(int id)
        {
            _customerConnector.DeleteCustomer(id);

            return Ok("Customer deleted successfully");
        }

        [HttpPost("{id}/UploadPhoto")]
        [SwaggerOperation(Summary = "Upload Customer Photo")]
        public IActionResult UploadPhoto(
            int id,
            IFormFile file)
        {
            var imageUrl =
                _customerConnector.UploadPhoto(id, file);

            return Ok(imageUrl);
        }
    }
}
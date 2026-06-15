using CustomerManagementAPI.Connector;
using CustomerManagementAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace CustomerManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerBankDetailsController : ControllerBase
    {
        private readonly ICustomerBankDetailConnector
            _customerBankDetailConnector;

        public CustomerBankDetailsController(
            ICustomerBankDetailConnector customerBankDetailConnector)
        {
            _customerBankDetailConnector =
                customerBankDetailConnector;
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Create Customer Bank Detail")]
        public IActionResult AddCustomerBankDetail(
            CustomerBankDetail customerBankDetail)
        {
            _customerBankDetailConnector
                .AddCustomerBankDetail(customerBankDetail);

            return Ok("Customer Bank Detail added successfully");
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Get All Customer Bank Details")]
        public IActionResult GetCustomerBankDetails()
        {
            var bankDetails =
                _customerBankDetailConnector
                    .GetCustomerBankDetails();

            return Ok(bankDetails);
        }

        [HttpGet("{id}")]
        [SwaggerOperation(Summary = "Get Customer Bank Detail By Id")]
        public IActionResult GetCustomerBankDetailById(int id)
        {
            var bankDetail =
                _customerBankDetailConnector
                    .GetCustomerBankDetailById(id);

            return Ok(bankDetail);
        }

        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "Update Customer Bank Detail")]
        public IActionResult UpdateCustomerBankDetail(
            int id,
            CustomerBankDetail customerBankDetail)
        {
            _customerBankDetailConnector
                .UpdateCustomerBankDetail(
                    id,
                    customerBankDetail);

            return Ok("Customer Bank Detail updated successfully");
        }

        [HttpDelete("{id}")]
        [SwaggerOperation(Summary = "Delete Customer Bank Detail")]
        public IActionResult DeleteCustomerBankDetail(int id)
        {
            _customerBankDetailConnector
                .DeleteCustomerBankDetail(id);

            return Ok("Customer Bank Detail deleted successfully");
        }
    }
}
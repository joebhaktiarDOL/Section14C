﻿using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DOL.WHD.Section14c.Api.Filters;
using DOL.WHD.Section14c.Business;
using DOL.WHD.Section14c.Business.Validators;
using DOL.WHD.Section14c.Domain.Models.Identity;
using DOL.WHD.Section14c.Domain.Models.Submission;

namespace DOL.WHD.Section14c.Api.Controllers
{
    [AuthorizeHttps]
    [RoutePrefix("api/application")]
    public class ApplicationController : ApiController
    {
        private readonly IIdentityService _identityService;
        private readonly IApplicationService _applicationService;
        private readonly IApplicationSubmissionValidator _applicationSubmissionValidator;
        public ApplicationController(IIdentityService identityService, IApplicationService applicationService, IApplicationSubmissionValidator applicationSubmissionValidator)
        {
            _identityService = identityService;
            _applicationService = applicationService;
            _applicationSubmissionValidator = applicationSubmissionValidator;
        }

        [HttpPost]
        [AuthorizeClaims(ApplicationClaimTypes.SubmitApplication)]
        public async Task<HttpResponseMessage> Submit([FromBody]ApplicationSubmission submission)
        {
            var vm = _applicationService.CleanupModel(submission);
            var results = _applicationSubmissionValidator.Validate(vm);
            if (!results.IsValid)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, results.Errors);
            }

            // make sure user has rights to the EIN
            var hasEINClaim = _identityService.UserHasEINClaim(User, vm.EIN);
            if (!hasEINClaim)
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

            await _applicationService.SubmitApplicationAsync(vm);
            return Request.CreateResponse(HttpStatusCode.Created);
        }

        [AllowAnonymous]
        public HttpResponseMessage Options()
        {
            return new HttpResponseMessage { StatusCode = HttpStatusCode.OK };
        }
    }
}
﻿using System.Threading.Tasks;
using System.Web.Http;
using DOL.WHD.Section14c.Business;
using DOL.WHD.Section14c.Domain.ViewModels;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json.Linq;

namespace DOL.WHD.Section14c.Api.Controllers
{
    [Authorize]
    public class SaveController : ApiController
    {
        private readonly ISaveService _saveService;
        private readonly IIdentityService _identityService;

        public SaveController(ISaveService saveService, IIdentityService identityService)
        {
            _saveService = saveService;
            _identityService = identityService;
        }

        public IHttpActionResult GetSave(string EIN)
        {
            // make sure user has rights to the EIN
            var hasEINClaim = _identityService.UserHasEINClaim(User, EIN);
            if (!hasEINClaim)
            {
                return Unauthorized();
            }

            var json = _saveService.GetSave(User.Identity.GetUserId(), EIN);
            JObject jsonObj = JObject.Parse(json);

            return Ok(jsonObj);
        }

        public IHttpActionResult AddSave([FromBody]AddApplicationSave vm)
        {
            // make sure user has rights to the EIN
            var hasEINClaim = _identityService.UserHasEINClaim(User, vm.EIN);
            if (!hasEINClaim)
            {
                return Unauthorized();
            }

            _saveService.AddOrUpdate(User.Identity.GetUserId(), vm.EIN, vm.State.ToString());
            return Created($"/api/Save?userId={User.Identity.GetUserId()}&EIN={vm.EIN}", new { });
        }
    }
}
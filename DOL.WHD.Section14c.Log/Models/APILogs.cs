﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DOL.WHD.Section14c.Log.Models
{
    public class APILogs
    {
        public APILogs()
        {
            Id = Guid.NewGuid().ToString();
        }

        public string Id { get; set; }

        public string Messages { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Autodesk.Forge.Model.PostBucketsPayload;

namespace TestForgeApp.Models.dto
{
    public class BucketModel
    {
        public string bucketKey { get; set; }

        public PolicyKeyEnum policyKey { get; set; }
    }
}

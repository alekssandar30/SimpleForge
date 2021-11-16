using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestForgeApp.Models.dto
{
    public class UploadFile
    {
        public string bucketKey { get; set; }
        public IFormFile fileToUpload { get; set; }
    }
}

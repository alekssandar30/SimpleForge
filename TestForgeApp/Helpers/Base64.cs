using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestForgeApp.Helpers
{
    public class Base64
    {
        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
    }
}

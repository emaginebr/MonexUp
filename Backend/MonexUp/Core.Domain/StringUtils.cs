using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain
{
    public class StringUtils
    {
        public static string OnlyNumbers(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            var numeros = new StringBuilder();

            foreach (char c in input)
            {
                if (char.IsDigit(c))
                    numeros.Append(c);
            }

            return numeros.ToString();
        }
    }
}

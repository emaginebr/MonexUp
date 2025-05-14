using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace Core.Domain
{
    public class StringUtils
    {

        private const string BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

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

        public static string GenerateShortUniqueString()
        {
            Guid guid = Guid.NewGuid();
            byte[] bytes = guid.ToByteArray();
            BigInteger value = new BigInteger(bytes);

            // Remove sinal negativo se existir
            if (value.Sign < 0)
                value = BigInteger.Negate(value);

            StringBuilder sb = new StringBuilder();
            while (value > 0)
            {
                int remainder = (int)(value % 62);
                sb.Insert(0, BASE62_CHARS[remainder]);
                value /= 62;
            }

            return sb.ToString();
        }

    }
}

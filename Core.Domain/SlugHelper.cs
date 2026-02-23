using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Core.Domain
{
    public static class SlugHelper
    {
        public static string GerarSlug(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            // 1. Remove acentos
            var normalized = texto.Normalize(NormalizationForm.FormD);
            var semAcentos = new StringBuilder();
            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    semAcentos.Append(c);
            }

            var resultado = semAcentos.ToString().Normalize(NormalizationForm.FormC);

            // 2. Remove caracteres especiais
            resultado = Regex.Replace(resultado, @"[^a-zA-Z0-9\s-]", "");

            // 3. Substitui espaços e múltiplos hífens por um único hífen
            resultado = Regex.Replace(resultado, @"\s+", "-"); // espaços por hífen
            resultado = Regex.Replace(resultado, @"-+", "-");  // múltiplos hífens por um

            // 4. Converte para minúsculas
            return resultado.ToLowerInvariant().Trim('-');
        }
    }
}

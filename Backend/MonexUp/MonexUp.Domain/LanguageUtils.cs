using MonexUp.DTO.Template;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MonexUp.Domain
{
    public static class LanguageUtils
    {
        public static LanguageEnum StrToLang(string lang)
        {
            if (string.IsNullOrEmpty(lang))
            {
                return LanguageEnum.English;
            }
            switch (lang.ToLower())
            {
                case "fr": 
                    return LanguageEnum.French;
                case "br":
                    return LanguageEnum.Portuguese;
                case "pt":
                    return LanguageEnum.Portuguese;
                case "es":
                    return LanguageEnum.Spanish;
                default:
                    return LanguageEnum.English;
            }
        }
    }
}

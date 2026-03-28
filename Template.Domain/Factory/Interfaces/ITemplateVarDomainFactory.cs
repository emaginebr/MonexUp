using Template.Domain.Interfaces.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Template.Domain.Interfaces.Factory
{
    public interface ITemplateVarDomainFactory
    {
        ITemplateVarModel BuildTemplateVarModel();
    }
}

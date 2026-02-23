using System;
using MonexUp.Domain.Impl.Core;
using Microsoft.Extensions.Logging;

namespace MonexUp.Domain.Interfaces.Core
{
    public interface ILogCore
    {
        void Log(string message, Levels level);
    }
}

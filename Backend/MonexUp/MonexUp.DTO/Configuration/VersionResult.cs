using System;
using System.Text.Json.Serialization;
using MonexUp.DTO.Domain;

namespace MonexUp.DTO.Configuration
{
    public class VersionResult : StatusResult
    {
        [JsonPropertyName("version")]
        public string Version { get; set; }
    }
}

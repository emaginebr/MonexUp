using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MonexUp.DTO.User
{
    public class UserInfo
    {
        [JsonPropertyName("userId")]
        public long UserId { get; set; }
        [JsonPropertyName("slug")]
        public string Slug { get; set; }
        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("hash")]
        public string Hash { get; set; }
        [JsonPropertyName("isAdmin")]
        public bool IsAdmin { get; set; }
        [JsonPropertyName("birthDate")]
        public DateTime? BirthDate { get; set; }
        [JsonPropertyName("idDocument")]
        public string IdDocument { get; set; }
        [JsonPropertyName("pixKey")]
        public string PixKey { get; set; }
        [JsonPropertyName("password")]
        public string Password { get; set; }
        [JsonPropertyName("phones")]
        public IList<UserPhoneInfo> Phones { get; set; }
        [JsonPropertyName("addresses")]
        public IList<UserAddressInfo> Addresses { get; set; }
        [JsonPropertyName("createAt")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updateAt")]
        public DateTime UpdatedAt { get; set; }
    }
}

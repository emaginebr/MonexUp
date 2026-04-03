using Core.Domain;

namespace MonexUp.UnitTests.Utils
{
    public class EmailValidatorTests
    {
        [Theory]
        [InlineData("user@example.com", true)]
        [InlineData("user@sub.domain.com", true)]
        [InlineData("user+tag@example.com", true)]
        [InlineData("user.name@example.com", true)]
        public void IsValidEmail_WithValidEmails_ShouldReturnTrue(string email, bool expected)
        {
            var result = EmailValidator.IsValidEmail(email);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData("notanemail", false)]
        [InlineData("@example.com", false)]
        [InlineData("user@", false)]
        [InlineData("user @example.com", false)]
        [InlineData("user@@example.com", false)]
        [InlineData("user@example", false)]
        public void IsValidEmail_WithInvalidEmails_ShouldReturnFalse(string email, bool expected)
        {
            var result = EmailValidator.IsValidEmail(email);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void IsValidEmail_WithNullOrWhitespace_ShouldReturnFalse(string? email)
        {
            var result = EmailValidator.IsValidEmail(email!);
            Assert.False(result);
        }
    }
}

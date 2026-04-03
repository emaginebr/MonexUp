using Core.Domain;

namespace MonexUp.UnitTests.Utils
{
    public class StringUtilsTests
    {
        [Theory]
        [InlineData("abc123def456", "123456")]
        [InlineData("12345", "12345")]
        [InlineData("abcdef", "")]
        [InlineData("!@#$%1^&*2", "12")]
        [InlineData("", "")]
        public void OnlyNumbers_ShouldExtractDigitsOnly(string input, string expected)
        {
            var result = StringUtils.OnlyNumbers(input);
            Assert.Equal(expected, result);
        }

        [Fact]
        public void OnlyNumbers_WithNull_ShouldReturnEmpty()
        {
            var result = StringUtils.OnlyNumbers(null!);
            Assert.Equal(string.Empty, result);
        }

        [Fact]
        public void GenerateShortUniqueString_ShouldReturnNonEmptyString()
        {
            var result = StringUtils.GenerateShortUniqueString();
            Assert.False(string.IsNullOrEmpty(result));
        }

        [Fact]
        public void GenerateShortUniqueString_ShouldBeUnique()
        {
            var results = Enumerable.Range(0, 100)
                .Select(_ => StringUtils.GenerateShortUniqueString())
                .ToList();
            Assert.Equal(results.Count, results.Distinct().Count());
        }

        [Fact]
        public void GenerateShortUniqueString_ShouldOnlyContainBase62Chars()
        {
            var result = StringUtils.GenerateShortUniqueString();
            Assert.Matches(@"^[0-9A-Za-z]+$", result);
        }
    }
}

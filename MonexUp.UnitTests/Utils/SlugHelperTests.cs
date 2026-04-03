using Core.Domain;

namespace MonexUp.UnitTests.Utils
{
    public class SlugHelperTests
    {
        [Theory]
        [InlineData("São Paulo 2024", "sao-paulo-2024")]
        [InlineData("Café com Leite", "cafe-com-leite")]
        [InlineData("Hello World", "hello-world")]
        [InlineData("UPPER CASE", "upper-case")]
        [InlineData("multiple   spaces", "multiple-spaces")]
        [InlineData("special!@#chars", "specialchars")]
        [InlineData("already-slugged", "already-slugged")]
        [InlineData("  leading trailing  ", "leading-trailing")]
        [InlineData("---hyphens---", "hyphens")]
        public void GerarSlug_ShouldGenerateCorrectSlug(string texto, string expected)
        {
            var result = SlugHelper.GerarSlug(texto);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void GerarSlug_WithNullOrWhitespace_ShouldReturnEmpty(string? texto)
        {
            var result = SlugHelper.GerarSlug(texto!);
            Assert.Equal(string.Empty, result);
        }

        [Fact]
        public void GerarSlug_ShouldReturnLowercase()
        {
            var result = SlugHelper.GerarSlug("TeSt CaSe");
            Assert.Equal(result, result.ToLowerInvariant());
        }

        [Fact]
        public void GerarSlug_ShouldNotContainSpecialChars()
        {
            var result = SlugHelper.GerarSlug("Test@#$%^&*()!");
            Assert.DoesNotMatch(@"[^a-z0-9\-]", result);
        }
    }
}

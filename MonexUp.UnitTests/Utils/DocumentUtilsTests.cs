using Core.Domain;

namespace MonexUp.UnitTests.Utils
{
    public class DocumentUtilsTests
    {
        [Theory]
        [InlineData("52998224725", true)]
        [InlineData("529.982.247-25", true)]
        [InlineData("52998224720", false)]
        [InlineData("1234567", false)]
        [InlineData("11111111111", false)]
        [InlineData("00000000000", false)]
        public void ValidarCpfOuCnpj_WithCpf_ShouldValidateCorrectly(string documento, bool expected)
        {
            var result = DocumentoUtils.ValidarCpfOuCnpj(documento);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData("11222333000181", true)]
        [InlineData("11.222.333/0001-81", true)]
        [InlineData("11222333000180", false)]
        [InlineData("11111111111111", false)]
        public void ValidarCpfOuCnpj_WithCnpj_ShouldValidateCorrectly(string documento, bool expected)
        {
            var result = DocumentoUtils.ValidarCpfOuCnpj(documento);
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("abc")]
        public void ValidarCpfOuCnpj_WithInvalidInput_ShouldReturnFalse(string? documento)
        {
            var result = DocumentoUtils.ValidarCpfOuCnpj(documento!);
            Assert.False(result);
        }
    }
}

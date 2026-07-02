namespace MonexUp.DTO.Network
{
    /// <summary>
    /// Write-only request to set the AbacatePay API key on a network's ProxyPay store.
    /// </summary>
    public class AbacatePayApiKeyRequest
    {
        public string ApiKey { get; set; }
    }
}

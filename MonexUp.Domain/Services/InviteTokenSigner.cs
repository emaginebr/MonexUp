using Microsoft.Extensions.Configuration;
using MonexUp.Domain.Interfaces.Services;
using System;
using System.Security.Cryptography;
using System.Text;

namespace MonexUp.Domain.Impl.Services
{
    /// <summary>
    /// HMAC-SHA256 signer for stateless invite links. Token format:
    /// <c>base64url(payload) + "." + base64url(HMAC-SHA256(secret, payload))</c>
    /// where <c>payload = "networkId|inviterUserId|targetUserId|hasAccount"</c>.
    /// Verification uses a constant-time comparison. Mirrors the HMAC pattern
    /// used by BillingService, lifted into a reusable helper.
    /// </summary>
    public class InviteTokenSigner : IInviteTokenSigner
    {
        private readonly string _secret;

        public InviteTokenSigner(IConfiguration configuration)
        {
            _secret = configuration["Invite:Secret"];
            if (string.IsNullOrWhiteSpace(_secret))
            {
                throw new InvalidOperationException("Invite:Secret is not configured.");
            }
        }

        public string Sign(long networkId, long inviterUserId, long targetUserId, bool hasAccount)
        {
            var payload = BuildPayload(networkId, inviterUserId, targetUserId, hasAccount);
            var signature = ComputeHmac(payload);
            return $"{Base64UrlEncode(Encoding.UTF8.GetBytes(payload))}.{Base64UrlEncode(signature)}";
        }

        public bool TryVerify(string token, out InviteTokenPayload payload)
        {
            payload = null;
            if (string.IsNullOrWhiteSpace(token))
            {
                return false;
            }

            var parts = token.Split('.');
            if (parts.Length != 2)
            {
                return false;
            }

            byte[] payloadBytes;
            byte[] providedSignature;
            try
            {
                payloadBytes = Base64UrlDecode(parts[0]);
                providedSignature = Base64UrlDecode(parts[1]);
            }
            catch (FormatException)
            {
                return false;
            }

            var payloadText = Encoding.UTF8.GetString(payloadBytes);
            var expectedSignature = ComputeHmac(payloadText);

            if (!CryptographicOperations.FixedTimeEquals(providedSignature, expectedSignature))
            {
                return false;
            }

            var segments = payloadText.Split('|');
            if (segments.Length != 4
                || !long.TryParse(segments[0], out var networkId)
                || !long.TryParse(segments[1], out var inviterUserId)
                || !long.TryParse(segments[2], out var targetUserId)
                || !int.TryParse(segments[3], out var hasAccountFlag))
            {
                return false;
            }

            payload = new InviteTokenPayload
            {
                NetworkId = networkId,
                InviterUserId = inviterUserId,
                TargetUserId = targetUserId,
                HasAccount = hasAccountFlag == 1
            };
            return true;
        }

        private static string BuildPayload(long networkId, long inviterUserId, long targetUserId, bool hasAccount)
            => $"{networkId}|{inviterUserId}|{targetUserId}|{(hasAccount ? 1 : 0)}";

        private byte[] ComputeHmac(string payload)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secret));
            return hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        }

        private static string Base64UrlEncode(byte[] bytes)
            => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        private static byte[] Base64UrlDecode(string value)
        {
            var padded = value.Replace('-', '+').Replace('_', '/');
            switch (padded.Length % 4)
            {
                case 2: padded += "=="; break;
                case 3: padded += "="; break;
            }
            return Convert.FromBase64String(padded);
        }
    }
}

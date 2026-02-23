using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.MailerSend;
using System;
using System.Linq;
using System.Threading.Tasks;
using zTools.ACL.Interfaces;

namespace MonexUp.Domain.Impl.Services
{
    public class MailerSendService : IMailerSendService
    {
        private readonly string _mailSender;
        private readonly IMailClient _mailClient;

        public MailerSendService(
            IMailClient mailClient,
            Microsoft.Extensions.Configuration.IConfiguration configuration
        )
        {
            _mailClient = mailClient;
            _mailSender = configuration["MAILERSEND_SENDER"]
                ?? throw new InvalidOperationException("MAILERSEND_SENDER is not configured.");
        }

        public async Task<bool> Sendmail(MailerInfo email)
        {
            email.From.Email = _mailSender;

            var zToolsEmail = new zTools.DTO.MailerSend.MailerInfo
            {
                From = new zTools.DTO.MailerSend.MailerRecipientInfo
                {
                    Email = email.From.Email,
                    Name = email.From.Name
                },
                To = email.To.Select(t => new zTools.DTO.MailerSend.MailerRecipientInfo
                {
                    Email = t.Email,
                    Name = t.Name
                }).ToList(),
                Subject = email.Subject,
                Text = email.Text,
                Html = email.Html
            };

            await _mailClient.SendmailAsync(zToolsEmail);
            return true;
        }
    }
}

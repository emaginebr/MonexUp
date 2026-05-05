using System.Threading;
using System.Threading.Tasks;

namespace MonexUp.Domain.Interfaces.Services
{
    public interface IBillingReconciliationService
    {
        Task<ReconciliationOutcome> ReconcileAsync(CancellationToken ct = default);
    }

    public class ReconciliationOutcome
    {
        public int NetworksScanned { get; set; }
        public int InvoicesProcessed { get; set; }
        public int FeesRecorded { get; set; }
        public int FeesReversed { get; set; }
        public int Errors { get; set; }
    }
}

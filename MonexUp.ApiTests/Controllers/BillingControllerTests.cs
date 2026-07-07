using FluentAssertions;
using Flurl.Http;
using MonexUp.ApiTests.Fixtures;
using MonexUp.ApiTests.Helpers;
using MonexUp.DTO.Invoice;
using MonexUp.DTO.Network;

namespace MonexUp.ApiTests.Controllers
{
    /// <summary>
    /// Integration tests for the Commission Ledger read endpoints (feature 011 T008):
    /// GET /billing/my-balance/{networkId}, GET /billing/network-balance/{networkId},
    /// and the hardened POST /billing/searchStatement scoping. The pre-existing
    /// /billing auth smoke tests live in InvoiceControllerTests; this class targets the
    /// new balance endpoints and the server-side scoping guarantee (SC-005 / FR-007).
    /// </summary>
    [Collection("ApiTests")]
    public class BillingControllerTests
    {
        private readonly ApiTestFixture _fixture;

        public BillingControllerTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        private async Task<NetworkInfo> CreateNetworkAsync()
        {
            var payload = TestDataHelper.CreateNetworkInsertInfo();
            var response = await _fixture.CreateAuthenticatedRequest("/network/insert")
                .AllowAnyHttpStatus()
                .PostJsonAsync(payload);

            response.StatusCode.Should().Be(200, "network must be created; the creator becomes its NetworkManager");
            return await response.GetJsonAsync<NetworkInfo>();
        }

        // ---- Auth: no session → 401 ----

        [Fact]
        public async Task MyBalance_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/billing/my-balance/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task NetworkBalance_WithoutAuth_ShouldReturn401()
        {
            var response = await _fixture.CreateAnonymousRequest("/billing/network-balance/1")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(401);
        }

        [Fact]
        public async Task SearchStatement_WithoutAuth_ShouldReturn401()
        {
            var param = new StatementSearchParam { NetworkId = 1, PageNum = 1 };

            var response = await _fixture.CreateAnonymousRequest("/billing/searchStatement")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(401);
        }

        // ---- my-balance: authenticated member gets a MemberBalanceInfo shape ----

        [Fact]
        public async Task MyBalance_WithAuth_ShouldReturnOkWithMemberBalanceShape()
        {
            var network = await CreateNetworkAsync();

            var response = await _fixture.CreateAuthenticatedRequest($"/billing/my-balance/{network.NetworkId}")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200, "my-balance is session-scoped and returns zeros when the member has no commissions");

            var balance = await response.GetJsonAsync<MemberBalanceInfo>();
            balance.Should().NotBeNull();
            balance.Total.Should().BeGreaterThanOrEqualTo(0);
            balance.Released.Should().BeGreaterThanOrEqualTo(0);
            balance.Maturing.Should().BeGreaterThanOrEqualTo(0);
            // maturing = total - released (holds for a freshly created network: all zeros).
            balance.Maturing.Should().BeApproximately(balance.Total - balance.Released, 0.001);
        }

        // ---- network-balance: manager gets 200, non-manager gets 403 ----

        [Fact]
        public async Task NetworkBalance_AsManagerOfNetwork_ShouldReturnOk()
        {
            var network = await CreateNetworkAsync();

            var response = await _fixture.CreateAuthenticatedRequest($"/billing/network-balance/{network.NetworkId}")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(200, "the creator is the NetworkManager of the network they just created");

            var balance = await response.GetJsonAsync<MemberBalanceInfo>();
            balance.Should().NotBeNull();
            balance.Total.Should().BeGreaterThanOrEqualTo(0);
        }

        [Fact]
        public async Task NetworkBalance_WhenCallerDoesNotManageNetwork_ShouldReturn403()
        {
            // Very large, non-existent/foreign networkId: the caller has no UserNetwork
            // row for it, so the manager gate rejects with 403.
            var response = await _fixture.CreateAuthenticatedRequest("/billing/network-balance/999999999")
                .AllowAnyHttpStatus()
                .GetAsync();

            response.StatusCode.Should().Be(403, "network-balance is restricted to the network's manager");
        }

        // ---- searchStatement: authenticated returns a paged list ----

        [Fact]
        public async Task SearchStatement_WithAuth_ShouldReturnOkAndPagedList()
        {
            var network = await CreateNetworkAsync();
            var param = new StatementSearchParam { NetworkId = network.NetworkId, PageNum = 1 };

            var response = await _fixture.CreateAuthenticatedRequest("/billing/searchStatement")
                .AllowAnyHttpStatus()
                .PostJsonAsync(param);

            response.StatusCode.Should().Be(200);

            var result = await response.GetJsonAsync<StatementListPagedResult>();
            result.Should().NotBeNull();
            result.PageNum.Should().Be(1);
            result.Statements.Should().NotBeNull("the paged result always carries a (possibly empty) statement list");
        }

        [Fact]
        public async Task SearchStatement_ClientSuppliedUserId_MustNotChangeOwnScopedResults()
        {
            var network = await CreateNetworkAsync();

            // Same query, once without a userId and once spoofing another user's id.
            // The endpoint forces server-side scoping (member → own rows / manager →
            // own-cut) and ignores any client userId, so both responses must match.
            var ownParam = new StatementSearchParam { NetworkId = network.NetworkId, PageNum = 1, UserId = null };
            var spoofParam = new StatementSearchParam { NetworkId = network.NetworkId, PageNum = 1, UserId = 999999999 };

            var ownResponse = await _fixture.CreateAuthenticatedRequest("/billing/searchStatement")
                .AllowAnyHttpStatus().PostJsonAsync(ownParam);
            var spoofResponse = await _fixture.CreateAuthenticatedRequest("/billing/searchStatement")
                .AllowAnyHttpStatus().PostJsonAsync(spoofParam);

            ownResponse.StatusCode.Should().Be(200);
            spoofResponse.StatusCode.Should().Be(200);

            var own = await ownResponse.GetJsonAsync<StatementListPagedResult>();
            var spoof = await spoofResponse.GetJsonAsync<StatementListPagedResult>();

            // A client-supplied userId must not widen or change the caller's own-scoped
            // result set (no cross-member leak — SC-005 / FR-007).
            spoof.PageCount.Should().Be(own.PageCount, "client userId is ignored — result scope is session-derived");
            spoof.Statements.Count.Should().Be(own.Statements.Count, "spoofing another userId must not change the caller's rows");
        }
    }
}

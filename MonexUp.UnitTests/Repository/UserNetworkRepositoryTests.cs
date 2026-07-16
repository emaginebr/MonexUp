using DB.Infra.Context;
using DB.Infra.Repository;
using Microsoft.EntityFrameworkCore;
using Moq;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.DTO.User;

namespace MonexUp.UnitTests.Repository
{
    /// <summary>
    /// Repository-level coverage for ListByNetwork status filtering.
    /// includeAllStatuses=true (authenticated caller) must return every status —
    /// including WaitForApproval (2) — so users who just joined via invite are
    /// visible; includeAllStatuses=false (anonymous) must return only Active (1).
    /// Exercised against an in-memory MonexUpContext to assert the real LINQ filter.
    /// </summary>
    public class UserNetworkRepositoryTests
    {
        private static MonexUpContext NewContext()
        {
            var options = new DbContextOptionsBuilder<MonexUpContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new MonexUpContext(options);
        }

        private static UserNetwork Row(long userId, long networkId, UserNetworkStatusEnum status)
        {
            return new UserNetwork
            {
                UserId = userId,
                NetworkId = networkId,
                Status = (int)status,
                Role = (int)UserRoleEnum.Seller
            };
        }

        private static MonexUpContext SeededContext(params UserNetwork[] rows)
        {
            var ctx = NewContext();
            ctx.UserNetworks.AddRange(rows);
            ctx.SaveChanges();
            return ctx;
        }

        // A factory whose BuildUserNetworkModel() returns a fresh property-bag model
        // per call, so DbToModel maps each row into its own instance.
        private static IUserNetworkDomainFactory FactoryStub()
        {
            var factory = new Mock<IUserNetworkDomainFactory>();
            factory.Setup(f => f.BuildUserNetworkModel()).Returns(() =>
            {
                var m = new Mock<IUserNetworkModel>();
                m.SetupAllProperties();
                return m.Object;
            });
            return factory.Object;
        }

        [Fact]
        public void ListByNetwork_IncludeAllStatuses_ReturnsEveryStatus()
        {
            const long networkId = 4;
            using var ctx = SeededContext(
                Row(11, networkId, UserNetworkStatusEnum.Active),
                Row(12, networkId, UserNetworkStatusEnum.WaitForApproval),
                Row(13, networkId, UserNetworkStatusEnum.Inactive),
                Row(14, networkId, UserNetworkStatusEnum.Blocked),
                Row(99, networkId: 999, UserNetworkStatusEnum.Active)); // other network — excluded
            var repo = new UserNetworkRepository(ctx);
            var factory = FactoryStub();

            var result = repo.ListByNetwork(networkId, includeAllStatuses: true, factory).ToList();

            Assert.Equal(4, result.Count);
            Assert.Contains(result, r => r.UserId == 12 && r.Status == UserNetworkStatusEnum.WaitForApproval);
            Assert.DoesNotContain(result, r => r.NetworkId == 999);
        }

        [Fact]
        public void ListByNetwork_ActiveOnly_ReturnsOnlyActive()
        {
            const long networkId = 4;
            using var ctx = SeededContext(
                Row(11, networkId, UserNetworkStatusEnum.Active),
                Row(12, networkId, UserNetworkStatusEnum.WaitForApproval),
                Row(13, networkId, UserNetworkStatusEnum.Inactive),
                Row(14, networkId, UserNetworkStatusEnum.Blocked));
            var repo = new UserNetworkRepository(ctx);
            var factory = FactoryStub();

            var result = repo.ListByNetwork(networkId, includeAllStatuses: false, factory).ToList();

            Assert.Single(result);
            Assert.Equal(11, result[0].UserId);
            Assert.Equal(UserNetworkStatusEnum.Active, result[0].Status);
        }
    }
}

using Microsoft.Extensions.Logging;
using Moq;
using MonexUp.Domain.Impl.Services;
using MonexUp.Domain.Interfaces.Factory;
using MonexUp.Domain.Interfaces.Models;
using MonexUp.Domain.Interfaces.Services;
using MonexUp.DTO.User;
using NAuth.ACL.Interfaces;
using zTools.ACL.Interfaces;

namespace MonexUp.UnitTests.Services
{
    /// <summary>
    /// Tests for the hierarchy-tree logic on NetworkService.BuildHierarchy (feature 010):
    /// bounded 3-up / 3-down traversal off UserNetwork.ReferrerId, all statuses,
    /// cycle-safe, with memoized Name / ProfileName resolution.
    /// </summary>
    public class NetworkServiceHierarchyTests
    {
        private const long NetworkId = 1;
        private const string Token = "bearer-token";

        private readonly Mock<IUserClient> _userClient = new();
        private readonly Mock<INetworkDomainFactory> _networkFactory = new();
        private readonly Mock<IUserNetworkDomainFactory> _userNetworkFactory = new();
        private readonly Mock<IUserProfileDomainFactory> _userProfileFactory = new();
        private readonly Mock<IProfileService> _profileService = new();
        private readonly Mock<IFileClient> _fileClient = new();
        private readonly Mock<IInviteTokenSigner> _inviteTokenSigner = new();
        private readonly NetworkService _service;

        // Membership lookups keyed by userId (drives IUserNetworkModel.Get).
        private readonly Dictionary<long, IUserNetworkModel> _members = new();
        // Referral lookups keyed by referrer userId (drives IUserNetworkModel.GetByReferrer).
        private readonly Dictionary<long, IList<IUserNetworkModel>> _children = new();
        // Profile lookups keyed by profileId (drives IUserProfileModel.GetById).
        private readonly Dictionary<long, IUserProfileModel> _profiles = new();

        public NetworkServiceHierarchyTests()
        {
            _service = new NetworkService(
                _userClient.Object,
                _networkFactory.Object,
                _userNetworkFactory.Object,
                _userProfileFactory.Object,
                _profileService.Object,
                _fileClient.Object,
                _inviteTokenSigner.Object,
                new Mock<ILogger<NetworkService>>().Object
            );

            // Single UserNetwork "builder" returned by the factory (mirrors existing tests).
            // Get / GetByReferrer resolve against the in-memory maps below.
            var userNetworkBuilder = new Mock<IUserNetworkModel>();
            userNetworkBuilder
                .Setup(m => m.Get(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<IUserNetworkDomainFactory>()))
                .Returns((long _, long uid, IUserNetworkDomainFactory __) =>
                    _members.TryGetValue(uid, out var member) ? member : null!);
            userNetworkBuilder
                .Setup(m => m.GetByReferrer(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<IUserNetworkDomainFactory>()))
                .Returns((long _, long referrerId, IUserNetworkDomainFactory __) =>
                    _children.TryGetValue(referrerId, out var list) ? list : new List<IUserNetworkModel>());
            _userNetworkFactory.Setup(f => f.BuildUserNetworkModel()).Returns(userNetworkBuilder.Object);

            // Profile builder resolves names against the profile map (null when absent).
            var profileBuilder = new Mock<IUserProfileModel>();
            profileBuilder
                .Setup(m => m.GetById(It.IsAny<long>(), It.IsAny<IUserProfileDomainFactory>()))
                .Returns((long profileId, IUserProfileDomainFactory __) =>
                    _profiles.TryGetValue(profileId, out var profile) ? profile : null!);
            _userProfileFactory.Setup(f => f.BuildUserProfileModel()).Returns(profileBuilder.Object);

            // Default: NAuth resolves no user — awaiting must not NRE. Overridden per test.
            _userClient
                .Setup(c => c.GetByIdAsync(It.IsAny<long>(), It.IsAny<string>()))
                .ReturnsAsync((NAuth.DTO.User.UserInfo)null!);
        }

        // ---- setup helpers --------------------------------------------------------

        /// <summary>Registers a membership (drives Get) with the given wiring.</summary>
        private void Member(long userId, long? referrerId,
            UserRoleEnum role = UserRoleEnum.Seller,
            UserNetworkStatusEnum status = UserNetworkStatusEnum.Active,
            long? profileId = null)
        {
            var m = new Mock<IUserNetworkModel>();
            m.SetupGet(x => x.UserId).Returns(userId);
            m.SetupGet(x => x.NetworkId).Returns(NetworkId);
            m.SetupGet(x => x.ReferrerId).Returns(referrerId);
            m.SetupGet(x => x.Role).Returns(role);
            m.SetupGet(x => x.Status).Returns(status);
            m.SetupGet(x => x.ProfileId).Returns(profileId);
            _members[userId] = m.Object;
        }

        /// <summary>Registers <paramref name="childUserIds"/> as direct referrals of <paramref name="referrerId"/>.</summary>
        private void Referrals(long referrerId, params long[] childUserIds)
        {
            _children[referrerId] = childUserIds
                .Select(id => _members[id])
                .ToList();
        }

        private void ProfileName(long profileId, string name)
        {
            var p = new Mock<IUserProfileModel>();
            p.SetupGet(x => x.Name).Returns(name);
            _profiles[profileId] = p.Object;
        }

        private void ResolvesName(long userId, string name)
        {
            _userClient
                .Setup(c => c.GetByIdAsync(userId, Token))
                .ReturnsAsync(new NAuth.DTO.User.UserInfo { UserId = userId, Name = name });
        }

        /// <summary>Flattens a node and all its nested descendants (self included).</summary>
        private static IEnumerable<HierarchyNodeInfoWalk> Flatten(
            IEnumerable<MonexUp.DTO.Network.HierarchyNodeInfo> nodes)
        {
            foreach (var n in nodes)
            {
                yield return new HierarchyNodeInfoWalk(n);
                foreach (var c in Flatten(n.Children))
                {
                    yield return c;
                }
            }
        }

        private readonly record struct HierarchyNodeInfoWalk(MonexUp.DTO.Network.HierarchyNodeInfo Node);

        // ---- test cases -----------------------------------------------------------

        [Fact]
        public async Task BuildHierarchy_WithDeepChain_ShouldCapAncestorsAtThreeAndStopDescentAtDepthThree()
        {
            // Arrange
            // Ancestors: current(10) -> A(20) -> B(30) -> C(40) -> D(50). Only A,B,C expected.
            Member(10, referrerId: 20);
            Member(20, referrerId: 30);
            Member(30, referrerId: 40);
            Member(40, referrerId: 50);
            Member(50, referrerId: null);

            // Descendants: current(10) -> c1(101) -> c2(102) -> c3(103) -> c4(104). c4 must be excluded.
            Member(101, referrerId: 10);
            Member(102, referrerId: 101);
            Member(103, referrerId: 102);
            Member(104, referrerId: 103);
            Referrals(10, 101);
            Referrals(101, 102);
            Referrals(102, 103);
            Referrals(103, 104);

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 10, Token);

            // Assert — ancestors capped at 3, immediate referrer first.
            Assert.NotNull(result);
            Assert.Equal(3, result.Ancestors.Count);
            Assert.Equal(20, result.Ancestors[0].UserId);
            Assert.Equal(30, result.Ancestors[1].UserId);
            Assert.Equal(40, result.Ancestors[2].UserId);

            // Descendants nest exactly 3 levels deep; the 4th level is dropped.
            var lvl1 = Assert.Single(result.Descendants);
            Assert.Equal(101, lvl1.UserId);
            var lvl2 = Assert.Single(lvl1.Children);
            Assert.Equal(102, lvl2.UserId);
            var lvl3 = Assert.Single(lvl2.Children);
            Assert.Equal(103, lvl3.UserId);
            Assert.Empty(lvl3.Children); // depth-3 leaf — no 4th level (104 absent)

            Assert.DoesNotContain(Flatten(result.Descendants), w => w.Node.UserId == 104);
        }

        [Fact]
        public async Task BuildHierarchy_WithNullReferrer_ShouldReturnEmptyAncestorsAndPopulatedCurrent()
        {
            // Arrange
            Member(10, referrerId: null, role: UserRoleEnum.NetworkManager);

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 10, Token);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result.Ancestors);
            Assert.NotNull(result.Current);
            Assert.Equal(10, result.Current.UserId);
            Assert.Equal(UserRoleEnum.NetworkManager, result.Current.Role);
        }

        [Fact]
        public async Task BuildHierarchy_WithNoReferrals_ShouldReturnEmptyDescendants()
        {
            // Arrange — member exists but referred nobody (GetByReferrer returns empty).
            Member(10, referrerId: null);

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 10, Token);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result.Descendants);
        }

        [Theory]
        [InlineData(UserNetworkStatusEnum.WaitForApproval)]
        [InlineData(UserNetworkStatusEnum.Inactive)]
        [InlineData(UserNetworkStatusEnum.Blocked)]
        public async Task BuildHierarchy_WithNonActiveDescendant_ShouldIncludeItAndPreserveStatus(
            UserNetworkStatusEnum status)
        {
            // Arrange
            Member(10, referrerId: null);
            Member(101, referrerId: 10, status: status);
            Referrals(10, 101);

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 10, Token);

            // Assert
            var child = Assert.Single(result!.Descendants);
            Assert.Equal(101, child.UserId);
            Assert.Equal(status, child.Status);
        }

        [Fact]
        public async Task BuildHierarchy_WithReferrerCycle_ShouldTerminateWithoutDuplicateOrOverflow()
        {
            // Arrange — A(10) <-> B(20): A referred by B, B referred by A.
            Member(10, referrerId: 20);
            Member(20, referrerId: 10);
            Referrals(10, 20); // A also "referred" B down-tree, closing the loop.
            Referrals(20, 10);

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 10, Token);

            // Assert — traversal terminates; ancestors bounded, B appears once, no re-expansion.
            Assert.NotNull(result);
            Assert.True(result.Ancestors.Count <= 3);
            var ancestor = Assert.Single(result.Ancestors);
            Assert.Equal(20, ancestor.UserId);

            // B is already visited as an ancestor, so it must not reappear in the down-tree,
            // and the current user (10) is never re-expanded as its own descendant.
            var descendantIds = Flatten(result.Descendants).Select(w => w.Node.UserId).ToList();
            Assert.DoesNotContain(20L, descendantIds);
            Assert.DoesNotContain(10L, descendantIds);
        }

        [Fact]
        public async Task BuildHierarchy_WhenCallerNotMember_ShouldReturnNull()
        {
            // Arrange — no membership registered for the caller (Get returns null).

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 999, Token);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task BuildHierarchy_ShouldCarryRoleAndStatus_AndMapOrNullifyNameAndProfile()
        {
            // Arrange
            // Current: named user + resolvable profile.
            Member(10, referrerId: null, role: UserRoleEnum.NetworkManager,
                status: UserNetworkStatusEnum.Active, profileId: 500);
            ProfileName(500, "Gerente");
            ResolvesName(10, "Alice");

            // Descendant: NAuth returns null (name) and profile lookup returns null (profile name).
            Member(101, referrerId: 10, role: UserRoleEnum.Seller,
                status: UserNetworkStatusEnum.WaitForApproval, profileId: 999);
            Referrals(10, 101);
            // No ResolvesName(101, ...) and no ProfileName(999, ...) → both resolve to null.

            // Act
            var result = await _service.BuildHierarchy(NetworkId, 10, Token);

            // Assert — current node maps name + profile and carries role/status.
            Assert.NotNull(result);
            Assert.Equal("Alice", result.Current.Name);
            Assert.Equal("Gerente", result.Current.ProfileName);
            Assert.Equal(UserRoleEnum.NetworkManager, result.Current.Role);
            Assert.Equal(UserNetworkStatusEnum.Active, result.Current.Status);

            // Descendant node still carries role/status; name/profile degrade to null.
            var child = Assert.Single(result.Descendants);
            Assert.Equal(UserRoleEnum.Seller, child.Role);
            Assert.Equal(UserNetworkStatusEnum.WaitForApproval, child.Status);
            Assert.Null(child.Name);
            Assert.Null(child.ProfileName);

            // Name resolution was invoked through the NAuth client for both distinct members.
            _userClient.Verify(c => c.GetByIdAsync(10, Token), Times.AtLeastOnce);
            _userClient.Verify(c => c.GetByIdAsync(101, Token), Times.AtLeastOnce);
        }
    }
}

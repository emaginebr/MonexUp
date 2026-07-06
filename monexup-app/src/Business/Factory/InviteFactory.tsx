import ServiceFactory from '../../Services/ServiceFactory';
import InviteBusiness from '../Impl/InviteBusiness';
import IInviteBusiness from '../Interfaces/IInviteBusiness';

const inviteService = ServiceFactory.InviteService;

const inviteBusinessImpl: IInviteBusiness = InviteBusiness;
inviteBusinessImpl.init(inviteService);

const InviteFactory = {
  InviteBusiness: inviteBusinessImpl
};

export default InviteFactory;
